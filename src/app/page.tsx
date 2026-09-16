"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUpRight, Crosshair, GraduationCap, MonitorPlay } from "lucide-react";
import { LEVELS } from "@/lib/levels";

export default function LandingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (localStorage.getItem("kartesia:session")) router.replace("/belajar");
  }, [router]);

  const submit = async () => {
    setError(null);
    if (!name.trim()) {
      setError("Tuliskan namamu dulu ya.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Gagal masuk");
      localStorage.setItem(
        "kartesia:session",
        JSON.stringify({
          studentKey: data.student.studentKey,
          name: data.student.name,
          isAdmin: data.isAdmin,
        })
      );
      router.replace("/belajar");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal masuk. Coba lagi.");
      setBusy(false);
    }
  };

  return (
    <main className="paper-grid min-h-dvh">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-10 pt-8 sm:max-w-lg">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl border border-zinc-900 bg-zinc-900 text-white">
              <Crosshair className="size-4.5" strokeWidth={2.2} />
            </div>
            <div>
              <p className="font-display text-sm font-bold leading-none tracking-tight">KARTESIA</p>
              <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-zinc-500">
                SPLDV · Fase E
              </p>
            </div>
          </div>
          <a
            href="/guru"
            className="flex items-center gap-1.5 rounded-full border border-zinc-900 bg-white px-3.5 py-2 text-[11px] font-semibold tracking-wide transition-colors hover:bg-zinc-900 hover:text-white"
          >
            <MonitorPlay className="size-3.5" />
            DASBOR GURU
          </a>
        </header>

        <section className="mt-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
            Belajar Bertahap · Tutor Sebaya
          </p>
          <h1 className="mt-3 font-display text-[42px] font-bold leading-[0.98] tracking-tight">
            Kuasai SPLDV,
            <br />
            <span className="text-zinc-400">selangkah demi selangkah.</span>
          </h1>
          <p className="mt-4 max-w-[38ch] text-[13px] leading-relaxed text-zinc-600">
            11 langkah belajar: dari mengenali bentuk umum, pindah ruas, eliminasi, substitusi,
            hingga soal cerita. Setiap level diawali materi lengkap untuk dicatat di bukumu.
          </p>
        </section>

        <div className="no-scrollbar -mx-5 mt-6 flex gap-1.5 overflow-x-auto px-5">
          {LEVELS.map((l) => (
            <div
              key={l.level}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-3 py-1.5"
            >
              <span className="font-mono text-[10px] font-bold">{l.level}</span>
              <span className="whitespace-nowrap text-[10.5px] text-zinc-600">{l.title}</span>
            </div>
          ))}
        </div>

        <section className="mt-8 rounded-3xl border border-zinc-900 bg-white p-5 shadow-[0_3px_0_0_rgba(24,24,27,1)]">
          <div className="flex items-center gap-2">
            <GraduationCap className="size-4" strokeWidth={2.2} />
            <h2 className="font-display text-sm font-bold tracking-tight">Masuk Kelas</h2>
          </div>

          <label className="mt-4 block">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              Nama Lengkap
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="cth. Budi Santoso"
              className="mt-1.5 w-full rounded-2xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-base font-medium outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white"
            />
          </label>
          <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">
            Gunakan nama yang sama setiap kali masuk agar kemajuan belajarmu tersimpan.
          </p>

          {error && (
            <p className="mt-3 rounded-xl border border-zinc-900 bg-zinc-100 px-3 py-2 text-[11.5px] font-medium">
              {error}
            </p>
          )}

          <button
            onClick={submit}
            disabled={busy}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-4 py-3.5 text-sm font-bold tracking-wide text-white transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {busy ? "MEMPROSES…" : "MULAI BELAJAR"}
            <ArrowRight className="size-4" strokeWidth={2.4} />
          </button>
        </section>

        <footer className="mt-auto pt-8 text-center">
          <a
            href="/guru"
            className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400 underline-offset-4 hover:text-zinc-900 hover:underline"
          >
            Guru? Buka dasbor proyektor
            <ArrowUpRight className="size-3" />
          </a>
        </footer>
      </div>
    </main>
  );
}
