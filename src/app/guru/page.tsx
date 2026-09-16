"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  ArrowLeft,
  BookOpen,
  Crown,
  Lock,
  MonitorPlay,
  Presentation,
  TriangleAlert,
  Unlock,
  Users,
  X,
} from "lucide-react";
import MathView from "@/components/MathView";
import CartesianCanvas from "@/components/CartesianCanvas";
import { makeQuestion, type Question } from "@/lib/generator";
import { buildGraphScene } from "@/lib/scene";
import { LEVELS, getSub } from "@/lib/levels";

type Student = {
  studentKey: string;
  name: string;
  level: number;
  status: string;
  consecutiveErrors: number;
  totalCorrect: number;
  totalAnswered: number;
  lastActiveAt: string;
};
type Hotspot = { subId: string; level: number; errors: number; students: number };
type OpenAlert = {
  id: number;
  fromName: string;
  tutorName: string | null;
  level: number;
  subId: string;
  subTitle: string;
  kind: string;
  createdAt: string;
};
type Data = {
  isLocked: boolean;
  students: Student[];
  openAlerts: OpenAlert[];
  hotspots: Hotspot[];
  dist: { level: number; count: number }[];
  totals: {
    students: number;
    active: number;
    stuck: number;
    submissions: number;
    accuracy: number;
  };
};

function findSub(subId: string): { level: number; subIndex: number } {
  const [l, s] = subId.split(".").map(Number);
  const li = Math.min(Math.max(l || 1, 1), LEVELS.length);
  const levelDef = LEVELS[li - 1];
  const si = Math.min(Math.max((s || 1) - 1, 0), levelDef.subs.length - 1);
  return { level: li, subIndex: si };
}

export default function GuruPage() {
  const [data, setData] = useState<Data | null>(null);
  const [toggling, setToggling] = useState(false);
  const [caseQ, setCaseQ] = useState<Question | null>(null);
  const [caseHints, setCaseHints] = useState(0);
  const [showKey, setShowKey] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const d = await res.json();
      if (d.ok) {
        setData(d);
        setLastSync(new Date());
      }
    } catch {
      /* abaikan */
    }
  };

  useEffect(() => {
    load();
    const iv = setInterval(load, 5000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleLock = async () => {
    if (!data || toggling) return;
    setToggling(true);
    try {
      await fetch("/api/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLocked: !data.isLocked }),
      });
      await load();
    } finally {
      setToggling(false);
    }
  };

  const openCase = (subId: string) => {
    const { level } = findSub(subId);
    setCaseQ(makeQuestion(level));
    setCaseHints(0);
    setShowKey(false);
  };

  const maxDist = Math.max(1, ...(data?.dist.map((d) => d.count) ?? [1]));

  return (
    <main className="min-h-dvh bg-zinc-50 pb-16">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-zinc-50/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="grid size-8 place-items-center rounded-full border border-zinc-300 bg-white hover:border-zinc-900"
            >
              <ArrowLeft className="size-4" />
            </a>
            <div>
              <p className="font-display text-sm font-bold leading-none tracking-tight">
                DASBOR GURU
              </p>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">
                KARTESIA · SPLDV Fase E
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-3 py-1.5">
            <span className="size-2 rounded-full bg-zinc-900 animate-blink-dot" />
            <span className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.18em]">
              Live
              {lastSync
                ? ` · ${lastSync.toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}`
                : ""}
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-4 px-4 pt-4">
        {/* ── FOCUS LOCK ── */}
        <button
          onClick={toggleLock}
          disabled={toggling || !data}
          className={`flex w-full items-center justify-between gap-4 rounded-3xl border-2 px-5 py-5 text-left transition-all active:scale-[0.995] ${
            data?.isLocked
              ? "border-zinc-900 bg-zinc-900 text-white"
              : "border-zinc-900 bg-white text-zinc-900 shadow-[0_4px_0_0_rgba(24,24,27,1)]"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`grid size-12 place-items-center rounded-2xl border-2 ${
                data?.isLocked
                  ? "border-white/30 bg-white/10"
                  : "border-zinc-900 bg-zinc-900 text-white"
              }`}
            >
              {data?.isLocked ? (
                <Lock className="size-5" strokeWidth={2.2} />
              ) : (
                <Unlock className="size-5" strokeWidth={2.2} />
              )}
            </div>
            <div>
              <p className="font-display text-lg font-bold leading-tight tracking-tight">
                {data?.isLocked
                  ? "LAYAR SISWA TERKUNCI"
                  : "KUNCI LAYAR SISWA"}
              </p>
              <p
                className={`text-[11.5px] font-mono uppercase tracking-[0.14em] ${
                  data?.isLocked ? "text-zinc-300" : "text-zinc-500"
                }`}
              >
                {data?.isLocked
                  ? "Mode Diskusi Pleno Aktif · ketuk untuk membuka"
                  : "Mode Diskusi Pleno · satu ketukan untuk semua HP"}
              </p>
            </div>
          </div>
          <span
            className={`relative flex size-7 items-center rounded-full border-2 transition-colors ${
              data?.isLocked ? "border-white" : "border-zinc-900"
            }`}
          >
            <span
              className={`absolute size-3.5 rounded-full transition-all ${
                data?.isLocked
                  ? "left-[14px] bg-white"
                  : "left-[3px] bg-zinc-900"
              }`}
            />
          </span>
        </button>

        {/* ── Statistik ringkas ── */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            {
              icon: Users,
              label: "Siswa Aktif",
              val: `${data?.totals.active ?? 0}/${data?.totals.students ?? 0}`,
            },
            {
              icon: TriangleAlert,
              label: "Status MACET",
              val: String(data?.totals.stuck ?? 0),
            },
            {
              icon: Activity,
              label: "Akurasi Kelas",
              val: `${data?.totals.accuracy ?? 0}%`,
            },
            {
              icon: MonitorPlay,
              label: "Submisi Terbaru",
              val: String(data?.totals.submissions ?? 0),
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-zinc-200 bg-white p-3.5"
            >
              <div className="flex items-center gap-1.5 text-zinc-500">
                <s.icon className="size-3.5" />
                <span className="font-mono text-[9px] uppercase tracking-[0.16em]">
                  {s.label}
                </span>
              </div>
              <p className="mt-1 font-display text-2xl font-bold tracking-tight">
                {s.val}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          {/* ── Kolom kiri ── */}
          <div className="space-y-4 lg:col-span-2">
            {/* Sebaran level */}
            <section className="rounded-3xl border border-zinc-200 bg-white p-4">
              <h3 className="flex items-center gap-2 font-display text-sm font-bold">
                <Activity className="size-4" />
                Sebaran Level Kelas
              </h3>
              <div className="mt-3 space-y-1.5">
                {(data?.dist ?? []).map((d) => (
                  <div key={d.level} className="flex items-center gap-2">
                    <span className="w-6 font-mono text-[10px] font-bold text-zinc-500">
                      L{d.level}
                    </span>
                    <div className="h-4 flex-1 overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className="h-full rounded-full bg-zinc-900 transition-all duration-500"
                        style={{
                          width: `${(d.count / maxDist) * 100}%`,
                          minWidth: d.count > 0 ? 10 : 0,
                        }}
                      />
                    </div>
                    <span className="w-6 text-right font-mono text-[10px] font-bold">
                      {d.count}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Case picker */}
            <section className="rounded-3xl border border-zinc-200 bg-white p-4">
              <h3 className="flex items-center gap-2 font-display text-sm font-bold">
                <Presentation className="size-4" />
                Case Picker · Miskonsepsi
              </h3>
              <p className="mt-1 text-[11px] text-zinc-500">
                Sub-level dengan kesalahan terbanyak — bedah bersama di pleno.
              </p>
              <div className="mt-3 space-y-2">
                {(data?.hotspots ?? []).length === 0 && (
                  <p className="rounded-xl bg-zinc-50 px-3 py-4 text-center text-[11.5px] text-zinc-400">
                    Belum ada data kesalahan.
                  </p>
                )}
                {(data?.hotspots ?? []).map((h, i) => {
                  const { level, subIndex } = findSub(h.subId);
                  const { subDef } = getSub(level, subIndex);
                  return (
                    <div
                      key={h.subId}
                      className={`flex items-center justify-between gap-2 rounded-2xl border p-3 ${
                        i === 0
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-200 bg-white"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-bold">
                          {h.subId} · {subDef.title}
                        </p>
                        <p
                          className={`font-mono text-[9px] uppercase tracking-[0.14em] ${
                            i === 0 ? "text-zinc-300" : "text-zinc-400"
                          }`}
                        >
                          {h.errors} salah · {h.students} siswa
                        </p>
                      </div>
                      <button
                        onClick={() => openCase(h.subId)}
                        className={`shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-bold ${
                          i === 0
                            ? "border-white bg-white text-zinc-900"
                            : "border-zinc-900 hover:bg-zinc-900 hover:text-white"
                        }`}
                      >
                        BEDAH
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Alert tutor terbuka */}
            <section className="rounded-3xl border border-zinc-200 bg-white p-4">
              <h3 className="flex items-center gap-2 font-display text-sm font-bold">
                <TriangleAlert className="size-4" />
                Panggilan Tutor Terbuka
              </h3>
              <div className="mt-3 space-y-2">
                {(data?.openAlerts ?? []).length === 0 && (
                  <p className="rounded-xl bg-zinc-50 px-3 py-4 text-center text-[11.5px] text-zinc-400">
                    Tidak ada panggilan aktif.
                  </p>
                )}
                {(data?.openAlerts ?? []).map((a) => (
                  <div
                    key={a.id}
                    className="rounded-2xl border border-zinc-200 p-3"
                  >
                    <p className="text-[12px] font-bold">
                      {a.fromName} ·{" "}
                      <span className="font-mono text-[10px]">
                        Level {a.level}
                      </span>
                    </p>
                    <p className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-zinc-500">
                      {a.tutorName
                        ? `Tutor: ${a.tutorName}`
                        : "Belum ada tutor — dampingi langsung"}
                      {" · "}
                      {a.kind === "manual" ? "Panggilan manual" : "Otomatis"}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── Kolom kanan: peta meja ── */}
          <section className="rounded-3xl border border-zinc-200 bg-white p-4 lg:col-span-3">
            <h3 className="flex items-center gap-2 font-display text-sm font-bold">
              <Users className="size-4" />
              Daftar Siswa Kelas
            </h3>
            <p className="mt-1 text-[11px] text-zinc-500">
              Diurutkan dari capaian tertinggi. Siswa berstatus MACET ditandai baris
              berkedip — hampiri untuk memberikan bimbingan.
            </p>
            {(data?.students ?? []).length === 0 && (
              <p className="mt-4 rounded-xl bg-zinc-50 px-3 py-8 text-center text-[12px] text-zinc-400">
                Belum ada siswa yang masuk. Bagikan tautan aplikasi ke kelas.
              </p>
            )}
            <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
              {(data?.students ?? []).map((s, i) => (
                <div
                  key={s.studentKey}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2.5 ${
                    s.status === "MACET"
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`size-2 rounded-full ${
                        s.status === "MACET" ? "bg-white animate-blink-dot" : "bg-zinc-900"
                      }`}
                    />
                    <div>
                      <p className="flex items-center gap-1 text-[12px] font-bold leading-tight">
                        {s.name}
                        {i === 0 && (
                          <Crown
                            className={`size-3 ${s.status === "MACET" ? "text-white" : "text-zinc-900"}`}
                            strokeWidth={2.6}
                          />
                        )}
                      </p>
                      <p
                        className={`font-mono text-[8.5px] uppercase tracking-[0.14em] ${
                          s.status === "MACET" ? "text-zinc-300" : "text-zinc-400"
                        }`}
                      >
                        {i === 0 ? "Tutor Kelas · " : ""}
                        {s.status} · {s.totalCorrect}/{s.totalAnswered} benar
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-[9.5px] font-bold ${
                      s.status === "MACET" ? "border-white/60" : "border-zinc-900"
                    }`}
                  >
                    LV {s.level}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* ── Modal pembahasan (Case Picker) ── */}
      {caseQ && (
        <div className="fixed inset-0 z-[70] overflow-y-auto bg-white">
          <div className="mx-auto max-w-md px-4 pb-16 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-zinc-500">
                  Bedah Miskonsepsi · Sub-Level {caseQ.subId}
                </p>
                <h2 className="font-display text-lg font-bold tracking-tight">
                  {caseQ.subTitle}
                </h2>
              </div>
              <button
                onClick={() => setCaseQ(null)}
                className="grid size-9 place-items-center rounded-full border border-zinc-900 bg-white hover:bg-zinc-900 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 rounded-3xl border border-zinc-900 bg-white p-4 shadow-[0_3px_0_0_rgba(24,24,27,1)]">
              <p className="text-[13px] font-medium leading-relaxed">
                {caseQ.prompt}
              </p>
              {caseQ.lines && (
                <div className="mt-3 rounded-2xl bg-zinc-100 px-3 py-3">
                  <MathView lines={caseQ.lines} />
                </div>
              )}
            </div>

            <div className="mt-3.5 space-y-2">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">
                Pembahasan langkah demi langkah
              </p>
              {caseQ.solutionSteps.map((st, i) => (
                <div key={i} className="rounded-2xl border border-zinc-200 bg-white px-3.5 py-3">
                  <div className="flex gap-2.5">
                    <span className="grid size-5 shrink-0 place-items-center rounded-md bg-zinc-900 font-mono text-[10px] font-bold text-white">
                      {i + 1}
                    </span>
                    <p className="text-[12.5px] leading-relaxed">{st.text}</p>
                  </div>
                  {st.lines && (
                    <div className="mt-2.5 rounded-xl bg-zinc-100 px-3 py-2.5">
                      <MathView lines={st.lines} size="sm" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {caseQ.graph && (
              <div className="mt-3.5">
                <CartesianCanvas
                  scene={buildGraphScene(caseQ.graph.l1, caseQ.graph.l2, caseQ.graph.p)}
                />
                <p className="mt-1.5 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-400">
                  Titik potong kedua garis
                </p>
              </div>
            )}

            <div className="mt-4 space-y-2">
              {caseQ.hints.slice(0, caseHints).map((h, i) => (
                <div
                  key={i}
                  className="flex gap-2.5 rounded-2xl border border-zinc-200 bg-white px-3.5 py-3"
                >
                  <span className="font-mono text-[10px] font-bold text-zinc-500">
                    H{i + 1}
                  </span>
                  <p className="text-[12.5px] leading-relaxed">{h}</p>
                </div>
              ))}
              {caseHints < 3 && (
                <button
                  onClick={() => setCaseHints((h) => h + 1)}
                  className="w-full rounded-2xl border border-zinc-300 bg-white py-3 text-[12.5px] font-bold hover:border-zinc-900"
                >
                  Ungkap Petunjuk H{caseHints + 1}
                </button>
              )}
              {caseHints >= 3 && !showKey && (
                <button
                  onClick={() => setShowKey(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-900 bg-white py-3 text-[12.5px] font-bold"
                >
                  <BookOpen className="size-4" />
                  Tampilkan Kunci Pembahasan
                </button>
              )}
              {showKey && (
                <div className="rounded-2xl bg-zinc-900 px-4 py-4 text-white">
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-400">
                    Kunci Pembahasan
                  </p>
                  <p className="mt-1.5 text-[13px] font-medium leading-relaxed">
                    {caseQ.solution}
                  </p>
                </div>
              )}
              <button
                onClick={() => openCase(caseQ.subId)}
                className="w-full rounded-2xl border border-zinc-300 bg-white py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 hover:border-zinc-900 hover:text-zinc-900"
              >
                Variasi soal lain (angka baru)
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
