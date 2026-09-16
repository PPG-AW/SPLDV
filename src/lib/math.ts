// ═══════════════════════════════════════════════════════════════════════════
// Notasi matematika terstruktur.
// Satu baris = { lhs, rhs } supaya tanda "=" SEJAJAR antar baris.
// Pecahan ditulis bertingkat memakai token @f{pembilang|penyebut}.
// ═══════════════════════════════════════════════════════════════════════════

export type Pt = { x: number; y: number };

export type MathLine = {
  tag?: string; // penanda kiri, misal "①"
  lhs?: string; // ruas kiri
  rhs?: string; // ruas kanan (bila ada, tanda "=" dicetak)
  note?: string; // catatan kecil di kanan, misal "×3"
  rule?: boolean; // garis horizontal (untuk operasi bersusun)
  op?: string; // operator di ujung garis, misal "+" atau "−"
  plain?: string; // baris teks polos selebar penuh
};

// pecahan bertingkat
export const frac = (a: number | string, b: number | string) => `@f{${a}|${b}}`;

// minus tipografi
export const num = (n: number) => String(n).replace("-", "−");

// koefisien: 1x ditulis x, −1x ditulis −x
export const coefTerm = (n: number, v: string): string => {
  if (n === 1) return v;
  if (n === -1) return `−${v}`;
  return `${num(n)}${v}`;
};

// ruas kiri ax + by dengan tanda rapi
export const sideXY = (a: number, b: number): string => {
  if (a === 0) return coefTerm(b, "y");
  if (b === 0) return coefTerm(a, "x");
  return `${coefTerm(a, "x")} ${b < 0 ? "−" : "+"} ${coefTerm(Math.abs(b), "y")}`;
};

// persamaan lengkap sebagai MathLine
export const eqLine = (
  a: number,
  b: number,
  c: number,
  extra: Partial<MathLine> = {}
): MathLine => ({ lhs: sideXY(a, b), rhs: num(c), ...extra });

// suku dengan tanda di depan (untuk rangkaian penjumlahan)
export const signed = (n: number, v: string): string =>
  `${n < 0 ? "− " : "+ "}${coefTerm(Math.abs(n), v)}`;

export const gcd = (a: number, b: number): number =>
  b === 0 ? Math.abs(a) : gcd(b, a % b);
