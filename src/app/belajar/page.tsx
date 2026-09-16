"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Check,
  Crown,
  Hand,
  Lightbulb,
  LogOut,
  MonitorPlay,
  NotebookPen,
  Send,
  Target,
  Trophy,
  Users,
  Wrench,
  X,
} from "lucide-react";
import MathView from "@/components/MathView";
import CartesianCanvas from "@/components/CartesianCanvas";
import { makeQuestion, type Question } from "@/lib/generator";
import { buildGraphScene } from "@/lib/scene";
import { LEVELS, TOTAL_LEVELS, getSub, type LevelDef, type MateriBlock } from "@/lib/levels";

type SessionInfo = { studentKey: string; name: string; isAdmin?: boolean };
type Prog = {
  level: number;
  results: boolean[];
  consecutiveErrors: number;
  totalCorrect: number;
  totalAnswered: number;
  tuntas: boolean;
};
type TutorAlert = { id: number; message: string };
type Classmate = {
  key: string;
  name: string;
  level: number;
  status: string;
  isTutor: boolean;
  isMe: boolean;
  online: boolean;
};
type Phase = "materi" | "contoh" | "latih";

const buzz = (ms: number) => {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* abaikan */
  }
};

export default function BelajarPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [prog, setProg] = useState<Prog | null>(null);
  const [q, setQ] = useState<Question | null>(null);
  const [phase, setPhase] = useState<Phase>("materi");
  const [viewLevel, setViewLevel] = useState(1); // level materi yang sedang dibaca
  const [contohIdx, setContohIdx] = useState(0);
  const [contohStep, setContohStep] = useState(0);

  const [inputVals, setInputVals] = useState<Record<string, string>>({});
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [manualHint, setManualHint] = useState(0);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // pembahasan setelah jawaban benar
  const [review, setReview] = useState(false);
  const [pendingLevelUp, setPendingLevelUp] = useState<number | null>(null);
  const [levelUp, setLevelUp] = useState<number | null>(null);

  const [locked, setLocked] = useState(false);
  const [incoming, setIncoming] = useState<TutorAlert[]>([]);
  const [kelas, setKelas] = useState<Classmate[]>([]);
  const [kelasOpen, setKelasOpen] = useState(false);
  const [calling, setCalling] = useState(false);

  const seenRef = useRef<Set<string>>(new Set());

  // ── Boot ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const raw = localStorage.getItem("kartesia:session");
    if (!raw) {
      router.replace("/");
      return;
    }
    const s = JSON.parse(raw) as SessionInfo;
    setSession(s);
    fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(s),
    })
      .then((r) => r.json())
      .then((d) => {
        const st = d.student;
        const adminMode = !!d.isAdmin;
        const lv = adminMode ? 1 : Math.min(Math.max(st.level ?? 1, 1), TOTAL_LEVELS);
        const p: Prog = {
          level: lv,
          results: [],
          consecutiveErrors: st.consecutiveErrors ?? 0,
          totalCorrect: st.totalCorrect ?? 0,
          totalAnswered: st.totalAnswered ?? 0,
          tuntas: st.status === "TUNTAS",
        };
        setProg(p);
        setViewLevel(lv);
        if (p.tuntas) return;
        if (localStorage.getItem(`kartesia:materi:${lv}`) === "1") {
          setPhase("latih");
          setQ(freshQuestion(lv));
        } else {
          setPhase("materi");
        }
      })
      .catch(() => router.replace("/"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Polling ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!session) return;
    let stop = false;
    const tick = async () => {
      try {
        const res = await fetch(`/api/poll?key=${encodeURIComponent(session.studentKey)}`);
        const d = await res.json();
        if (stop) return;
        setLocked(!!d.isLocked);
        setIncoming(d.alerts ?? []);
        setKelas(d.kelas ?? []);
      } catch {
        /* diamkan */
      }
    };
    tick();
    const iv = setInterval(tick, 4000);
    return () => {
      stop = true;
      clearInterval(iv);
    };
  }, [session]);

  // ── Soal baru yang belum pernah keluar ───────────────────────────────────
  const freshQuestion = (level: number): Question => {
    let cand = makeQuestion(level);
    for (let i = 0; i < 60 && seenRef.current.has(cand.sig); i++) {
      cand = makeQuestion(level);
    }
    seenRef.current.add(cand.sig);
    return cand;
  };

  const loadQuestion = (level: number) => {
    setQ(freshQuestion(level));
    setInputVals({});
    setSelectedChoice(null);
    setManualHint(0);
    setErrMsg(null);
    setReview(false);
  };

  const sendTelemetry = (pAfter: Prog, ok: boolean, detail: string) => {
    if (!session || !q) return;
    fetch("/api/telemetry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentKey: session.studentKey,
        name: session.name,
        isAdmin: !!session.isAdmin,
        qLevel: q.level,
        qSubId: q.subId,
        subTitle: q.subTitle,
        isCorrect: ok,
        consecutiveErrors: pAfter.consecutiveErrors,
        curLevel: pAfter.level,
        curSubIndex: 0,
        totalCorrect: pAfter.totalCorrect,
        totalAnswered: pAfter.totalAnswered,
        errorDetail: detail,
        tuntas: pAfter.tuntas,
      }),
    }).catch(() => {});
  };

  // ── Penilaian ────────────────────────────────────────────────────────────
  const evaluate = (ok: boolean, detail: string) => {
    if (!prog || !q || review) return;
    const { levelDef } = getSub(prog.level);
    const p: Prog = { ...prog, results: [...prog.results, ok].slice(-levelDef.passWindow) };
    p.totalAnswered++;
    if (ok) {
      p.totalCorrect++;
      p.consecutiveErrors = 0;
    } else {
      p.consecutiveErrors++;
    }
    const lulus =
      p.results.length >= levelDef.passWindow &&
      p.results.filter(Boolean).length >= levelDef.passCorrect;

    let naik: number | null = null;
    if (lulus) {
      p.results = [];
      if (p.level < TOTAL_LEVELS) {
        p.level++;
        naik = p.level;
      } else {
        p.tuntas = true;
      }
    }
    setProg(p);
    sendTelemetry(p, ok, detail);

    if (ok) {
      buzz(20);
      setPendingLevelUp(naik);
      setReview(true); // tampilkan pembahasan dulu
      setErrMsg(null);
    } else {
      buzz(50);
      setErrMsg(
        detail === "sebagian"
          ? "Ada bagian yang belum tepat. Periksa kembali, lalu kirim ulang."
          : "Jawabanmu belum tepat. Baca petunjuk bertahap di bawah, lalu coba lagi."
      );
      if (p.results.length >= levelDef.passWindow && !lulus) {
        p.results = [];
        setProg({ ...p });
      }
    }
  };

  const lanjut = () => {
    if (!prog) return;
    setReview(false);
    if (prog.tuntas) return;
    if (pendingLevelUp) {
      const n = pendingLevelUp;
      setPendingLevelUp(null);
      setLevelUp(n);
    } else {
      loadQuestion(prog.level);
    }
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const submit = () => {
    if (!q || review) return;
    // 1) cek input
    if (q.inputs) {
      for (const inp of q.inputs) {
        const v = (inputVals[inp.key] ?? "").trim();
        if (v === "" || Number.isNaN(Number(v))) {
          setErrMsg("Isi semua kotak jawaban dulu ya.");
          return;
        }
      }
    }
    // 2) cek pilihan
    if (q.choices && q.answerChoice && !selectedChoice) {
      setErrMsg("Pilih salah satu jawaban dulu.");
      return;
    }

    let benar = true;
    if (q.inputs) {
      if (q.elimCheck) {
        // pengali eliminasi lentur: cukup membuat koefisien sama besar
        const m1 = Number(inputVals["m1"]);
        const m2 = Number(inputVals["m2"]);
        benar =
          Number.isInteger(m1) &&
          Number.isInteger(m2) &&
          m1 >= 1 &&
          m2 >= 1 &&
          m1 * Math.abs(q.elimCheck.k1) === m2 * Math.abs(q.elimCheck.k2);
      } else {
        benar = q.inputs.every(
          (inp) => Number((inputVals[inp.key] ?? "").trim()) === inp.answer
        );
      }
    }
    if (benar && q.choices && q.answerChoice) {
      benar = selectedChoice === q.answerChoice;
    }
    evaluate(benar, benar ? "" : "sebagian");
  };

  // ── Tutor ────────────────────────────────────────────────────────────────
  const callTutor = async () => {
    if (!session || !q || calling) return;
    setCalling(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentKey: session.studentKey, subId: q.subId, subTitle: q.subTitle }),
      });
      const d = await res.json();
      setErrMsg(
        d.alert?.tutorName
          ? `Sinyal terkirim ke HP ${d.alert.tutorName}. Tutor mejamu akan menghampiri.`
          : "Belum ada tutor di mejamu. Sinyal tampil di dasbor guru."
      );
    } catch {
      setErrMsg("Gagal mengirim sinyal. Coba lagi.");
    } finally {
      setCalling(false);
    }
  };

  const ackAlert = async (id: number) => {
    setIncoming((arr) => arr.filter((a) => a.id !== id));
    await fetch("/api/alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => {});
  };

  const logout = () => {
    localStorage.removeItem("kartesia:session");
    router.replace("/");
  };

  const mulaiLatihan = () => {
    if (!prog) return;
    localStorage.setItem(`kartesia:materi:${prog.level}`, "1");
    setViewLevel(prog.level);
    setPhase("latih");
    if (!q || q.level !== prog.level) loadQuestion(prog.level);
  };

  const bukaMateri = (lv?: number) => {
    if (!prog) return;
    setViewLevel(lv ?? prog.level);
    setContohIdx(0);
    setContohStep(0);
    setPhase("materi");
  };

  // ── Turunan ──────────────────────────────────────────────────────────────
  const isAdmin = !!session?.isAdmin;
  const unlocked = isAdmin ? TOTAL_LEVELS : prog?.level ?? 1;
  const levelDef: LevelDef | null = prog ? getSub(prog.level).levelDef : null;
  const viewDef: LevelDef | null = prog ? getSub(viewLevel).levelDef : null;
  const hintShown = Math.max(manualHint, Math.min(prog?.consecutiveErrors ?? 0, 3));

  if (!session || !prog) {
    return (
      <main className="grid min-h-dvh place-items-center">
        <div className="size-8 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-2 border-b border-zinc-200 bg-zinc-50/90 px-4 py-3 backdrop-blur">
        <div className="min-w-0">
          <p className="truncate font-display text-[13px] font-bold leading-tight">{session.name}</p>
          <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-zinc-500">
            {session.isAdmin ? "Mode Admin · Semua level terbuka" : "Siswa"}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setKelasOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-zinc-900 bg-white px-3 py-1.5 text-[11px] font-semibold"
          >
            <Users className="size-3.5" />
            KELAS
          </button>
          <button
            onClick={logout}
            className="grid size-8 place-items-center rounded-full border border-zinc-300 bg-white text-zinc-500 hover:border-zinc-900 hover:text-zinc-900"
            aria-label="Keluar"
          >
            <LogOut className="size-3.5" />
          </button>
        </div>
      </header>

      {/* ── Posisi belajar ── */}
      <section className="border-b border-zinc-200 bg-white px-4 py-3">
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold leading-none tracking-tight">
              LV {prog.level}
            </span>
            <span className="text-[11.5px] font-medium text-zinc-600">{levelDef?.title}</span>
          </div>
          <button
            onClick={() => bukaMateri()}
            className="flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-[10.5px] font-bold hover:border-zinc-900"
          >
            <BookOpen className="size-3.5" />
            MATERI
          </button>
        </div>
        {levelDef && phase === "latih" && !prog.tuntas && (
          <div className="mt-2 flex items-center gap-1.5">
            {Array.from({ length: levelDef.passWindow }).map((_, i) => {
              const r = prog.results[i];
              return (
                <span
                  key={i}
                  className={`size-2.5 rounded-full border border-zinc-900 ${
                    r === undefined ? "bg-white" : r ? "bg-zinc-900" : "dot-wrong bg-white"
                  }`}
                />
              );
            })}
            <span className="ml-1 font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-400">
              {levelDef.passCorrect} dari {levelDef.passWindow} benar untuk lanjut
            </span>
          </div>
        )}
        <div className="no-scrollbar -mx-1 mt-2.5 flex gap-1 overflow-x-auto px-1 pb-0.5">
          {LEVELS.map((l) => (
            <button
              key={l.level}
              onClick={() => l.level <= unlocked && bukaMateri(l.level)}
              disabled={l.level > unlocked}
              className={`grid size-6 shrink-0 place-items-center rounded-full border font-mono text-[9.5px] font-bold ${
                l.level === prog.level
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : l.level <= unlocked
                    ? "border-zinc-900 bg-white text-zinc-900"
                    : "border-zinc-200 bg-white text-zinc-300"
              }`}
            >
              {!isAdmin && (l.level < prog.level || prog.tuntas) ? (
                <Check className="size-3" strokeWidth={3} />
              ) : (
                l.level
              )}
            </button>
          ))}
        </div>
      </section>

      {/* ── Isi ── */}
      <section className="flex-1 space-y-3.5 px-4 py-4 pb-40">
        {review && q ? (
          <ReviewPanel q={q} onNext={lanjut} tuntas={prog.tuntas} />
        ) : prog.tuntas ? (
          <TuntasPanel prog={prog} onRestart={() => {
            setProg({ ...prog, level: 1, results: [], tuntas: false, consecutiveErrors: 0 });
            setViewLevel(1);
            setPhase("materi");
          }} />
        ) : phase === "materi" && viewDef ? (
          <MateriView
            def={viewDef}
            unlocked={unlocked}
            onPick={(lv) => {
              setViewLevel(lv);
              setContohIdx(0);
              setContohStep(0);
            }}
            onNext={() => {
              setContohIdx(0);
              setContohStep(0);
              setPhase("contoh");
            }}
          />
        ) : phase === "contoh" && viewDef ? (
          <ContohView
            def={viewDef}
            idx={contohIdx}
            step={contohStep}
            setStep={setContohStep}
            onPrevPhase={() => setPhase("materi")}
            onNextContoh={() => {
              setContohIdx(contohIdx + 1);
              setContohStep(0);
            }}
            onStart={() => {
              if (isAdmin && viewLevel !== prog.level) {
                setProg({ ...prog, level: viewLevel, results: [], consecutiveErrors: 0 });
                localStorage.setItem(`kartesia:materi:${viewLevel}`, "1");
                setPhase("latih");
                loadQuestion(viewLevel);
              } else if (viewLevel !== prog.level) {
                setViewLevel(prog.level);
                setPhase("materi");
              } else {
                mulaiLatihan();
              }
            }}
            sameLevel={viewLevel === prog.level || isAdmin}
          />
        ) : (
          q && (
            <>
              <div className="rounded-3xl border border-zinc-900 bg-white p-4 shadow-[0_3px_0_0_rgba(24,24,27,1)]">
                <p className="text-[13px] font-medium leading-relaxed">{q.prompt}</p>
                {q.lines && (
                  <div className="mt-3 rounded-2xl bg-zinc-100 px-3 py-3">
                    <MathView lines={q.lines} />
                  </div>
                )}
              </div>

              {/* input */}
              {q.inputs && (
                <div
                  className={`grid gap-2 ${
                    q.inputs.length >= 3 ? "grid-cols-3" : q.inputs.length === 2 ? "grid-cols-2" : "grid-cols-1"
                  }`}
                >
                  {q.inputs.map((inp) => (
                    <label
                      key={inp.key}
                      className="block rounded-2xl border border-zinc-300 bg-white p-3 focus-within:border-zinc-900"
                    >
                      <span className="block truncate font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">
                        {inp.label}
                      </span>
                      <input
                        value={inputVals[inp.key] ?? ""}
                        onChange={(e) =>
                          setInputVals((v) => ({ ...v, [inp.key]: e.target.value.replace(/[^0-9-]/g, "") }))
                        }
                        inputMode="numeric"
                        placeholder="…"
                        className="mt-1 w-full bg-transparent text-center font-mono text-xl font-bold outline-none placeholder:text-zinc-300"
                      />
                    </label>
                  ))}
                </div>
              )}

              {/* pilihan */}
              {q.choices && (
                <div className="space-y-2">
                  {q.choiceLabel && (
                    <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-zinc-500">
                      {q.choiceLabel}
                    </p>
                  )}
                  <div className={`grid gap-2 ${q.choices.length > 2 ? "grid-cols-1" : "grid-cols-2"}`}>
                    {q.choices.map((c) => {
                      const sel = selectedChoice === c.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() => setSelectedChoice(sel ? null : c.id)}
                          className={`rounded-2xl border p-3.5 text-left transition-all ${
                            sel
                              ? "border-zinc-900 bg-zinc-900 text-white"
                              : "border-zinc-300 bg-white hover:border-zinc-900 active:scale-[0.99]"
                          }`}
                        >
                          <span className="flex items-center justify-between gap-2">
                            <span className="text-[12.5px] font-bold leading-snug">{c.label}</span>
                            <span
                              className={`grid size-4 shrink-0 place-items-center rounded-full border ${
                                sel ? "border-white bg-white" : "border-zinc-300"
                              }`}
                            >
                              {sel && <span className="size-2 rounded-full bg-zinc-900" />}
                            </span>
                          </span>
                          {c.lines && (
                            <span
                              className={`mt-2 block rounded-xl px-2 py-2 ${
                                sel ? "bg-white/10" : "bg-zinc-100"
                              }`}
                            >
                              <MathView lines={c.lines} size="sm" tone={sel ? "dark" : "light"} />
                            </span>
                          )}
                          {c.desc && (
                            <span
                              className={`mt-0.5 block text-[10.5px] ${sel ? "text-zinc-300" : "text-zinc-500"}`}
                            >
                              {c.desc}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                onClick={submit}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-3.5 text-sm font-bold text-white active:scale-[0.98]"
              >
                KIRIM JAWABAN
                <Send className="size-4" strokeWidth={2.4} />
              </button>

              {errMsg && (
                <div className="flex items-start gap-2.5 rounded-2xl border border-zinc-900 bg-zinc-900 px-3.5 py-3 text-[12.5px] font-medium leading-snug text-white">
                  <X className="mt-0.5 size-4 shrink-0" strokeWidth={2.6} />
                  {errMsg}
                </div>
              )}

              {prog.consecutiveErrors >= 2 && (
                <button
                  onClick={callTutor}
                  disabled={calling}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-900 bg-white py-3.5 text-[13px] font-bold active:scale-[0.99]"
                >
                  <Hand className="size-4" strokeWidth={2.2} />
                  {calling ? "MENGIRIM SINYAL…" : "MINTA BANTUAN TUTOR MEJAMU"}
                </button>
              )}

              {/* petunjuk */}
              <div className="rounded-3xl border border-zinc-300 bg-white p-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    <Lightbulb className="size-3.5" />
                    Petunjuk Bertahap
                  </span>
                  <span className="font-mono text-[10px] text-zinc-400">H{hintShown}/3</span>
                </div>
                <div className="mt-2.5 space-y-2">
                  {q.hints.slice(0, hintShown).map((h, i) => (
                    <div key={i} className="flex gap-2.5 rounded-xl bg-zinc-100 px-3 py-2.5">
                      <span className="font-mono text-[10px] font-bold text-zinc-500">H{i + 1}</span>
                      <p className="text-[12px] leading-relaxed text-zinc-700">{h}</p>
                    </div>
                  ))}
                  {hintShown === 0 && (
                    <p className="text-[11.5px] text-zinc-400">
                      Coba sendiri dulu. Petunjuk terbuka berjenjang bila kamu membutuhkannya.
                    </p>
                  )}
                </div>
                {hintShown < 3 && (
                  <button
                    onClick={() => setManualHint((h) => Math.min(h + 1, 3))}
                    className="mt-3 w-full rounded-xl border border-zinc-300 py-2.5 text-[12px] font-bold hover:border-zinc-900"
                  >
                    Buka Petunjuk H{hintShown + 1}
                  </button>
                )}
              </div>
            </>
          )
        )}
      </section>

      {/* ── Bar bawah ── */}
      {!prog.tuntas && phase === "latih" && !review && (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 backdrop-blur">
          <div className="mx-auto grid max-w-md grid-cols-3 gap-2 px-4 py-3">
            <button
              onClick={() => setManualHint((h) => Math.min(h + 1, 3))}
              className="flex flex-col items-center gap-1 rounded-2xl border border-zinc-300 bg-white py-2.5 text-[10px] font-bold"
            >
              <Lightbulb className="size-4" />
              PETUNJUK
            </button>
            <button
              onClick={callTutor}
              disabled={calling}
              className="flex flex-col items-center gap-1 rounded-2xl border border-zinc-900 bg-zinc-900 py-2.5 text-[10px] font-bold text-white"
            >
              <Hand className="size-4" />
              PANGGIL TUTOR
            </button>
            <button
              onClick={() => bukaMateri()}
              className="flex flex-col items-center gap-1 rounded-2xl border border-zinc-300 bg-white py-2.5 text-[10px] font-bold"
            >
              <BookOpen className="size-4" />
              MATERI
            </button>
          </div>
        </nav>
      )}

      {/* ── Naik level ── */}
      {levelUp && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-zinc-900/95 px-6 text-white">
          <div className="w-full max-w-sm text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-400">
              Blok tuntas — kamu naik ke
            </p>
            <p className="mt-2 font-display text-6xl font-bold tracking-tight">LEVEL {levelUp}</p>
            <p className="mt-2 text-lg font-semibold">{getSub(levelUp).levelDef.title}</p>
            <p className="mt-1 text-[12.5px] text-zinc-400">{getSub(levelUp).levelDef.tagline}</p>
            <button
              onClick={() => {
                const n = levelUp;
                setLevelUp(null);
                setViewLevel(n);
                setContohIdx(0);
                setContohStep(0);
                setPhase("materi");
              }}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-sm font-bold text-zinc-900 active:scale-[0.98]"
            >
              <BookOpen className="size-4" />
              BUKA MATERI LEVEL {levelUp}
            </button>
          </div>
        </div>
      )}

      {/* ── Alert tutor ── */}
      {incoming.length > 0 && !locked && (
        <div className="fixed inset-0 z-[65] grid place-items-center bg-white/94 px-6">
          <div className="w-full max-w-sm rounded-3xl border-2 border-zinc-900 bg-white p-5 shadow-[0_4px_0_0_rgba(24,24,27,1)]">
            <div className="flex items-center gap-2">
              <div className="grid size-9 place-items-center rounded-full bg-zinc-900 text-white">
                <Hand className="size-4" strokeWidth={2.2} />
              </div>
              <div>
                <p className="font-display text-sm font-bold">Panggilan Tutor Sebaya</p>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-400">
                  Kamu tutor kelas saat ini
                </p>
              </div>
            </div>
            <p className="mt-3.5 text-[13px] leading-relaxed">{incoming[0].message}</p>
            <button
              onClick={() => ackAlert(incoming[0].id)}
              className="mt-4 w-full rounded-2xl bg-zinc-900 py-3 text-sm font-bold text-white active:scale-[0.98]"
            >
              SIAP, SAYA BANTU
            </button>
          </div>
        </div>
      )}

      {/* ── Status meja ── */}
      {kelasOpen && (
        <div className="fixed inset-0 z-[55] flex items-end bg-zinc-900/40" onClick={() => setKelasOpen(false)}>
          <div
            className="w-full rounded-t-3xl border-t-2 border-zinc-900 bg-white px-4 pb-8 pt-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto h-1 w-10 rounded-full bg-zinc-300" />
            <p className="mt-4 font-display text-base font-bold">Kelasku</p>
            <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-zinc-400">
              Posisi belajar teman sekelas
            </p>
            <div className="mt-3 space-y-2">
              {kelas.length === 0 && (
                <p className="py-4 text-center text-[12px] text-zinc-400">
                  Belum ada teman yang masuk.
                </p>
              )}
              {kelas.map((m) => (
                <div
                  key={m.key}
                  className={`flex items-center justify-between rounded-2xl border px-3.5 py-2.5 ${
                    m.isMe ? "border-zinc-900 bg-zinc-100" : "border-zinc-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`size-2 rounded-full ${m.online ? "bg-zinc-900" : "bg-zinc-300"}`} />
                    <div>
                      <p className="flex items-center gap-1.5 text-[12.5px] font-bold">
                        {m.name}
                        {m.isTutor && <Crown className="size-3.5" strokeWidth={2.4} />}
                      </p>
                      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">
                        {m.isTutor ? "Tutor Kelas" : m.status}
                        {m.isMe ? " · Kamu" : ""}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full border border-zinc-900 px-2.5 py-1 font-mono text-[10px] font-bold">
                    LV {m.level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Focus lock ── */}
      {locked && (
        <div className="paper-grid fixed inset-0 z-[70] grid place-items-center bg-white px-8">
          <div className="flex max-w-sm flex-col items-center text-center">
            <div className="relative grid place-items-center">
              <span className="absolute size-40 rounded-full border-2 border-zinc-900 animate-pulse-ring" />
              <div className="grid size-28 place-items-center rounded-full border-2 border-zinc-900 bg-white">
                <MonitorPlay className="size-11" strokeWidth={1.6} />
              </div>
            </div>
            <h2 className="mt-8 font-display text-[26px] font-bold leading-tight tracking-tight">
              SAATNYA DISKUSI KELAS
            </h2>
            <p className="mt-3 text-[13.5px] leading-relaxed text-zinc-600">
              Letakkan HP-mu di atas meja menghadap ke bawah. Perhatikan penjelasan Guru di layar proyektor.
            </p>
            <div className="mt-6 flex items-center gap-2 rounded-full border border-zinc-900 px-4 py-2">
              <span className="size-2 rounded-full bg-zinc-900 animate-blink-dot" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em]">
                Sesi Konfirmasi Guru
              </span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// ═══ PEMBAHASAN setelah jawaban benar ══════════════════════════════════════
function ReviewPanel({ q, onNext, tuntas }: { q: Question; onNext: () => void; tuntas: boolean }) {
  return (
    <div className="space-y-3.5">
      <div className="flex items-center gap-3 rounded-3xl border border-zinc-900 bg-zinc-900 px-4 py-4 text-white">
        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-zinc-900">
          <Check className="size-5" strokeWidth={3} />
        </div>
        <div>
          <p className="font-display text-lg font-bold leading-none">JAWABAN BENAR</p>
          <p className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.2em] text-zinc-400">
            Baca pembahasannya dulu
          </p>
        </div>
      </div>

      {q.lines && (
        <div className="rounded-2xl border border-zinc-200 bg-white px-3 py-3">
          <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">Soal</p>
          <MathView lines={q.lines} size="sm" />
        </div>
      )}

      <div className="space-y-2">
        {q.solutionSteps.map((s, i) => (
          <div key={i} className="rounded-2xl border border-zinc-200 bg-white px-3.5 py-3">
            <div className="flex gap-2.5">
              <span className="grid size-5 shrink-0 place-items-center rounded-md bg-zinc-900 font-mono text-[10px] font-bold text-white">
                {i + 1}
              </span>
              <p className="text-[12.5px] leading-relaxed">{s.text}</p>
            </div>
            {s.lines && (
              <div className="mt-2.5 rounded-xl bg-zinc-100 px-3 py-2.5">
                <MathView lines={s.lines} size="sm" />
              </div>
            )}
          </div>
        ))}
      </div>

      {q.graph && (
        <div>
          <CartesianCanvas scene={buildGraphScene(q.graph.l1, q.graph.l2, q.graph.p)} />
          <p className="mt-1.5 text-center text-[11px] text-zinc-500">
            Secara grafik, penyelesaian adalah titik potong kedua garis.
          </p>
        </div>
      )}

      <div className="rounded-2xl bg-zinc-900 px-4 py-4 text-white">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-400">Kesimpulan</p>
        <p className="mt-1.5 text-[13px] font-medium leading-relaxed">{q.solution}</p>
      </div>

      <button
        onClick={onNext}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-3.5 text-sm font-bold text-white active:scale-[0.98]"
      >
        {tuntas ? "SELESAI" : "LANJUT"}
        <ArrowRight className="size-4" strokeWidth={2.4} />
      </button>
    </div>
  );
}

// ═══ MATERI ════════════════════════════════════════════════════════════════
function MateriView({
  def,
  unlocked,
  onPick,
  onNext,
}: {
  def: LevelDef;
  unlocked: number;
  onPick: (lv: number) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-3.5">
      {/* navigasi materi level sebelumnya */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-3">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">
          Buka materi level
        </p>
        <div className="no-scrollbar mt-2 flex gap-1.5 overflow-x-auto">
          {LEVELS.filter((l) => l.level <= unlocked).map((l) => (
            <button
              key={l.level}
              onClick={() => onPick(l.level)}
              className={`shrink-0 rounded-full border px-3 py-1.5 font-mono text-[10.5px] font-bold ${
                l.level === def.level
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-300 bg-white text-zinc-600"
              }`}
            >
              {l.level}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-900 bg-white p-5 shadow-[0_3px_0_0_rgba(24,24,27,1)]">
        <p className="font-mono text-[9.5px] uppercase tracking-[0.24em] text-zinc-500">
          Materi · Level {def.level}
        </p>
        <h2 className="mt-1 font-display text-[22px] font-bold leading-tight tracking-tight">
          {def.materiTitle}
        </h2>

        <div className="mt-4 space-y-2.5">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-3.5 py-3">
            <p className="flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              <Target className="size-3.5" />
              Tujuan Belajar
            </p>
            <p className="mt-1 text-[12.5px] leading-relaxed">{def.tujuan}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-3.5 py-3">
            <p className="flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              <Wrench className="size-3.5" />
              Dipakai Untuk Apa
            </p>
            <p className="mt-1 text-[12.5px] leading-relaxed">{def.kegunaan}</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {def.materi.map((b, i) => (
            <Blok key={i} block={b} />
          ))}
        </div>
      </div>

      <button
        onClick={onNext}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-3.5 text-sm font-bold text-white active:scale-[0.98]"
      >
        LANJUT KE CONTOH SOAL
        <ArrowRight className="size-4" strokeWidth={2.4} />
      </button>
    </div>
  );
}

function Blok({ block }: { block: MateriBlock }) {
  if (block.kind === "rule")
    return (
      <div className="rounded-2xl bg-zinc-900 px-4 py-3.5 text-white">
        {block.title && (
          <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
            {block.title}
          </p>
        )}
        <p className="mt-1 text-[12.5px] font-medium leading-relaxed">{block.text}</p>
      </div>
    );
  if (block.kind === "def")
    return (
      <div className="rounded-2xl border-l-4 border-zinc-900 bg-zinc-50 px-3.5 py-3">
        <p className="font-display text-[13px] font-bold">{block.term}</p>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-zinc-700">{block.text}</p>
      </div>
    );
  if (block.kind === "math")
    return (
      <div className="rounded-2xl border border-zinc-200 bg-zinc-100 px-3 py-3.5">
        {block.title && (
          <p className="mb-2 text-center font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-500">
            {block.title}
          </p>
        )}
        <MathView lines={block.lines} />
      </div>
    );
  if (block.kind === "steps")
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3.5">
        {block.title && (
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-500">{block.title}</p>
        )}
        <ol className="mt-2 space-y-2">
          {block.items.map((it, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="grid size-5 shrink-0 place-items-center rounded-md bg-zinc-900 font-mono text-[10px] font-bold text-white">
                {i + 1}
              </span>
              <span className="text-[12.5px] leading-relaxed">{it}</span>
            </li>
          ))}
        </ol>
      </div>
    );
  if (block.kind === "note")
    return (
      <div className="rounded-2xl border-2 border-dashed border-zinc-900 bg-white px-4 py-3.5">
        <p className="flex items-center gap-1.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.22em]">
          <NotebookPen className="size-3.5" />
          Catat di buku tulismu
        </p>
        <p className="mt-1.5 text-[12.5px] font-medium leading-relaxed">{block.text}</p>
      </div>
    );
  return <p className="text-[12.5px] leading-relaxed text-zinc-700">{block.text}</p>;
}

// ═══ CONTOH SOAL ═══════════════════════════════════════════════════════════
function ContohView({
  def,
  idx,
  step,
  setStep,
  onPrevPhase,
  onNextContoh,
  onStart,
  sameLevel,
}: {
  def: LevelDef;
  idx: number;
  step: number;
  setStep: (n: number) => void;
  onPrevPhase: () => void;
  onNextContoh: () => void;
  onStart: () => void;
  sameLevel: boolean;
}) {
  const i = Math.min(idx, def.examples.length - 1);
  const ex = def.examples[i];
  const total = ex.steps.length;
  const adaLagi = i < def.examples.length - 1;
  return (
    <div className="space-y-3.5">
      <button
        onClick={onPrevPhase}
        className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 underline-offset-4 hover:text-zinc-900 hover:underline"
      >
        Kembali ke materi
      </button>

      <div className="rounded-3xl border border-zinc-900 bg-white p-5 shadow-[0_3px_0_0_rgba(24,24,27,1)]">
        <p className="font-mono text-[9.5px] uppercase tracking-[0.24em] text-zinc-500">
          {ex.title} · Level {def.level}
        </p>
        <p className="mt-2 text-[13.5px] font-medium leading-relaxed">{ex.question}</p>
        {ex.qLines && (
          <div className="mt-3 rounded-2xl bg-zinc-100 px-3 py-3">
            <MathView lines={ex.qLines} />
          </div>
        )}
      </div>

      <div className="space-y-2">
        {ex.steps.slice(0, step).map((s, k) => (
          <div key={k} className="rounded-2xl border border-zinc-200 bg-white px-3.5 py-3">
            <div className="flex gap-2.5">
              <span className="grid size-5 shrink-0 place-items-center rounded-md bg-zinc-900 font-mono text-[10px] font-bold text-white">
                {k + 1}
              </span>
              <p className="text-[12.5px] leading-relaxed">{s.text}</p>
            </div>
            {s.lines && (
              <div className="mt-2.5 rounded-xl bg-zinc-100 px-3 py-2.5">
                <MathView lines={s.lines} size="sm" />
              </div>
            )}
          </div>
        ))}
      </div>

      {step < total ? (
        <button
          onClick={() => setStep(step + 1)}
          className="w-full rounded-2xl border border-zinc-300 bg-white py-3 text-[12.5px] font-bold hover:border-zinc-900"
        >
          Tampilkan Langkah {step + 1} dari {total}
        </button>
      ) : (
        <>
          <div className="rounded-2xl bg-zinc-900 px-4 py-4 text-white">
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-400">Jawaban</p>
            <p className="mt-1.5 text-[13px] font-medium leading-relaxed">{ex.answer}</p>
          </div>
          {adaLagi && (
            <button
              onClick={onNextContoh}
              className="w-full rounded-2xl border border-zinc-300 bg-white py-3 text-[12.5px] font-bold hover:border-zinc-900"
            >
              Lihat Contoh Berikutnya
            </button>
          )}
          <button
            onClick={onStart}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-3.5 text-sm font-bold text-white active:scale-[0.98]"
          >
            <Check className="size-4" strokeWidth={2.6} />
            {sameLevel ? "MULAI LATIHAN" : "KEMBALI KE LEVELKU"}
          </button>
        </>
      )}
    </div>
  );
}

// ═══ TUNTAS ════════════════════════════════════════════════════════════════
function TuntasPanel({ prog, onRestart }: { prog: Prog; onRestart: () => void }) {
  return (
    <div className="rounded-3xl border border-zinc-900 bg-white p-6 text-center shadow-[0_3px_0_0_rgba(24,24,27,1)]">
      <div className="mx-auto grid size-14 place-items-center rounded-full border-2 border-zinc-900">
        <Trophy className="size-6" strokeWidth={1.8} />
      </div>
      <h2 className="mt-4 font-display text-2xl font-bold tracking-tight">
        {TOTAL_LEVELS} Langkah Tuntas
      </h2>
      <p className="mx-auto mt-2 max-w-[30ch] text-[12.5px] leading-relaxed text-zinc-600">
        Luar biasa. Kamu menuntaskan seluruh jalur SPLDV, dari mengenali bentuk umum sampai soal cerita
        dengan metode gabungan.
      </p>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
        {prog.totalCorrect} benar dari {prog.totalAnswered} percobaan
      </p>
      <button
        onClick={onRestart}
        className="mt-5 w-full rounded-2xl bg-zinc-900 py-3 text-sm font-bold text-white active:scale-[0.98]"
      >
        Ulangi dari Level 1
      </button>
    </div>
  );
}
