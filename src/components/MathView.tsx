import { Fragment, type ReactNode } from "react";
import type { MathLine } from "@/lib/math";

const SIZES = {
  sm: "text-[11.5px] min-[380px]:text-[12.5px]",
  md: "text-[13px] min-[380px]:text-[15px]",
  lg: "text-[15px] min-[380px]:text-[17px]",
} as const;

// Token @f{pembilang|penyebut} dirender sebagai pecahan vertikal.
function Tok({ text }: { text: string }) {
  const out: ReactNode[] = [];
  const re = /@f\{([^|]*)\|([^}]*)\}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      out.push(<span key={k++}>{text.slice(last, m.index)}</span>);
    }
    out.push(
      <span
        key={k++}
        className="mx-0.5 inline-flex min-w-5 flex-col items-stretch align-middle leading-none"
      >
        <span className="px-1 pb-[3px] text-center text-[0.86em]">{m[1]}</span>
        <span className="h-[1.5px] w-full shrink-0 bg-current" />
        <span className="px-1 pt-[3px] text-center text-[0.86em]">{m[2]}</span>
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
  const muted = tone === "dark" ? "text-zinc-300" : "text-zinc-500";
  const rule = tone === "dark" ? "border-white" : "border-zinc-900";

  return (
    <div
      className="math-scroll -mx-1 overflow-x-auto px-1 pb-1"
      role="region"
      aria-label="Rumus matematika; geser ke samping jika diperlukan"
      tabIndex={0}
    >
      <table
        className={`mx-auto w-max min-w-full border-separate border-spacing-x-1 border-spacing-y-1 font-mono font-semibold tracking-tight ${SIZES[size]}`}
      >
        <tbody>
          {lines.map((ln, i) => {
            if (ln.plain !== undefined) {
              return (
                <tr key={i}>
                  <td
                    colSpan={5}
                    className={`max-w-[82vw] whitespace-normal py-1 text-center font-sans text-[11px] font-medium leading-relaxed min-[380px]:text-[11.5px] ${muted}`}
                  >
                    {ln.plain}
                  </td>
                </tr>
              );
            }

            if (ln.rule) {
              return (
                <tr key={i}>
                  <td className="whitespace-nowrap pr-1 text-right font-bold">
                    {ln.op ?? ""}
                  </td>
                  <td colSpan={3} className={`border-t-2 ${rule}`} />
                  <td />
                </tr>
              );
            }

            return (
              <Fragment key={i}>
                <tr>
                  <td className={`whitespace-nowrap pr-0.5 text-right font-sans text-[10px] min-[380px]:text-[11px] ${muted}`}>
                    {ln.tag ?? ""}
                  </td>
                  <td className="whitespace-nowrap text-right align-middle">
                    <Tok text={ln.lhs ?? ""} />
                  </td>
                  <td className="whitespace-nowrap px-0.5 text-center align-middle">
                    {ln.rhs !== undefined ? "=" : ""}
                  </td>
                  <td className="whitespace-nowrap text-left align-middle">
                    <Tok text={ln.rhs ?? ""} />
                  </td>
                  <td className={`hidden whitespace-nowrap pl-1 font-sans text-[10.5px] min-[420px]:table-cell ${muted}`}>
                    {ln.note ?? ""}
                  </td>
                </tr>
                {ln.note && (
                  <tr className="min-[420px]:hidden">
                    <td colSpan={5} className={`pb-1 text-center font-sans text-[9.5px] leading-tight ${muted}`}>
                      {ln.note}
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
