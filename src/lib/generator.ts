// ═══════════════════════════════════════════════════════════════════════════
// ENGINE SOAL SPLDV — 11 level.
// Setiap soal HANYA memakai keterampilan yang diajarkan pada materi levelnya.
// Persamaan selalu ditampilkan bersusun (tidak bersebelahan) dan "=" sejajar.
// ═══════════════════════════════════════════════════════════════════════════

import {
  coefTerm,
  eqLine,
  frac,
  num,
  sideXY,
  type MathLine,
  type Pt,
} from "./math";
import { getSub } from "./levels";

export type InputDef = { key: string; label: string; answer: number };
export type ChoiceDef = { id: string; label: string; desc?: string; lines?: MathLine[] };
export type SolStep = { text: string; lines?: MathLine[] };
export type QuestionMode = "input" | "choice" | "input-choice";

export type Question = {
  level: number;
  subId: string;
  subTitle: string;
  mode: QuestionMode;
  prompt: string;
  lines?: MathLine[];
  inputs?: InputDef[];
  choices?: ChoiceDef[];
  choiceLabel?: string;
  answerChoice?: string;
  /** validasi lentur pengali eliminasi: m1·|k1| === m2·|k2| */
  elimCheck?: { k1: number; k2: number };
  graph?: { l1: { a: number; b: number; c: number }; l2: { a: number; b: number; c: number }; p: Pt };
  hints: [string, string, string];
  solutionSteps: SolStep[];
  solution: string;
  sig: string;
};

// ─── util acak ──────────────────────────────────────────────────────────────
const ri = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const shuffled = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);
/** tulis perkalian dengan kurung: 1 dan nilai -> (5), 4 dan nilai -> 4(5) */
const mul = (n: number, val: number) => (n === 1 ? `(${val})` : `${n}(${val})`);

const nz = (lo: number, hi: number): number => {
  let v = 0;
  while (v === 0) v = ri(lo, hi);
  return v;
};

const mk = (level: number, q: Omit<Question, "level" | "subId" | "subTitle" | "sig">): Question => {
  const { subDef } = getSub(level);
  const sig = JSON.stringify([
    level,
    q.prompt,
    q.lines,
    q.inputs?.map((i) => [i.key, i.answer]),
    q.answerChoice,
    q.choices?.map((c) => c.label),
  ]);
  return { level, subId: subDef.id, subTitle: subDef.title, sig, ...q };
};

// sistem dengan penyelesaian bilangan bulat positif
type Sys = { a1: number; b1: number; c1: number; a2: number; b2: number; c2: number; x: number; y: number };
function makeSystem(maxCoef = 3): Sys {
  for (;;) {
    const x = ri(1, 6);
    const y = ri(1, 6);
    const a1 = ri(1, maxCoef);
    const b1 = nz(-maxCoef, maxCoef);
    const a2 = ri(1, maxCoef);
    const b2 = nz(-maxCoef, maxCoef);
    if (a1 * b2 - a2 * b1 === 0) continue; // harus punya satu penyelesaian
    const c1 = a1 * x + b1 * y;
    const c2 = a2 * x + b2 * y;
    if (c1 <= 0 || c2 <= 0) continue;
    if (a1 === a2 && b1 === b2) continue;
    return { a1, b1, c1, a2, b2, c2, x, y };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
export function makeQuestion(level: number): Question {
  switch (level) {
    // ── LEVEL 1 · Mengenali bentuk SPLDV ───────────────────────────────────
    case 1: {
      const v = ri(1, 3);

      // 1a — pilih pasangan yang merupakan SPLDV
      if (v === 1) {
        const a = ri(1, 4), b = nz(-3, 3), c = ri(3, 12);
        const d = ri(1, 4), e = nz(-3, 3), f = ri(3, 12);
        const benar: ChoiceDef = {
          id: "ok",
          label: "Pilihan A",
          lines: [
            { tag: "①", lhs: sideXY(a, b), rhs: num(c) },
            { tag: "②", lhs: sideXY(d, e), rhs: num(f) },
          ],
        };
        const kuadrat: ChoiceDef = {
          id: "kuadrat",
          label: "Pilihan B",
          lines: [
            { tag: "①", lhs: `${coefTerm(ri(1, 3), "x²")} + ${coefTerm(ri(1, 4), "y")}`, rhs: num(ri(5, 14)) },
            { tag: "②", lhs: coefTerm(ri(1, 3), "y"), rhs: num(ri(2, 8)) },
          ],
        };
        const tigaVar: ChoiceDef = {
          id: "tiga",
          label: "Pilihan C",
          lines: [
            { tag: "①", lhs: `${coefTerm(ri(1, 3), "x")} + ${coefTerm(ri(1, 3), "y")} + ${coefTerm(ri(1, 3), "z")}`, rhs: num(ri(6, 15)) },
            { tag: "②", lhs: sideXY(1, -1), rhs: num(ri(1, 5)) },
          ],
        };
        const set = shuffled([benar, kuadrat, tigaVar]).map((c, i) => ({
          ...c,
          label: `Pilihan ${["A", "B", "C"][i]}`,
        }));
        const jawab = set.find((c) => c.id === "ok")!.label;
        return mk(1, {
          mode: "choice",
          prompt: "Manakah pasangan persamaan yang merupakan SPLDV?",
          choices: set,
          answerChoice: "ok",
          hints: [
            "Ingat tiga syarat SPLDV: dua persamaan, tepat dua variabel, dan linear (pangkat 1).",
            "Coret pilihan yang memuat pangkat dua, misalnya x². Coret juga pilihan yang memuat variabel ketiga seperti z.",
            "Tersisa satu pilihan yang hanya memuat x dan y berpangkat satu — itulah jawabannya.",
          ],
          solutionSteps: [
            { text: "Syarat 1 (dua persamaan) dipenuhi oleh semua pilihan." },
            { text: "Syarat 3 (linear): pilihan yang memuat x² gugur, karena pangkatnya 2 sehingga tidak linear." },
            { text: "Syarat 2 (tepat dua variabel): pilihan yang memuat z gugur, karena variabelnya ada tiga." },
            {
              text: `Tersisa ${jawab}, yang hanya memuat x dan y berpangkat satu.`,
              lines: [
                { tag: "①", lhs: sideXY(a, b), rhs: num(c) },
                { tag: "②", lhs: sideXY(d, e), rhs: num(f) },
              ],
            },
          ],
          solution: `Jawabannya ${jawab}, karena memenuhi ketiga syarat SPLDV.`,
        });
      }

      // 1b — sebutkan koefisien dan konstanta
      if (v === 2) {
        const a = nz(-4, 5), b = nz(-4, 5), c = ri(-9, 14);
        return mk(1, {
          mode: "input",
          prompt: "Tentukan koefisien x, koefisien y, dan konstanta dari persamaan berikut.",
          lines: [{ lhs: sideXY(a, b), rhs: num(c) }],
          inputs: [
            { key: "a", label: "Koefisien x", answer: a },
            { key: "b", label: "Koefisien y", answer: b },
            { key: "c", label: "Konstanta", answer: c },
          ],
          hints: [
            "Koefisien adalah bilangan tepat di depan variabel; konstanta adalah bilangan yang berdiri sendiri.",
            "Jika variabel ditulis tanpa angka, koefisiennya 1. Jika didahului tanda minus, koefisiennya negatif.",
            `Suku pertama ${coefTerm(a, "x")} memberi koefisien x, suku kedua ${coefTerm(b, "y")} memberi koefisien y, dan ruas kanan adalah konstantanya.`,
          ],
          solutionSteps: [
            { text: `Suku pertama adalah ${coefTerm(a, "x")}, sehingga koefisien x = ${num(a)}.` },
            { text: `Suku kedua adalah ${coefTerm(b, "y")}, sehingga koefisien y = ${num(b)}.` },
            { text: `Bilangan yang berdiri sendiri di ruas kanan adalah konstanta, yaitu ${num(c)}.` },
          ],
          solution: `Koefisien x = ${num(a)}, koefisien y = ${num(b)}, konstanta = ${num(c)}.`,
        });
      }

      // 1c — syarat yang dilanggar
      const kasus = pick([
        {
          id: "pangkat",
          lines: [
            { tag: "①", lhs: `${coefTerm(ri(2, 3), "x²")} + ${coefTerm(ri(1, 3), "y")}`, rhs: num(ri(6, 12)) },
            { tag: "②", lhs: sideXY(1, 1), rhs: num(ri(3, 8)) },
          ] as MathLine[],
          jawab: "linear",
          sebab: "Terdapat x² sehingga pangkat variabelnya 2, padahal SPLDV harus linear (pangkat 1).",
        },
        {
          id: "variabel",
          lines: [
            { tag: "①", lhs: `${coefTerm(ri(1, 3), "x")} + ${coefTerm(ri(1, 3), "y")} + ${coefTerm(ri(1, 2), "z")}`, rhs: num(ri(6, 14)) },
            { tag: "②", lhs: sideXY(2, -1), rhs: num(ri(1, 6)) },
          ] as MathLine[],
          jawab: "dua",
          sebab: "Terdapat variabel ketiga yaitu z, padahal SPLDV hanya boleh memuat dua variabel.",
        },
      ]);
      return mk(1, {
        mode: "choice",
        prompt: "Pasangan persamaan berikut BUKAN SPLDV. Syarat manakah yang dilanggar?",
        lines: kasus.lines,
        choices: shuffled([
          { id: "dua", label: "Variabelnya harus tepat dua", desc: "hanya boleh x dan y" },
          { id: "linear", label: "Harus linear (pangkat 1)", desc: "tidak boleh ada pangkat 2" },
          { id: "jumlah", label: "Harus terdiri atas dua persamaan", desc: "bukan satu persamaan saja" },
        ]),
        answerChoice: kasus.jawab,
        hints: [
          "Periksa satu per satu ketiga syarat SPLDV pada materi.",
          "Hitung dulu ada berapa persamaan, lalu ada berapa jenis variabel, lalu periksa pangkat tiap variabel.",
          kasus.sebab,
        ],
        solutionSteps: [
          { text: "Jumlah persamaannya ada dua, jadi syarat pertama terpenuhi." },
          { text: kasus.sebab },
        ],
        solution: kasus.sebab,
      });
    }

    // ── LEVEL 2 · Pindah ruas + dan − ──────────────────────────────────────
    case 2: {
      const v = pick(["x", "y", "p"]);
      const a = ri(2, 12);
      const bentuk = ri(1, 3);

      if (bentuk === 1) {
        const val = ri(1, 12);
        return mk(2, {
          mode: "input",
          prompt: "Tentukan nilai variabel dengan aturan pindah ruas.",
          lines: [{ lhs: `${v} + ${a}`, rhs: num(val + a) }],
          inputs: [{ key: "v", label: `Nilai ${v}`, answer: val }],
          hints: [
            "Suku yang pindah ruas berganti tanda.",
            `Suku +${a} berada di ruas kiri. Pindahkan ke ruas kanan sehingga menjadi −${a}.`,
            `${v} = ${val + a} − ${a}. Tinggal dihitung.`,
          ],
          solutionSteps: [
            { text: `Variabel ${v} ditemani suku +${a}.` },
            { text: `Pindahkan +${a} ke ruas kanan sehingga tandanya berubah menjadi −${a}.`, lines: [{ lhs: v, rhs: `${val + a} − ${a}` }] },
            { text: "Hitung ruas kanan.", lines: [{ lhs: v, rhs: num(val) }] },
            { text: `Periksa: ${val} + ${a} = ${val + a}. Benar.` },
          ],
          solution: `${v} = ${val}`,
        });
      }
      if (bentuk === 2) {
        const val = ri(a + 1, a + 12);
        return mk(2, {
          mode: "input",
          prompt: "Tentukan nilai variabel dengan aturan pindah ruas.",
          lines: [{ lhs: `${v} − ${a}`, rhs: num(val - a) }],
          inputs: [{ key: "v", label: `Nilai ${v}`, answer: val }],
          hints: [
            "Suku yang pindah ruas berganti tanda.",
            `Suku −${a} berada di ruas kiri. Pindahkan ke ruas kanan sehingga menjadi +${a}.`,
            `${v} = ${val - a} + ${a}. Tinggal dihitung.`,
          ],
          solutionSteps: [
            { text: `Variabel ${v} ditemani suku −${a}.` },
            { text: `Pindahkan −${a} ke ruas kanan sehingga tandanya berubah menjadi +${a}.`, lines: [{ lhs: v, rhs: `${val - a} + ${a}` }] },
            { text: "Hitung ruas kanan.", lines: [{ lhs: v, rhs: num(val) }] },
            { text: `Periksa: ${val} − ${a} = ${val - a}. Benar.` },
          ],
          solution: `${v} = ${val}`,
        });
      }
      // variabel di ruas kanan
      const val = ri(1, 12);
      return mk(2, {
        mode: "input",
        prompt: "Tentukan nilai variabel dengan aturan pindah ruas.",
        lines: [{ lhs: num(val + a), rhs: `${v} + ${a}` }],
        inputs: [{ key: "v", label: `Nilai ${v}`, answer: val }],
        hints: [
          "Variabel berada di ruas kanan. Caranya tetap sama: pindahkan suku angka yang menemaninya.",
          `Pindahkan +${a} dari ruas kanan ke ruas kiri sehingga menjadi −${a}.`,
          `${val + a} − ${a} = ${v}. Tinggal dihitung.`,
        ],
        solutionSteps: [
          { text: `Variabel ${v} ditemani suku +${a} di ruas kanan.` },
          { text: `Pindahkan +${a} ke ruas kiri sehingga menjadi −${a}.`, lines: [{ lhs: `${val + a} − ${a}`, rhs: v }] },
          { text: "Hitung ruas kiri.", lines: [{ lhs: num(val), rhs: v }] },
          { text: `Jadi ${v} = ${val}. Periksa: ${val} + ${a} = ${val + a}. Benar.` },
        ],
        solution: `${v} = ${val}`,
      });
    }

    // ── LEVEL 3 · Pindah ruas × dan ÷ ──────────────────────────────────────
    case 3: {
      const v = pick(["x", "y", "p"]);
      if (Math.random() < 0.6) {
        const k = ri(2, 9);
        const val = pick([-8, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 7, 8]);
        const c = k * val;
        return mk(3, {
          mode: "input",
          prompt: "Tentukan nilai variabel dengan aturan pindah ruas.",
          lines: [{ lhs: `${k}${v}`, rhs: num(c) }],
          inputs: [{ key: "v", label: `Nilai ${v}`, answer: val }],
          hints: [
            "Bilangan yang mengalikan variabel berpindah menjadi penyebut.",
            `Pindahkan ${k} ke ruas kanan sebagai penyebut, sehingga ${v} sama dengan ${c} dibagi ${k}.`,
            val < 0
              ? "Perhatikan tandanya: ruas kanan bernilai negatif, maka hasilnya juga negatif."
              : `Hitung ${Math.abs(c)} dibagi ${k}.`,
          ],
          solutionSteps: [
            { text: `Variabel ${v} dikalikan ${k}.` },
            { text: `Pindahkan ${k} ke ruas kanan sebagai penyebut.`, lines: [{ lhs: v, rhs: frac(num(c), k) }] },
            {
              text: val < 0 ? "Tandanya berbeda, sehingga hasilnya negatif." : "Kedua bilangan bertanda sama, sehingga hasilnya positif.",
            },
            { text: "Hitung pembagiannya.", lines: [{ lhs: v, rhs: num(val) }] },
            { text: `Periksa: ${k} × (${num(val)}) = ${num(c)}. Benar.` },
          ],
          solution: `${v} = ${num(val)}`,
        });
      }
      const k = ri(2, 6);
      const b = ri(2, 9);
      return mk(3, {
        mode: "input",
        prompt: "Tentukan nilai variabel dengan aturan pindah ruas.",
        lines: [{ lhs: frac(v, k), rhs: num(b) }],
        inputs: [{ key: "v", label: `Nilai ${v}`, answer: k * b }],
        hints: [
          "Bilangan yang membagi variabel berpindah menjadi pengali.",
          `Penyebut ${k} pindah ke ruas kanan menjadi pengali.`,
          `${v} = ${b} × ${k}. Tinggal dihitung.`,
        ],
        solutionSteps: [
          { text: `Variabel ${v} dibagi ${k}.` },
          { text: `Pindahkan ${k} ke ruas kanan sebagai pengali.`, lines: [{ lhs: v, rhs: `${b} × ${k}` }] },
          { text: "Hitung perkaliannya.", lines: [{ lhs: v, rhs: num(k * b) }] },
          { text: `Periksa: ${k * b} dibagi ${k} sama dengan ${b}. Benar.` },
        ],
        solution: `${v} = ${k * b}`,
      });
    }

    // ── LEVEL 4 · Mengalikan persamaan ─────────────────────────────────────
    case 4: {
      const a = ri(1, 4);
      const b = nz(-4, 4);
      const c = ri(2, 12);
      const k = ri(2, 5);
      return mk(4, {
        mode: "input",
        prompt: `Kalikan persamaan berikut dengan ${k}, lalu tuliskan hasilnya.`,
        lines: [{ lhs: sideXY(a, b), rhs: num(c), note: `×${k}` }],
        inputs: [
          { key: "a", label: "Koefisien x", answer: k * a },
          { key: "b", label: "Koefisien y", answer: k * b },
          { key: "c", label: "Konstanta", answer: k * c },
        ],
        hints: [
          "Kalikan KEDUA ruas. Tulis ruas kiri dan ruas kanan di dalam kurung terlebih dahulu.",
          `Bentuknya menjadi ${k}(${sideXY(a, b)}) = ${k}(${num(c)}). Lalu kalikan ke setiap suku.`,
          `Hitung ${k} × ${num(a)}, ${k} × ${num(b)}, dan ${k} × ${num(c)}.`,
        ],
        solutionSteps: [
          {
            text: `Tulis kurung pada kedua ruas dan letakkan pengali ${k} di depannya.`,
            lines: [{ lhs: `${k}(${sideXY(a, b)})`, rhs: `${k}(${num(c)})` }],
          },
          {
            text: "Kalikan pengali ke setiap suku di dalam kurung (sifat distributif).",
            lines: [
              {
                lhs: `${k} × ${coefTerm(a, "x")} ${b < 0 ? "−" : "+"} ${k} × ${coefTerm(Math.abs(b), "y")}`,
                rhs: `${k} × ${num(c)}`,
              },
            ],
          },
          {
            text: "Hitung setiap hasil perkaliannya.",
            lines: [eqLine(k * a, k * b, k * c)],
          },
        ],
        solution: `Hasilnya ${sideXY(k * a, k * b)} = ${num(k * c)}.`,
      });
    }

    // ── LEVEL 5 · Menjumlahkan dua persamaan ───────────────────────────────
    case 5: {
      const lenyap = Math.random() < 0.6;
      const a1 = ri(1, 5);
      const a2 = ri(1, 5);
      const b1 = nz(-3, 3);
      const b2 = lenyap ? -b1 : nz(-3, 3);
      const c1 = ri(3, 15);
      const c2 = ri(3, 15);
      const A = a1 + a2, B = b1 + b2, C = c1 + c2;
      return mk(5, {
        mode: "input",
        prompt: "Jumlahkan persamaan ① dan ②, lalu tuliskan hasilnya.",
        lines: [
          { tag: "①", lhs: sideXY(a1, b1), rhs: num(c1) },
          { tag: "②", lhs: sideXY(a2, b2), rhs: num(c2) },
          { rule: true, op: "+" },
        ],
        inputs: [
          { key: "a", label: "Koefisien x", answer: A },
          { key: "b", label: "Koefisien y", answer: B },
          { key: "c", label: "Konstanta", answer: C },
        ],
        hints: [
          "Jumlahkan ruas kiri dengan ruas kiri, dan ruas kanan dengan ruas kanan.",
          "Buka kurung tanpa mengubah tanda, lalu kelompokkan suku sejenis: suku x dengan suku x, suku y dengan suku y.",
          `Hitung ${num(a1)} + ${num(a2)} untuk suku x, lalu ${num(b1)} + (${num(b2)}) untuk suku y.${B === 0 ? " Suku y akan lenyap, tulis 0." : ""}`,
        ],
        solutionSteps: [
          {
            text: "Jumlahkan kedua ruas dengan menuliskan kurung.",
            lines: [{ lhs: `(${sideXY(a1, b1)}) + (${sideXY(a2, b2)})`, rhs: `${num(c1)} + ${num(c2)}` }],
          },
          {
            text: "Buka kurung. Karena didahului tanda +, semua tanda di dalamnya tidak berubah.",
            lines: [
              {
                lhs: `${coefTerm(a1, "x")} ${b1 < 0 ? "−" : "+"} ${coefTerm(Math.abs(b1), "y")} + ${coefTerm(a2, "x")} ${b2 < 0 ? "−" : "+"} ${coefTerm(Math.abs(b2), "y")}`,
                rhs: num(C),
              },
            ],
          },
          {
            text: "Kelompokkan suku sejenis.",
            lines: [
              {
                lhs: `(${coefTerm(a1, "x")} + ${coefTerm(a2, "x")}) + (${coefTerm(b1, "y")} ${b2 < 0 ? "−" : "+"} ${coefTerm(Math.abs(b2), "y")})`,
                rhs: num(C),
              },
            ],
          },
          {
            text: `Hitung tiap kelompok: suku x menjadi ${coefTerm(A, "x")}, dan suku y menjadi ${B === 0 ? "0 sehingga variabel y lenyap" : coefTerm(B, "y")}.`,
            lines: B === 0 ? [{ lhs: `${coefTerm(A, "x")} + 0`, rhs: num(C) }, { lhs: coefTerm(A, "x"), rhs: num(C) }] : [{ lhs: sideXY(A, B), rhs: num(C) }],
          },
        ],
        solution: `Hasil penjumlahan adalah ${B === 0 ? coefTerm(A, "x") : sideXY(A, B)} = ${num(C)}.`,
      });
    }

    // ── LEVEL 6 · Mengurangkan dua persamaan ───────────────────────────────
    case 6: {
      const lenyap = Math.random() < 0.6;
      const a1 = ri(2, 7);
      const a2 = ri(1, a1);
      const b1 = nz(-3, 3);
      const b2 = lenyap ? b1 : nz(-3, 3);
      const c1 = ri(8, 18);
      const c2 = ri(2, c1 - 1);
      const A = a1 - a2, B = b1 - b2, C = c1 - c2;
      return mk(6, {
        mode: "input",
        prompt: "Kurangkan persamaan ② dari persamaan ①, lalu tuliskan hasilnya.",
        lines: [
          { tag: "①", lhs: sideXY(a1, b1), rhs: num(c1) },
          { tag: "②", lhs: sideXY(a2, b2), rhs: num(c2) },
          { rule: true, op: "−" },
        ],
        inputs: [
          { key: "a", label: "Koefisien x", answer: A },
          { key: "b", label: "Koefisien y", answer: B },
          { key: "c", label: "Konstanta", answer: C },
        ],
        hints: [
          "Tulis pengurangannya memakai kurung: (persamaan ①) − (persamaan ②).",
          "Saat membuka kurung kedua, SEMUA tandanya dibalik karena didahului tanda minus.",
          `Hitung ${num(a1)} − ${num(a2)} untuk suku x, lalu ${num(b1)} − (${num(b2)}) untuk suku y.${B === 0 ? " Suku y akan lenyap, tulis 0." : ""}`,
        ],
        solutionSteps: [
          {
            text: "Tulis pengurangan kedua ruas memakai kurung.",
            lines: [{ lhs: `(${sideXY(a1, b1)}) − (${sideXY(a2, b2)})`, rhs: `${num(c1)} − ${num(c2)}` }],
          },
          {
            text: `Buka kurung. Tanda pada kurung kedua dibalik, sehingga ${coefTerm(a2, "x")} menjadi ${coefTerm(-a2, "x")} dan ${coefTerm(b2, "y")} menjadi ${coefTerm(-b2, "y")}.`,
            lines: [
              {
                lhs: `${coefTerm(a1, "x")} ${b1 < 0 ? "−" : "+"} ${coefTerm(Math.abs(b1), "y")} − ${coefTerm(a2, "x")} ${-b2 < 0 ? "−" : "+"} ${coefTerm(Math.abs(b2), "y")}`,
                rhs: num(C),
              },
            ],
          },
          {
            text: "Kelompokkan suku sejenis.",
            lines: [
              {
                lhs: `(${coefTerm(a1, "x")} − ${coefTerm(a2, "x")}) + (${coefTerm(b1, "y")} ${-b2 < 0 ? "−" : "+"} ${coefTerm(Math.abs(b2), "y")})`,
                rhs: num(C),
              },
            ],
          },
          {
            text: `Hitung tiap kelompok: suku x menjadi ${coefTerm(A, "x")}, dan suku y menjadi ${B === 0 ? "0 sehingga variabel y lenyap" : coefTerm(B, "y")}.`,
            lines: B === 0 ? [{ lhs: `${coefTerm(A, "x")} + 0`, rhs: num(C) }, { lhs: coefTerm(A, "x"), rhs: num(C) }] : [{ lhs: sideXY(A, B), rhs: num(C) }],
          },
        ],
        solution: `Hasil pengurangan adalah ${B === 0 ? coefTerm(A, "x") : sideXY(A, B)} = ${num(C)}.`,
      });
    }

    // ── LEVEL 7 · Rencana eliminasi ────────────────────────────────────────
    case 7: {
      const s = makeSystem(4);
      const targetX = Math.random() < 0.5;
      const k1 = targetX ? s.a1 : s.b1;
      const k2 = targetX ? s.a2 : s.b2;
      const v = targetX ? "x" : "y";
      const samaTanda = k1 * k2 > 0;
      const m1 = Math.abs(k2);
      const m2 = Math.abs(k1);
      return mk(7, {
        mode: "input-choice",
        prompt: `Susun rencana eliminasi untuk melenyapkan variabel ${v}. Isi pengali tiap persamaan dengan cara kali silang, lalu pilih operasinya.`,
        lines: [
          { tag: "①", lhs: sideXY(s.a1, s.b1), rhs: num(s.c1) },
          { tag: "②", lhs: sideXY(s.a2, s.b2), rhs: num(s.c2) },
        ],
        inputs: [
          { key: "m1", label: "Persamaan ① dikali", answer: m1 },
          { key: "m2", label: "Persamaan ② dikali", answer: m2 },
        ],
        elimCheck: { k1, k2 },
        choiceLabel: "Setelah koefisien sama, operasinya:",
        choices: [
          { id: "jumlah", label: "JUMLAHKAN", desc: "dipakai bila tandanya berlawanan" },
          { id: "kurang", label: "KURANGKAN", desc: "dipakai bila tandanya sama" },
        ],
        answerChoice: samaTanda ? "kurang" : "jumlah",
        hints: [
          `Lihat koefisien ${v}: pada ① bernilai ${num(k1)} dan pada ② bernilai ${num(k2)}.`,
          `Kali silang: persamaan ① dikali ${m1} (angka koefisien dari ②), dan persamaan ② dikali ${m2} (angka koefisien dari ①).`,
          `Setelah dikali, koefisien ${v} sama-sama ${Math.abs(k1 * k2)}. Tandanya ${samaTanda ? "SAMA, maka KURANGKAN" : "BERLAWANAN, maka JUMLAHKAN"}.`,
        ],
        solutionSteps: [
          { text: `Koefisien ${v} pada ① adalah ${num(k1)}, dan pada ② adalah ${num(k2)}.` },
          {
            text: `Kali silang: ① dikali ${m1}, dan ② dikali ${m2}.`,
            lines: [
              { tag: "①", lhs: `${m1}(${sideXY(s.a1, s.b1)})`, rhs: `${m1}(${num(s.c1)})` },
              { tag: "②", lhs: `${m2}(${sideXY(s.a2, s.b2)})`, rhs: `${m2}(${num(s.c2)})` },
            ],
          },
          {
            text: `Hasilnya koefisien ${v} sama besar, yaitu ${Math.abs(k1 * k2)}.`,
            lines: [
              { tag: "①", lhs: sideXY(m1 * s.a1, m1 * s.b1), rhs: num(m1 * s.c1) },
              { tag: "②", lhs: sideXY(m2 * s.a2, m2 * s.b2), rhs: num(m2 * s.c2) },
            ],
          },
          {
            text: `Karena tanda koefisien ${v} ${samaTanda ? "sama, kedua persamaan DIKURANGKAN" : "berlawanan, kedua persamaan DIJUMLAHKAN"} sehingga ${v} lenyap.`,
          },
        ],
        solution: `① dikali ${m1}, ② dikali ${m2}, lalu ${samaTanda ? "DIKURANGKAN" : "DIJUMLAHKAN"}.`,
      });
    }

    // ── LEVEL 8 · Menyelesaikan hasil eliminasi ────────────────────────────
    case 8: {
      const v = pick(["x", "y"]);
      const k = Math.random() < 0.3 ? -ri(2, 6) : ri(2, 9);
      const val = pick([-7, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 7, 8]);
      const c = k * val;
      const kTxt = num(k);
      return mk(8, {
        mode: "input",
        prompt: `Persamaan berikut adalah hasil eliminasi sebuah sistem. Tentukan nilai ${v}.`,
        lines: [{ lhs: `${kTxt}${v}`, rhs: num(c) }],
        inputs: [{ key: "v", label: `Nilai ${v}`, answer: val }],
        hints: [
          "Koefisien variabel berpindah ke ruas kanan menjadi penyebut.",
          `Tulis ${v} sama dengan ${num(c)} dibagi ${kTxt}.`,
          val < 0
            ? "Tanda pembilang dan penyebut berbeda, sehingga hasilnya negatif."
            : k < 0
              ? "Pembilang dan penyebut sama-sama negatif, sehingga hasilnya positif."
              : `Hitung ${Math.abs(c)} dibagi ${Math.abs(k)}.`,
        ],
        solutionSteps: [
          { text: `Koefisien ${v} adalah ${kTxt}. Pindahkan sebagai penyebut.`, lines: [{ lhs: v, rhs: frac(num(c), kTxt) }] },
          {
            text:
              val < 0
                ? "Tandanya berbeda, sehingga hasil pembagiannya negatif."
                : "Tandanya sama, sehingga hasil pembagiannya positif.",
          },
          { text: "Hitung pembagiannya.", lines: [{ lhs: v, rhs: num(val) }] },
          { text: `Periksa: ${kTxt} × (${num(val)}) = ${num(c)}. Benar.` },
        ],
        solution: `${v} = ${num(val)}`,
      });
    }

    // ── LEVEL 9 · Substitusi ───────────────────────────────────────────────
    case 9: {
      const x0 = ri(1, 6);
      const y0 = ri(1, 7);
      const a = ri(1, 4);
      const b = ri(1, 4);
      const c = a * x0 + b * y0;
      const cariY = Math.random() < 0.5;
      const kv = cariY ? "x" : "y";
      const known = cariY ? x0 : y0;
      const tv = cariY ? "y" : "x";
      const kCoef = cariY ? a : b;
      const tCoef = cariY ? b : a;
      const target = cariY ? y0 : x0;
      const hasil = kCoef * known;
      const sisa = c - hasil;
      return mk(9, {
        mode: "input",
        prompt: `Diketahui ${kv} = ${known}. Tentukan nilai ${tv} dari persamaan berikut.`,
        lines: [{ lhs: sideXY(a, b), rhs: num(c) }, { plain: `Diketahui ${kv} = ${known}` }],
        inputs: [{ key: "t", label: `Nilai ${tv}`, answer: target }],
        hints: [
          `Ganti ${kv} dengan (${known}) pada persamaan itu.`,
          kCoef === 1
            ? `Suku itu langsung bernilai ${hasil}, sehingga persamaan menjadi ${hasil} + ${coefTerm(tCoef, tv)} = ${c}.`
            : `Hitung perkaliannya: ${kCoef} × ${known} = ${hasil}, sehingga persamaan menjadi ${hasil} + ${coefTerm(tCoef, tv)} = ${c}.`,
          `Pindahkan ${hasil} ke ruas kanan, lalu bagi dengan ${tCoef}.`,
        ],
        solutionSteps: [
          {
            text: `Ganti ${kv} dengan (${known}).`,
            lines: [
              {
                lhs: cariY
                  ? `${mul(a, known)} + ${coefTerm(b, "y")}`
                  : `${coefTerm(a, "x")} + ${mul(b, known)}`,
                rhs: num(c),
              },
            ],
          },
          {
            text:
              kCoef === 1
                ? `Koefisiennya 1, sehingga suku itu langsung bernilai ${hasil}.`
                : `Hitung perkaliannya: ${kCoef} × ${known} = ${hasil}.`,
            lines: [
              { lhs: cariY ? `${hasil} + ${coefTerm(b, "y")}` : `${coefTerm(a, "x")} + ${hasil}`, rhs: num(c) },
            ],
          },
          {
            text: `Pindahkan ${hasil} ke ruas kanan sehingga menjadi −${hasil}.`,
            lines: [
              { lhs: coefTerm(tCoef, tv), rhs: `${num(c)} − ${hasil}` },
              { lhs: coefTerm(tCoef, tv), rhs: num(sisa) },
            ],
          },
          ...(tCoef === 1
            ? []
            : [
                {
                  text: `Koefisien ${tv} adalah ${tCoef}. Pindahkan sebagai penyebut, lalu hitung.`,
                  lines: [{ lhs: tv, rhs: frac(num(sisa), tCoef) }, { lhs: tv, rhs: num(target) }],
                },
              ]),
        ],
        solution: `${tv} = ${target}. Periksa: ${mul(a, x0)} + ${mul(b, y0)} = ${c}. Benar.`,
      });
    }

    // ── LEVEL 10 · Metode gabungan ─────────────────────────────────────────
    case 10: {
      const s = makeSystem(3);
      const targetX = Math.abs(s.b1 * s.b2) <= Math.abs(s.a1 * s.a2);
      const k1 = targetX ? s.a1 : s.b1;
      const k2 = targetX ? s.a2 : s.b2;
      const v = targetX ? "x" : "y";
      const m1 = Math.abs(k2);
      const m2 = Math.abs(k1);
      const samaTanda = k1 * k2 > 0;
      // persamaan setelah dikali
      const A1 = m1 * s.a1, B1 = m1 * s.b1, C1 = m1 * s.c1;
      const A2 = m2 * s.a2, B2 = m2 * s.b2, C2 = m2 * s.c2;
      const A = samaTanda ? A1 - A2 : A1 + A2;
      const B = samaTanda ? B1 - B2 : B1 + B2;
      const C = samaTanda ? C1 - C2 : C1 + C2;
      const sisaVar = targetX ? "y" : "x";
      const sisaVal = targetX ? s.y : s.x;
      const koefSisa = targetX ? B : A;
      // substitusi ke persamaan ①
      const lainVal = targetX ? s.x : s.y;
      const koefLain = targetX ? s.a1 : s.b1;
      const hasilSub = (targetX ? s.b1 : s.a1) * sisaVal;
      const sisaKanan = s.c1 - hasilSub;
      return mk(10, {
        mode: "input",
        prompt: "Selesaikan sistem persamaan berikut dengan metode gabungan, lalu tuliskan nilai x dan y.",
        lines: [
          { tag: "①", lhs: sideXY(s.a1, s.b1), rhs: num(s.c1) },
          { tag: "②", lhs: sideXY(s.a2, s.b2), rhs: num(s.c2) },
        ],
        inputs: [
          { key: "x", label: "Nilai x", answer: s.x },
          { key: "y", label: "Nilai y", answer: s.y },
        ],
        graph: { l1: { a: s.a1, b: s.b1, c: s.c1 }, l2: { a: s.a2, b: s.b2, c: s.c2 }, p: { x: s.x, y: s.y } },
        hints: [
          `Pilih variabel yang akan dilenyapkan. Contohnya ${v}: koefisiennya ${num(k1)} dan ${num(k2)}.`,
          `Kali silang: ① dikali ${m1} dan ② dikali ${m2}. Karena tandanya ${samaTanda ? "sama, kurangkan" : "berlawanan, jumlahkan"}.`,
          `Setelah ${v} lenyap, selesaikan persamaan satu variabel, lalu substitusikan ke persamaan ① untuk mencari variabel satunya.`,
        ],
        solutionSteps: [
          {
            text: `Pilih melenyapkan ${v}. Koefisiennya ${num(k1)} pada ① dan ${num(k2)} pada ②. Kali silang: ① dikali ${m1}, ② dikali ${m2}.`,
            lines: [
              { tag: "①", lhs: `${m1}(${sideXY(s.a1, s.b1)})`, rhs: `${m1}(${num(s.c1)})` },
              { tag: "②", lhs: `${m2}(${sideXY(s.a2, s.b2)})`, rhs: `${m2}(${num(s.c2)})` },
            ],
          },
          {
            text: `Koefisien ${v} kini sama besar.`,
            lines: [
              { tag: "①", lhs: sideXY(A1, B1), rhs: num(C1) },
              { tag: "②", lhs: sideXY(A2, B2), rhs: num(C2) },
              { rule: true, op: samaTanda ? "−" : "+" },
            ],
          },
          {
            text: `Karena tandanya ${samaTanda ? "sama, kedua persamaan dikurangkan" : "berlawanan, kedua persamaan dijumlahkan"} sehingga ${v} lenyap.`,
            lines: [{ lhs: coefTerm(koefSisa, sisaVar), rhs: num(C) }],
          },
          {
            text: "Selesaikan persamaan satu variabel tersebut.",
            lines:
              koefSisa === 1
                ? [{ lhs: sisaVar, rhs: num(sisaVal) }]
                : [{ lhs: sisaVar, rhs: frac(num(C), num(koefSisa)) }, { lhs: sisaVar, rhs: num(sisaVal) }],
          },
          {
            text: `Substitusikan ${sisaVar} = ${sisaVal} ke persamaan ①.`,
            lines: [
              {
                lhs: targetX
                  ? `${coefTerm(s.a1, "x")} ${s.b1 < 0 ? "−" : "+"} ${Math.abs(s.b1) === 1 ? "" : Math.abs(s.b1)}(${sisaVal})`
                  : `${Math.abs(s.a1) === 1 ? "" : s.a1}(${sisaVal}) ${s.b1 < 0 ? "−" : "+"} ${coefTerm(Math.abs(s.b1), "y")}`,
                rhs: num(s.c1),
              },
              { lhs: coefTerm(koefLain, targetX ? "x" : "y"), rhs: num(sisaKanan) },
              { lhs: targetX ? "x" : "y", rhs: num(lainVal) },
            ],
          },
          {
            text: `Periksa ke persamaan ②: ${num(s.a2)}(${s.x}) ${s.b2 < 0 ? "−" : "+"} ${Math.abs(s.b2)}(${s.y}) = ${num(s.c2)}. Benar.`,
          },
        ],
        solution: `Penyelesaiannya (x, y) = (${s.x}, ${s.y}). Pada grafik, inilah titik potong kedua garis.`,
      });
    }

    // ── LEVEL 11 · Soal cerita ─────────────────────────────────────────────
    case 11: {
      const jenis = ri(1, 3);

      if (jenis === 1) {
        const [i1, i2] = pick([
          ["buku", "pensil"],
          ["roti", "susu"],
          ["pulpen", "penggaris"],
          ["donat", "teh"],
        ]);
        const v1 = i1[0], v2 = i2[0];
        const x = ri(2, 7), y = ri(2, 8);
        let a1 = ri(1, 3), b1 = ri(1, 3), a2 = ri(1, 3), b2 = ri(1, 3);
        while (a1 * b2 - a2 * b1 === 0) {
          a2 = ri(1, 3);
          b2 = ri(1, 3);
        }
        const c1 = a1 * x + b1 * y;
        const c2 = a2 * x + b2 * y;
        return mk(11, {
          mode: "input",
          prompt: `Harga ${a1} ${i1} dan ${b1} ${i2} adalah Rp${c1}.000. Harga ${a2} ${i1} dan ${b2} ${i2} adalah Rp${c2}.000. Tentukan harga satu ${i1} dan satu ${i2} (dalam ribu rupiah).`,
          lines: [
            { plain: `Misal ${v1} = harga 1 ${i1}, ${v2} = harga 1 ${i2} (ribu rupiah)` },
            { tag: "①", lhs: `${coefTerm(a1, v1)} + ${coefTerm(b1, v2)}`, rhs: num(c1) },
            { tag: "②", lhs: `${coefTerm(a2, v1)} + ${coefTerm(b2, v2)}`, rhs: num(c2) },
          ],
          inputs: [
            { key: "x", label: `Harga 1 ${i1}`, answer: x },
            { key: "y", label: `Harga 1 ${i2}`, answer: y },
          ],
          hints: [
            "Modelnya sudah tersusun dari kedua kalimat cerita. Sekarang selesaikan dengan metode gabungan.",
            `Lenyapkan ${v1} dengan kali silang: ① dikali ${a2} dan ② dikali ${a1}, lalu kurangkan karena tandanya sama.`,
            `Setelah ${v2} diperoleh, substitusikan ke persamaan ① untuk mendapat ${v1}.`,
          ],
          solutionSteps: [
            { text: `Misalkan ${v1} = harga 1 ${i1} dan ${v2} = harga 1 ${i2}, keduanya dalam ribu rupiah.` },
            {
              text: `Lenyapkan ${v1} dengan kali silang: ① dikali ${a2}, ② dikali ${a1}.`,
              lines: [
                { tag: "①", lhs: `${a2}(${coefTerm(a1, v1)} + ${coefTerm(b1, v2)})`, rhs: `${a2}(${num(c1)})` },
                { tag: "②", lhs: `${a1}(${coefTerm(a2, v1)} + ${coefTerm(b2, v2)})`, rhs: `${a1}(${num(c2)})` },
                { tag: "①", lhs: `${coefTerm(a2 * a1, v1)} + ${coefTerm(a2 * b1, v2)}`, rhs: num(a2 * c1) },
                { tag: "②", lhs: `${coefTerm(a1 * a2, v1)} + ${coefTerm(a1 * b2, v2)}`, rhs: num(a1 * c2) },
              ],
            },
            {
              text: `Koefisien ${v1} sama besar dan bertanda sama, maka kurangkan.`,
              lines: [
                { lhs: coefTerm(a2 * b1 - a1 * b2, v2), rhs: num(a2 * c1 - a1 * c2) },
                { lhs: v2, rhs: num(y) },
              ],
            },
            {
              text: `Substitusikan ${v2} = ${y} ke persamaan ①.`,
              lines: [
                { lhs: `${coefTerm(a1, v1)} + ${b1}(${y})`, rhs: num(c1) },
                { lhs: coefTerm(a1, v1), rhs: num(c1 - b1 * y) },
                { lhs: v1, rhs: num(x) },
              ],
            },
          ],
          solution: `Harga 1 ${i1} adalah Rp${x}.000 dan 1 ${i2} adalah Rp${y}.000.`,
        });
      }

      if (jenis === 2) {
        const p = ri(10, 24);
        const q = ri(3, p - 3);
        const S = p + q, D = p - q;
        return mk(11, {
          mode: "input",
          prompt: `Jumlah dua bilangan adalah ${S}. Selisih kedua bilangan itu ${D}, dengan bilangan pertama lebih besar. Tentukan kedua bilangan tersebut.`,
          lines: [
            { plain: "Misal x = bilangan pertama, y = bilangan kedua" },
            { tag: "①", lhs: "x + y", rhs: num(S) },
            { tag: "②", lhs: "x − y", rhs: num(D) },
          ],
          inputs: [
            { key: "x", label: "Bilangan pertama", answer: p },
            { key: "y", label: "Bilangan kedua", answer: q },
          ],
          hints: [
            "Kalimat “jumlah” menjadi x + y, dan kalimat “selisih” menjadi x − y.",
            "Koefisien y adalah +1 dan −1 (berlawanan), sehingga kedua persamaan langsung dijumlahkan.",
            `Hasil penjumlahannya 2x = ${S + D}. Selesaikan, lalu substitusikan ke persamaan ①.`,
          ],
          solutionSteps: [
            {
              text: "Koefisien y berlawanan tanda, maka jumlahkan kedua persamaan.",
              lines: [
                { lhs: "(x + y) + (x − y)", rhs: `${num(S)} + ${num(D)}` },
                { lhs: "x + y + x − y", rhs: num(S + D) },
                { lhs: "(x + x) + (y − y)", rhs: num(S + D) },
                { lhs: "2x", rhs: num(S + D) },
              ],
            },
            {
              text: "Selesaikan persamaan satu variabel tersebut.",
              lines: [{ lhs: "x", rhs: frac(num(S + D), 2) }, { lhs: "x", rhs: num(p) }],
            },
            {
              text: `Substitusikan x = ${p} ke persamaan ①.`,
              lines: [{ lhs: `(${p}) + y`, rhs: num(S) }, { lhs: "y", rhs: `${num(S)} − ${p}` }, { lhs: "y", rhs: num(q) }],
            },
          ],
          solution: `Kedua bilangan itu adalah ${p} dan ${q}.`,
        });
      }

      const m = ri(10, 24);
      const k = ri(4, 16);
      const T = m + k;
      const R = 2 * m + 4 * k;
      return mk(11, {
        mode: "input",
        prompt: `Di sebuah parkiran terdapat ${T} kendaraan yang terdiri atas motor dan mobil. Jumlah seluruh rodanya ${R}. Tentukan banyak motor dan banyak mobil.`,
        lines: [
          { plain: "Misal m = banyak motor (2 roda), k = banyak mobil (4 roda)" },
          { tag: "①", lhs: "m + k", rhs: num(T) },
          { tag: "②", lhs: "2m + 4k", rhs: num(R) },
        ],
        inputs: [
          { key: "m", label: "Banyak motor", answer: m },
          { key: "k", label: "Banyak mobil", answer: k },
        ],
        hints: [
          "Kalimat pertama menghitung banyak kendaraan, kalimat kedua menghitung banyak roda.",
          "Lenyapkan m dengan mengalikan persamaan ① dengan 2, lalu kurangkan dari persamaan ②.",
          `Hasilnya 2k = ${R - 2 * T}. Selesaikan, lalu substitusikan ke persamaan ①.`,
        ],
        solutionSteps: [
          {
            text: "Kalikan persamaan ① dengan 2 agar koefisien m sama.",
            lines: [
              { tag: "①", lhs: "2(m + k)", rhs: `2(${num(T)})` },
              { tag: "①", lhs: "2m + 2k", rhs: num(2 * T) },
            ],
          },
          {
            text: "Koefisien m bertanda sama, maka kurangkan ② dengan ①.",
            lines: [
              { lhs: "(2m + 4k) − (2m + 2k)", rhs: `${num(R)} − ${num(2 * T)}` },
              { lhs: "2m + 4k − 2m − 2k", rhs: num(R - 2 * T) },
              { lhs: "2k", rhs: num(R - 2 * T) },
              { lhs: "k", rhs: frac(num(R - 2 * T), 2) },
              { lhs: "k", rhs: num(k) },
            ],
          },
          {
            text: `Substitusikan k = ${k} ke persamaan ①.`,
            lines: [{ lhs: `m + (${k})`, rhs: num(T) }, { lhs: "m", rhs: `${num(T)} − ${k}` }, { lhs: "m", rhs: num(m) }],
          },
          { text: `Periksa jumlah roda: 2(${m}) + 4(${k}) = ${num(R)}. Benar.` },
        ],
        solution: `Terdapat ${m} motor dan ${k} mobil.`,
      });
    }
  }
  return makeQuestion(1);
}
