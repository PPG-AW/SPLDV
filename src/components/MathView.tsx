"use client";

import { Fragment, type ReactNode } from "react";
import type { MathLine } from "@/lib/math";

const SIZES = {
  sm: "text-[12.5px]",
  md: "text-[15px]",
  lg: "text-[17px]",
} as const;

// ── token pecahan: @f{a|b} dirender bertingkat ─────────────────────────────
function Tok({ text }: { text: string }) {
  const out: ReactNode[] = [];
  const re = /@f\{([^|]*)\|([^}]*)\}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(<span key={k++}>{text.slice(last, m.index)}</span>);
    out.push(
      <span
        key={k++}
        className="mx-0.5 inline-flex flex-col items-center align-middle leading-none"
      >
        <span className="px-1 pb-[3px] text-[0.86em]">{m[1]}</span>
        <span className="h-[1.5px] w-full bg-current" />
        <span className="px-1 pt-[3px] text-[0.86em]">{m[2]}</span>
      </span>
    );
    last = re.lastIndex;
  }
  if (last < text.length) out.push(<span key={k++}>{text.slice(last)}</span>);
  return <>{out}</>;
}

export default function MathView({
  lines,
  size = "md",
  tone = "light",
}: {
  lines: MathLine[];
  size?: keyof typeof SIZES;
  tone?: "light" | "dark";
}) {
  const muted = tone === "dark" ? "text-zinc-400" : "text-zinc-500";
  const rule = tone === "dark" ? "border-white" : "border-zinc-900";
  return (
    <div
      className={`grid grid-cols-[auto_1fr_auto_1fr_auto] items-center gap-x-1 gap-y-1.5 font-mono font-semibold tracking-tight ${SIZES[size]}`}
    >
      {lines.map((ln, i) => {
        if (ln.plain !== undefined)
          return (
            <div
              key={i}
              className={`col-span-5 py-0.5 text-center font-sans text-[11.5px] font-medium ${muted}`}
            >
              {ln.plain}
            </div>
          );
        if (ln.rule)
          return (
            <Fragment key={i}>
              <div />
              <div className={`col-span-3 border-t-2 ${rule}`} />
              <div className="pl-1 text-center font-bold">{ln.op ?? ""}</div>
            </Fragment>
          );
        return (
          <Fragment key={i}>
            <div className={`pr-0.5 font-sans text-[11px] ${muted}`}>
              {ln.tag ?? ""}
            </div>
            <div className="text-right">
              <Tok text={ln.lhs ?? ""} />
            </div>
            <div className="px-0.5 text-center">{ln.rhs !== undefined ? "=" : ""}</div>
            <div className="text-left">
              <Tok text={ln.rhs ?? ""} />
            </div>
            <div className={`pl-1 font-sans text-[10.5px] ${muted}`}>
              {ln.note ?? ""}
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
