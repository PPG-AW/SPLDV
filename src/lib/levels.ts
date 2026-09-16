// ═══════════════════════════════════════════════════════════════════════════
// KURIKULUM SPLDV — 11 Langkah Belajar Berurutan.
// Tiap level: TUJUAN → KEGUNAAN → MATERI (dicatat) → CONTOH + PEMBAHASAN.
// Materi ditulis rinci & runtut; setiap soal pada level itu HARUS bisa
// dikerjakan hanya dengan materi level tersebut (dan level sebelumnya).
// ═══════════════════════════════════════════════════════════════════════════

import { eqLine, frac, type MathLine } from "./math";

export type MateriBlock =
  | { kind: "p"; text: string }
  | { kind: "def"; term: string; text: string }
  | { kind: "rule"; title?: string; text: string }
  | { kind: "math"; title?: string; lines: MathLine[] }
  | { kind: "steps"; title?: string; items: string[] }
  | { kind: "note"; text: string };

export type Contoh = {
  title: string;
  question: string;
  qLines?: MathLine[];
  steps: { text: string; lines?: MathLine[] }[];
  answer: string;
};

export type SubDef = { id: string; title: string; concept: string };

export type LevelDef = {
  level: number;
  title: string;
  tagline: string;
  passCorrect: number;
  passWindow: number;
  subs: SubDef[];
  tujuan: string;
  kegunaan: string;
  materiTitle: string;
  materi: MateriBlock[];
  examples: Contoh[];
};

const one = (level: number, title: string, concept: string): SubDef[] => [
  { id: `${level}.1`, title, concept },
];

export const LEVELS: LevelDef[] = [
  // ── LEVEL 1 ──────────────────────────────────────────────────────────────
  {
    level: 1,
    title: "Mengenali Bentuk SPLDV",
    tagline: "Bentuk umum, variabel, koefisien, dan konstanta",
    passCorrect: 4,
    passWindow: 5,
    subs: one(1, "Mengenali SPLDV", "Mengenali bentuk umum dan menyebut bagian-bagiannya"),
    tujuan:
      "Kamu dapat mengenali apakah sepasang persamaan merupakan SPLDV, serta menyebutkan variabel, koefisien, dan konstantanya.",
    kegunaan:
      "Sebelum menyelesaikan soal, kamu harus yakin dulu bentuknya SPLDV dan tahu nama setiap bagiannya. Nama-nama ini akan dipakai terus sampai Level 11.",
    materiTitle: "Bentuk Umum SPLDV",
    materi: [
      {
        kind: "p",
        text: "SPLDV adalah singkatan dari Sistem Persamaan Linear Dua Variabel. Mari kita bedah satu per satu artinya.",
      },
      {
        kind: "def",
        term: "Variabel",
        text: "Huruf pengganti bilangan yang belum diketahui, misalnya x dan y.",
      },
      {
        kind: "def",
        term: "Koefisien",
        text: "Bilangan yang berada TEPAT di depan variabel (yang mengalikan variabel itu). Pada 5x, koefisiennya 5. Jika hanya ditulis x, koefisiennya 1. Pada −y, koefisiennya −1.",
      },
      {
        kind: "def",
        term: "Konstanta",
        text: "Bilangan yang berdiri sendiri, tidak diikuti variabel. Pada 2x + 3y = 12, konstantanya 12.",
      },
      {
        kind: "def",
        term: "Suku",
        text: "Bagian yang dipisahkan oleh tanda + atau −. Pada 2x + 3y, sukunya ada dua: 2x dan 3y.",
      },
      {
        kind: "def",
        term: "Ruas",
        text: "Bagian di kiri tanda sama dengan disebut ruas kiri, bagian di kanannya disebut ruas kanan.",
      },
      {
        kind: "math",
        title: "Bentuk umum SPLDV",
        lines: [
          { tag: "①", lhs: "a₁x + b₁y", rhs: "c₁" },
          { tag: "②", lhs: "a₂x + b₂y", rhs: "c₂" },
        ],
      },
      {
        kind: "p",
        text: "a₁ dan a₂ adalah koefisien x. b₁ dan b₂ adalah koefisien y. c₁ dan c₂ adalah konstanta.",
      },
      {
        kind: "rule",
        title: "Tiga syarat SPLDV",
        text: "1) Terdiri atas DUA persamaan.  2) Variabelnya tepat DUA jenis (misal x dan y).  3) LINEAR, artinya pangkat setiap variabel adalah 1 — tidak boleh ada x², y², atau xy.",
      },
      {
        kind: "math",
        title: "Contoh yang BUKAN SPLDV",
        lines: [
          { lhs: "x² + y", rhs: "7", note: "ada pangkat 2" },
          { lhs: "x + y + z", rhs: "9", note: "tiga variabel" },
        ],
      },
      {
        kind: "note",
        text: "Catat: bentuk umum SPLDV, lalu tulis arti variabel, koefisien, konstanta, suku, dan ruas dengan kalimatmu sendiri.",
      },
    ],
    examples: [
      {
        title: "Contoh 1 — Mengenali SPLDV",
        question: "Manakah yang merupakan SPLDV?",
        qLines: [
          { plain: "A)" },
          { lhs: "2x + y", rhs: "5" },
          { lhs: "x − y", rhs: "4" },
          { plain: "B)" },
          { lhs: "x² + y", rhs: "7" },
          { lhs: "y", rhs: "2" },
        ],
        steps: [
          { text: "Syarat 1 — dua persamaan: pilihan A dan B sama-sama punya dua persamaan, jadi keduanya masih lolos." },
          { text: "Syarat 2 — tepat dua variabel: A memuat x dan y. B juga memuat x dan y. Keduanya masih lolos." },
          {
            text: "Syarat 3 — linear (pangkat 1): pada B terdapat x², artinya pangkatnya 2. Maka B GUGUR.",
            lines: [{ lhs: "x²", note: "pangkat 2, bukan linear" }],
          },
        ],
        answer: "Jawaban: A. Pilihan B bukan SPLDV karena memuat x² sehingga tidak linear.",
      },
      {
        title: "Contoh 2 — Menyebut koefisien dan konstanta",
        question: "Tentukan koefisien x, koefisien y, dan konstanta dari persamaan berikut.",
        qLines: [{ lhs: "3x − y", rhs: "8" }],
        steps: [
          { text: "Koefisien x adalah bilangan tepat di depan x, yaitu 3." },
          {
            text: "Suku keduanya adalah −y. Karena y tidak diberi angka, koefisiennya 1, dan tandanya negatif. Jadi koefisien y adalah −1.",
            lines: [{ lhs: "−y", rhs: "−1 × y" }],
          },
          { text: "Konstanta adalah bilangan yang berdiri sendiri, yaitu 8." },
        ],
        answer: "Koefisien x = 3, koefisien y = −1, konstanta = 8.",
      },
    ],
  },

  // ── LEVEL 2 ──────────────────────────────────────────────────────────────
  {
    level: 2,
    title: "Pindah Ruas: Tambah & Kurang",
    tagline: "Suku + menjadi −, suku − menjadi +",
    passCorrect: 4,
    passWindow: 5,
    subs: one(2, "Pindah Ruas Tambah–Kurang", "Memindahkan suku penjumlahan dan pengurangan"),
    tujuan:
      "Kamu dapat memindahkan suku berbentuk penjumlahan atau pengurangan ke ruas seberang untuk menyendirikan variabel.",
    kegunaan:
      "Dipakai setiap kali kamu harus mencari nilai variabel, terutama pada Level 8 (menyelesaikan hasil eliminasi) dan Level 9 (substitusi).",
    materiTitle: "Aturan Pindah Ruas (+ dan −)",
    materi: [
      {
        kind: "p",
        text: "Tujuan kita adalah membuat variabel BERDIRI SENDIRI di satu ruas. Caranya, suku yang menemani variabel dipindahkan ke ruas seberang.",
      },
      {
        kind: "rule",
        title: "Aturan",
        text: "Setiap suku yang melewati tanda sama dengan akan BERGANTI TANDA: yang tadinya + menjadi −, dan yang tadinya − menjadi +.",
      },
      {
        kind: "steps",
        title: "Langkah kerja",
        items: [
          "Lihat suku apa yang menemani variabel.",
          "Pindahkan suku itu ke ruas seberang sambil mengganti tandanya.",
          "Hitung ruas yang sekarang hanya berisi angka.",
          "Periksa jawaban dengan memasukkannya kembali ke persamaan semula.",
        ],
      },
      {
        kind: "math",
        title: "Pola 1 — suku positif",
        lines: [
          { lhs: "x + 3", rhs: "7" },
          { lhs: "x", rhs: "7 − 3", note: "+3 menjadi −3" },
          { lhs: "x", rhs: "4" },
        ],
      },
      {
        kind: "math",
        title: "Pola 2 — suku negatif",
        lines: [
          { lhs: "x − 5", rhs: "2" },
          { lhs: "x", rhs: "2 + 5", note: "−5 menjadi +5" },
          { lhs: "x", rhs: "7" },
        ],
      },
      {
        kind: "p",
        text: "Jika variabel berada di ruas kanan, kerjanya sama saja. Contoh: 9 = x + 4 menjadi 9 − 4 = x, sehingga x = 5.",
      },
      {
        kind: "note",
        text: "Catat aturan dan kedua pola di atas. Tulis besar-besar: “pindah ruas = ganti tanda”.",
      },
    ],
    examples: [
      {
        title: "Contoh 1 — suku positif",
        question: "Tentukan nilai x.",
        qLines: [{ lhs: "x + 6", rhs: "14" }],
        steps: [
          { text: "Variabel x ditemani suku +6 di ruas kiri." },
          {
            text: "Pindahkan +6 ke ruas kanan. Tandanya berubah menjadi −6.",
            lines: [{ lhs: "x", rhs: "14 − 6" }],
          },
          { text: "Hitung ruas kanan: 14 − 6 = 8.", lines: [{ lhs: "x", rhs: "8" }] },
          { text: "Periksa: ganti x dengan 8 pada persamaan semula, 8 + 6 = 14. Benar." },
        ],
        answer: "x = 8",
      },
      {
        title: "Contoh 2 — suku negatif",
        question: "Tentukan nilai y.",
        qLines: [{ lhs: "y − 4", rhs: "9" }],
        steps: [
          { text: "Variabel y ditemani suku −4." },
          {
            text: "Pindahkan −4 ke ruas kanan sehingga menjadi +4.",
            lines: [{ lhs: "y", rhs: "9 + 4" }],
          },
          { text: "Hitung: 9 + 4 = 13.", lines: [{ lhs: "y", rhs: "13" }] },
          { text: "Periksa: 13 − 4 = 9. Benar." },
        ],
        answer: "y = 13",
      },
    ],
  },

  // ── LEVEL 3 ──────────────────────────────────────────────────────────────
  {
    level: 3,
    title: "Pindah Ruas: Kali & Bagi",
    tagline: "Pengali menjadi penyebut, penyebut menjadi pengali",
    passCorrect: 4,
    passWindow: 5,
    subs: one(3, "Pindah Ruas Kali–Bagi", "Memindahkan koefisien pengali dan penyebut"),
    tujuan:
      "Kamu dapat memindahkan koefisien yang mengalikan variabel menjadi penyebut (pecahan), dan sebaliknya.",
    kegunaan:
      "Langkah penutup pada hampir setiap penyelesaian: setelah eliminasi menghasilkan 5x = 15, langkah inilah yang memberi x = 3.",
    materiTitle: "Aturan Pindah Ruas (× dan ÷)",
    materi: [
      {
        kind: "p",
        text: "Pada bentuk 2x, angka 2 adalah koefisien yang MENGALIKAN x. Untuk menyendirikan x, koefisien itu dipindahkan ke ruas seberang sebagai PEMBAGI.",
      },
      {
        kind: "rule",
        title: "Aturan",
        text: "Bilangan yang MENGALIKAN berpindah menjadi PEMBAGI (ditulis sebagai penyebut pecahan). Bilangan yang MEMBAGI berpindah menjadi PENGALI.",
      },
      {
        kind: "math",
        title: "Pola 1 — koefisien pengali",
        lines: [
          { lhs: "2x", rhs: "10" },
          { lhs: "x", rhs: frac(10, 2), note: "2 pindah jadi penyebut" },
          { lhs: "x", rhs: "5" },
        ],
      },
      {
        kind: "math",
        title: "Pola 2 — variabel dibagi",
        lines: [
          { lhs: frac("x", 3), rhs: "4" },
          { lhs: "x", rhs: "4 × 3", note: "3 pindah jadi pengali" },
          { lhs: "x", rhs: "12" },
        ],
      },
      {
        kind: "rule",
        title: "Aturan tanda pembagian",
        text: "Positif ÷ positif = positif. Negatif ÷ negatif = positif. Jika tandanya berbeda, hasilnya negatif.",
      },
      {
        kind: "steps",
        title: "Urutan aman",
        items: [
          "Selesaikan dulu suku tambah/kurang dengan aturan Level 2.",
          "Setelah tersisa bentuk “koefisien × variabel = angka”, baru pakai aturan Level 3.",
        ],
      },
      {
        kind: "note",
        text: "Catat kedua pola di atas lengkap dengan bentuk pecahannya, serta aturan tanda pembagian.",
      },
    ],
    examples: [
      {
        title: "Contoh 1 — koefisien pengali",
        question: "Tentukan nilai y.",
        qLines: [{ lhs: "4y", rhs: "28" }],
        steps: [
          { text: "Variabel y dikalikan 4." },
          {
            text: "Pindahkan 4 ke ruas kanan sebagai penyebut.",
            lines: [{ lhs: "y", rhs: frac(28, 4) }],
          },
          { text: "Hitung pembagiannya: 28 dibagi 4 sama dengan 7.", lines: [{ lhs: "y", rhs: "7" }] },
          { text: "Periksa: 4 × 7 = 28. Benar." },
        ],
        answer: "y = 7",
      },
      {
        title: "Contoh 2 — hasil negatif",
        question: "Tentukan nilai x.",
        qLines: [{ lhs: "3x", rhs: "−12" }],
        steps: [
          {
            text: "Pindahkan 3 sebagai penyebut.",
            lines: [{ lhs: "x", rhs: frac("−12", 3) }],
          },
          { text: "Tandanya berbeda (negatif dibagi positif), sehingga hasilnya negatif." },
          { text: "Hitung: 12 dibagi 3 sama dengan 4, jadi hasilnya −4.", lines: [{ lhs: "x", rhs: "−4" }] },
        ],
        answer: "x = −4",
      },
    ],
  },

  // ── LEVEL 4 ──────────────────────────────────────────────────────────────
  {
    level: 4,
    title: "Mengalikan Persamaan",
    tagline: "Kalikan KEDUA ruas, tulis memakai kurung",
    passCorrect: 3,
    passWindow: 4,
    subs: one(4, "Kalikan dengan Konstanta", "Mengalikan kedua ruas dengan bilangan yang sama"),
    tujuan:
      "Kamu dapat mengalikan sebuah persamaan dengan suatu bilangan secara benar, yaitu dengan mengalikan KEDUA ruas dan setiap sukunya.",
    kegunaan:
      "Dipakai untuk menyamakan koefisien sebelum eliminasi (Level 7). Tanpa langkah ini, variabel tidak akan bisa dihilangkan.",
    materiTitle: "Mengalikan Persamaan dengan Bilangan",
    materi: [
      {
        kind: "rule",
        title: "Aturan pokok",
        text: "Sebuah persamaan tetap benar jika KEDUA ruasnya dikalikan bilangan yang sama (selain nol). Karena itu pengali harus ditulis di ruas kiri DAN ruas kanan.",
      },
      {
        kind: "steps",
        title: "Langkah kerja",
        items: [
          "Tulis ruas kiri di dalam kurung, lalu beri pengali di depannya. Lakukan hal yang sama pada ruas kanan.",
          "Kalikan pengali ke SETIAP suku di dalam kurung (sifat distributif).",
          "Hitung setiap hasil perkalian sehingga diperoleh persamaan baru.",
        ],
      },
      {
        kind: "math",
        title: "Contoh penulisan yang benar",
        lines: [
          { lhs: "2x + y", rhs: "5", note: "kalikan 3" },
          { lhs: "3(2x + y)", rhs: "3(5)", note: "kurung di kedua ruas" },
          { lhs: "3 × 2x + 3 × y", rhs: "15", note: "distributif" },
          { lhs: "6x + 3y", rhs: "15" },
        ],
      },
      {
        kind: "rule",
        title: "Kesalahan yang sering terjadi",
        text: "Mengalikan hanya sebagian suku, atau lupa mengalikan ruas kanan. Contoh SALAH: 2x + y = 5 dikali 3 menjadi 6x + y = 5.",
      },
      {
        kind: "p",
        text: "Nilai penyelesaian TIDAK berubah setelah dikalikan. Persamaan 2x + y = 5 dan 6x + 3y = 15 punya penyelesaian yang persis sama.",
      },
      {
        kind: "note",
        text: "Catat langkah kerja dan contoh penulisan berkurung di atas. Tandai bahwa pengali muncul di kedua ruas.",
      },
    ],
    examples: [
      {
        title: "Contoh — mengalikan dengan 2",
        question: "Kalikan persamaan berikut dengan 2, lalu tuliskan hasilnya.",
        qLines: [{ lhs: "2x + 3y", rhs: "7" }],
        steps: [
          {
            text: "Tulis kurung pada kedua ruas dan letakkan pengali 2 di depannya.",
            lines: [{ lhs: "2(2x + 3y)", rhs: "2(7)" }],
          },
          {
            text: "Kalikan 2 ke setiap suku di dalam kurung.",
            lines: [{ lhs: "2 × 2x + 2 × 3y", rhs: "2 × 7" }],
          },
          {
            text: "Hitung tiap perkalian: 2 × 2x = 4x, 2 × 3y = 6y, dan 2 × 7 = 14.",
            lines: [{ lhs: "4x + 6y", rhs: "14" }],
          },
        ],
        answer: "Hasilnya 4x + 6y = 14, dengan koefisien x = 4, koefisien y = 6, dan konstanta 14.",
      },
    ],
  },

  // ── LEVEL 5 ──────────────────────────────────────────────────────────────
  {
    level: 5,
    title: "Menjumlahkan Dua Persamaan",
    tagline: "Ruas kiri + ruas kiri, ruas kanan + ruas kanan",
    passCorrect: 3,
    passWindow: 4,
    subs: one(5, "Menjumlahkan Persamaan", "Menjumlahkan dua persamaan ruas demi ruas"),
    tujuan:
      "Kamu dapat menjumlahkan dua persamaan secara runtut: menggabung ruas, membuka kurung, mengelompokkan suku sejenis, lalu menghitungnya.",
    kegunaan:
      "Inti dari eliminasi ketika koefisien suatu variabel BERLAWANAN tanda — penjumlahan akan melenyapkan variabel tersebut.",
    materiTitle: "Menjumlahkan Dua Persamaan",
    materi: [
      {
        kind: "p",
        text: "Pada sebuah persamaan, ruas kiri dan ruas kanan bernilai SAMA. Karena itu, menambahkan ruas kiri persamaan ② ke ruas kiri ①, dan ruas kanan ② ke ruas kanan ①, tetap menghasilkan persamaan yang benar.",
      },
      {
        kind: "def",
        term: "Suku sejenis",
        text: "Suku yang memuat variabel yang sama persis. 2x dan 3x sejenis. y dan −y sejenis. Tetapi 2x dan 3y TIDAK sejenis sehingga tidak dapat digabung.",
      },
      {
        kind: "steps",
        title: "Langkah kerja (jangan dilompati)",
        items: [
          "Tulis kedua persamaan bersusun ke bawah.",
          "Jumlahkan ruas kiri dengan ruas kiri, dan ruas kanan dengan ruas kanan, gunakan kurung.",
          "Buka kurung. Karena di depan kurung ada tanda +, semua tanda di dalamnya TIDAK berubah.",
          "Kelompokkan suku sejenis: kumpulkan suku x, lalu suku y.",
          "Hitung setiap kelompok, lalu tuliskan hasil akhirnya.",
        ],
      },
      {
        kind: "math",
        title: "Contoh langkah demi langkah",
        lines: [
          { tag: "①", lhs: "2x + y", rhs: "5" },
          { tag: "②", lhs: "3x − y", rhs: "10" },
          { plain: "Jumlahkan kedua ruas:" },
          { lhs: "(2x + y) + (3x − y)", rhs: "5 + 10" },
          { plain: "Buka kurung (tanda tidak berubah):" },
          { lhs: "2x + y + 3x − y", rhs: "15" },
          { plain: "Kelompokkan suku sejenis:" },
          { lhs: "(2x + 3x) + (y − y)", rhs: "15" },
          { plain: "Hitung tiap kelompok:" },
          { lhs: "5x + 0", rhs: "15" },
          { lhs: "5x", rhs: "15" },
        ],
      },
      {
        kind: "p",
        text: "Perhatikan y + (−y) = 0, sehingga variabel y lenyap. Inilah yang kita inginkan pada eliminasi.",
      },
      {
        kind: "note",
        text: "Catat kelima langkah dan salin contoh bertingkat di atas apa adanya, termasuk baris pengelompokan suku sejenis.",
      },
    ],
    examples: [
      {
        title: "Contoh — penjumlahan yang melenyapkan y",
        question: "Jumlahkan persamaan ① dan ②.",
        qLines: [
          { tag: "①", lhs: "3x + 2y", rhs: "12" },
          { tag: "②", lhs: "x − 2y", rhs: "4" },
        ],
        steps: [
          {
            text: "Jumlahkan ruas kiri dengan ruas kiri, ruas kanan dengan ruas kanan.",
            lines: [{ lhs: "(3x + 2y) + (x − 2y)", rhs: "12 + 4" }],
          },
          {
            text: "Buka kurung. Tanda di dalam kurung tidak berubah karena didahului tanda +.",
            lines: [{ lhs: "3x + 2y + x − 2y", rhs: "16" }],
          },
          {
            text: "Kelompokkan suku sejenis.",
            lines: [{ lhs: "(3x + x) + (2y − 2y)", rhs: "16" }],
          },
          {
            text: "Hitung: 3x + x = 4x dan 2y − 2y = 0.",
            lines: [{ lhs: "4x + 0", rhs: "16" }, { lhs: "4x", rhs: "16" }],
          },
        ],
        answer: "Hasil penjumlahan adalah 4x = 16. Koefisien x = 4, koefisien y = 0, konstanta 16.",
      },
    ],
  },

  // ── LEVEL 6 ──────────────────────────────────────────────────────────────
  {
    level: 6,
    title: "Mengurangkan Dua Persamaan",
    tagline: "Tanda minus di depan kurung membalik semua tanda",
    passCorrect: 3,
    passWindow: 4,
    subs: one(6, "Mengurangkan Persamaan", "Mengurangkan dua persamaan ruas demi ruas"),
    tujuan:
      "Kamu dapat mengurangkan dua persamaan dengan benar, terutama saat membuka kurung yang didahului tanda minus.",
    kegunaan:
      "Inti dari eliminasi ketika koefisien suatu variabel SAMA tanda — pengurangan akan melenyapkan variabel tersebut.",
    materiTitle: "Mengurangkan Dua Persamaan",
    materi: [
      {
        kind: "rule",
        title: "Aturan kunci",
        text: "Jika di depan kurung ada tanda −, maka SEMUA tanda di dalam kurung dibalik saat kurung dibuka: + menjadi −, dan − menjadi +.",
      },
      {
        kind: "math",
        title: "Latihan membuka kurung",
        lines: [
          { lhs: "−(x + 2y)", rhs: "−x − 2y" },
          { lhs: "−(x − 2y)", rhs: "−x + 2y" },
        ],
      },
      {
        kind: "steps",
        title: "Langkah kerja (jangan dilompati)",
        items: [
          "Tulis kedua persamaan bersusun ke bawah.",
          "Kurangkan: ruas kiri ① dikurangi ruas kiri ②, ruas kanan ① dikurangi ruas kanan ②, gunakan kurung.",
          "Buka kurung. Kurung kedua didahului tanda −, sehingga semua tandanya dibalik.",
          "Kelompokkan suku sejenis.",
          "Hitung tiap kelompok dan tulis hasil akhirnya.",
        ],
      },
      {
        kind: "math",
        title: "Contoh langkah demi langkah",
        lines: [
          { tag: "①", lhs: "4x + 2y", rhs: "12" },
          { tag: "②", lhs: "x + 2y", rhs: "6" },
          { plain: "Kurangkan kedua ruas:" },
          { lhs: "(4x + 2y) − (x + 2y)", rhs: "12 − 6" },
          { plain: "Buka kurung (tanda di kurung kedua dibalik):" },
          { lhs: "4x + 2y − x − 2y", rhs: "6" },
          { plain: "Kelompokkan suku sejenis:" },
          { lhs: "(4x − x) + (2y − 2y)", rhs: "6" },
          { plain: "Hitung tiap kelompok:" },
          { lhs: "3x + 0", rhs: "6" },
          { lhs: "3x", rhs: "6" },
        ],
      },
      {
        kind: "note",
        text: "Catat aturan pembalikan tanda, dua latihan membuka kurung, dan contoh bertingkat di atas.",
      },
    ],
    examples: [
      {
        title: "Contoh — pengurangan yang melenyapkan y",
        question: "Kurangkan persamaan ② dari persamaan ①.",
        qLines: [
          { tag: "①", lhs: "5x + 3y", rhs: "19" },
          { tag: "②", lhs: "2x + 3y", rhs: "10" },
        ],
        steps: [
          {
            text: "Tulis pengurangannya memakai kurung.",
            lines: [{ lhs: "(5x + 3y) − (2x + 3y)", rhs: "19 − 10" }],
          },
          {
            text: "Buka kurung. Kurung kedua didahului minus sehingga +2x menjadi −2x dan +3y menjadi −3y.",
            lines: [{ lhs: "5x + 3y − 2x − 3y", rhs: "9" }],
          },
          {
            text: "Kelompokkan suku sejenis.",
            lines: [{ lhs: "(5x − 2x) + (3y − 3y)", rhs: "9" }],
          },
          {
            text: "Hitung: 5x − 2x = 3x dan 3y − 3y = 0.",
            lines: [{ lhs: "3x + 0", rhs: "9" }, { lhs: "3x", rhs: "9" }],
          },
        ],
        answer: "Hasil pengurangan adalah 3x = 9. Koefisien x = 3, koefisien y = 0, konstanta 9.",
      },
    ],
  },

  // ── LEVEL 7 ──────────────────────────────────────────────────────────────
  {
    level: 7,
    title: "Eliminasi",
    tagline: "Samakan koefisien, lalu hilangkan satu variabel",
    passCorrect: 3,
    passWindow: 4,
    subs: one(7, "Rencana Eliminasi", "Menentukan pengali dan operasi untuk menghilangkan satu variabel"),
    tujuan:
      "Kamu dapat menyusun rencana eliminasi: memilih pengali untuk menyamakan koefisien, lalu menentukan apakah kedua persamaan dijumlahkan atau dikurangkan.",
    kegunaan:
      "Eliminasi mengubah dua persamaan dua variabel menjadi satu persamaan satu variabel yang mudah diselesaikan pada Level 8.",
    materiTitle: "Menyusun Rencana Eliminasi",
    materi: [
      {
        kind: "p",
        text: "Sebuah variabel hanya bisa lenyap jika koefisiennya SAMA BESAR di kedua persamaan. Karena itu langkah pertama selalu menyamakan koefisien dengan cara mengalikan persamaan (Level 4).",
      },
      {
        kind: "rule",
        title: "Cara termudah: kali silang",
        text: "Untuk melenyapkan x: kalikan persamaan ① dengan koefisien x pada ②, dan kalikan persamaan ② dengan koefisien x pada ①. Pengali tidak harus yang terkecil — yang penting koefisiennya menjadi sama besar.",
      },
      {
        kind: "math",
        title: "Contoh kali silang (melenyapkan x)",
        lines: [
          { tag: "①", lhs: "2x + 3y", rhs: "8", note: "kalikan 3" },
          { tag: "②", lhs: "3x − y", rhs: "2", note: "kalikan 2" },
          { plain: "Hasil perkalian:" },
          { tag: "①", lhs: "6x + 9y", rhs: "24" },
          { tag: "②", lhs: "6x − 2y", rhs: "4" },
        ],
      },
      {
        kind: "rule",
        title: "Menentukan operasi",
        text: "Setelah koefisien sama besar: jika TANDANYA SAMA (misal 6x dan 6x) maka KURANGKAN. Jika TANDANYA BERLAWANAN (misal 6x dan −6x) maka JUMLAHKAN.",
      },
      {
        kind: "steps",
        title: "Langkah kerja",
        items: [
          "Pilih variabel yang akan dilenyapkan.",
          "Lihat koefisien variabel itu pada kedua persamaan.",
          "Kalikan silang: ① dikali koefisien dari ②, dan ② dikali koefisien dari ①.",
          "Periksa tanda koefisien hasilnya, lalu tentukan: kurangkan bila tandanya sama, jumlahkan bila berlawanan.",
        ],
      },
      {
        kind: "note",
        text: "Catat cara kali silang, aturan menentukan operasi, dan contoh di atas. Ingat: pengali ditulis di kedua ruas.",
      },
    ],
    examples: [
      {
        title: "Contoh — rencana melenyapkan x",
        question: "Susun rencana eliminasi untuk melenyapkan variabel x.",
        qLines: [
          { tag: "①", lhs: "2x + 3y", rhs: "8" },
          { tag: "②", lhs: "3x − y", rhs: "2" },
        ],
        steps: [
          { text: "Koefisien x pada ① adalah 2, dan pada ② adalah 3." },
          {
            text: "Kali silang: persamaan ① dikali 3 (koefisien dari ②), persamaan ② dikali 2 (koefisien dari ①).",
            lines: [
              { tag: "①", lhs: "3(2x + 3y)", rhs: "3(8)" },
              { tag: "②", lhs: "2(3x − y)", rhs: "2(2)" },
            ],
          },
          {
            text: "Hasilnya, koefisien x sama-sama menjadi 6.",
            lines: [
              { tag: "①", lhs: "6x + 9y", rhs: "24" },
              { tag: "②", lhs: "6x − 2y", rhs: "4" },
            ],
          },
          { text: "Karena kedua koefisien x bertanda sama (keduanya positif), maka kedua persamaan harus DIKURANGKAN." },
        ],
        answer: "Rencana: ① dikali 3, ② dikali 2, lalu KURANGKAN sehingga x lenyap.",
      },
    ],
  },

  // ── LEVEL 8 ──────────────────────────────────────────────────────────────
  {
    level: 8,
    title: "Menyelesaikan Hasil Eliminasi",
    tagline: "Satu variabel tersisa, tinggal pindah ruas",
    passCorrect: 3,
    passWindow: 4,
    subs: one(8, "Menyelesaikan PLSV", "Mencari nilai variabel dari persamaan satu variabel"),
    tujuan:
      "Kamu dapat menyelesaikan persamaan satu variabel hasil eliminasi dan menuliskan pembagiannya dalam bentuk pecahan.",
    kegunaan:
      "Langkah ini memberi nilai variabel PERTAMA. Nilai itulah yang nanti disubstitusikan pada Level 9.",
    materiTitle: "Menutup Hasil Eliminasi",
    materi: [
      {
        kind: "p",
        text: "Setelah eliminasi berhasil, bentuk yang tersisa adalah persamaan satu variabel, misalnya 5x = 15. Bentuk ini diselesaikan dengan aturan Level 3.",
      },
      {
        kind: "math",
        title: "Pola penyelesaian",
        lines: [
          { lhs: "5x", rhs: "15" },
          { lhs: "x", rhs: frac(15, 5) },
          { lhs: "x", rhs: "3" },
        ],
      },
      {
        kind: "math",
        title: "Pola dengan bilangan negatif",
        lines: [
          { lhs: "−2y", rhs: "−8" },
          { lhs: "y", rhs: frac("−8", "−2") },
          { lhs: "y", rhs: "4", note: "negatif ÷ negatif = positif" },
        ],
      },
      {
        kind: "steps",
        title: "Langkah kerja",
        items: [
          "Tulis koefisien variabel sebagai penyebut di ruas kanan.",
          "Tentukan tanda hasilnya lebih dahulu dengan aturan tanda pembagian.",
          "Hitung pembagiannya.",
          "Periksa dengan mengalikan kembali: koefisien × hasil harus sama dengan ruas kanan.",
        ],
      },
      {
        kind: "note",
        text: "Catat kedua pola di atas beserta bentuk pecahannya, dan tandai aturan tanda pada contoh kedua.",
      },
    ],
    examples: [
      {
        title: "Contoh — hasil eliminasi bernilai negatif",
        question: "Hasil eliminasi suatu sistem adalah persamaan berikut. Tentukan nilai y.",
        qLines: [{ lhs: "3y", rhs: "−12" }],
        steps: [
          {
            text: "Koefisien y adalah 3. Pindahkan sebagai penyebut.",
            lines: [{ lhs: "y", rhs: frac("−12", 3) }],
          },
          { text: "Periksa tanda: negatif dibagi positif menghasilkan negatif." },
          { text: "Hitung: 12 dibagi 3 sama dengan 4, sehingga hasilnya −4.", lines: [{ lhs: "y", rhs: "−4" }] },
          { text: "Periksa: 3 × (−4) = −12. Benar." },
        ],
        answer: "y = −4",
      },
    ],
  },

  // ── LEVEL 9 ──────────────────────────────────────────────────────────────
  {
    level: 9,
    title: "Substitusi",
    tagline: "Mengganti variabel dengan nilai yang sudah diketahui",
    passCorrect: 3,
    passWindow: 4,
    subs: one(9, "Substitusi ke Persamaan", "Memasukkan nilai variabel untuk mencari pasangannya"),
    tujuan:
      "Kamu dapat mengganti sebuah variabel dengan nilai yang sudah diketahui, lalu menyelesaikan persamaan yang tersisa.",
    kegunaan:
      "Setelah eliminasi memberi nilai variabel pertama, substitusi dipakai untuk menemukan variabel kedua.",
    materiTitle: "Substitusi Nilai ke Persamaan",
    materi: [
      {
        kind: "def",
        term: "Substitusi",
        text: "Mengganti sebuah variabel dengan nilai yang sudah diketahui. Nilai pengganti selalu ditulis di dalam kurung agar perkaliannya jelas.",
      },
      {
        kind: "steps",
        title: "Langkah kerja",
        items: [
          "Tulis persamaan yang akan digunakan.",
          "Ganti variabel yang sudah diketahui dengan nilainya, tulis dalam kurung.",
          "Hitung perkalian pada suku tersebut.",
          "Pindahkan angka hasil hitungan ke ruas kanan (aturan Level 2).",
          "Bagi dengan koefisien variabel yang tersisa (aturan Level 3), tulis sebagai pecahan.",
        ],
      },
      {
        kind: "math",
        title: "Contoh langkah demi langkah",
        lines: [
          { plain: "Persamaan yang dipakai:" },
          { lhs: "2x + y", rhs: "8" },
          { plain: "Diketahui x = 3, ganti x dengan (3):" },
          { lhs: "2(3) + y", rhs: "8" },
          { plain: "Hitung perkaliannya:" },
          { lhs: "6 + y", rhs: "8" },
          { plain: "Pindahkan 6 ke ruas kanan:" },
          { lhs: "y", rhs: "8 − 6" },
          { lhs: "y", rhs: "2" },
        ],
      },
      {
        kind: "p",
        text: "Jika koefisien variabel yang tersisa bukan 1, misalnya 3y = 12, selesaikan dengan pecahan seperti pada Level 8.",
      },
      {
        kind: "note",
        text: "Catat pengertian substitusi, kelima langkah, dan contoh bertingkat di atas.",
      },
    ],
    examples: [
      {
        title: "Contoh — koefisien tersisa bukan 1",
        question: "Diketahui x = 2. Tentukan nilai y dari persamaan berikut.",
        qLines: [{ lhs: "3x + 2y", rhs: "16" }],
        steps: [
          {
            text: "Ganti x dengan (2).",
            lines: [{ lhs: "3(2) + 2y", rhs: "16" }],
          },
          { text: "Hitung perkalian: 3 × 2 = 6.", lines: [{ lhs: "6 + 2y", rhs: "16" }] },
          {
            text: "Pindahkan 6 ke ruas kanan sehingga menjadi −6.",
            lines: [{ lhs: "2y", rhs: "16 − 6" }, { lhs: "2y", rhs: "10" }],
          },
          {
            text: "Pindahkan koefisien 2 sebagai penyebut, lalu hitung.",
            lines: [{ lhs: "y", rhs: frac(10, 2) }, { lhs: "y", rhs: "5" }],
          },
        ],
        answer: "y = 5. Periksa: 3(2) + 2(5) = 6 + 10 = 16. Benar.",
      },
    ],
  },

  // ── LEVEL 10 ─────────────────────────────────────────────────────────────
  {
    level: 10,
    title: "Metode Gabungan",
    tagline: "Eliminasi lalu substitusi, hasilnya pasangan (x, y)",
    passCorrect: 2,
    passWindow: 3,
    subs: one(10, "Eliminasi–Substitusi Penuh", "Menyelesaikan SPLDV secara utuh"),
    tujuan:
      "Kamu dapat menyelesaikan SPLDV secara utuh dengan merangkai Level 4 sampai Level 9, lalu menuliskan penyelesaiannya sebagai pasangan (x, y).",
    kegunaan:
      "Inilah cara baku menyelesaikan SPLDV, dan menjadi alat utama untuk mengerjakan soal cerita di Level 11.",
    materiTitle: "Alur Lengkap Metode Gabungan",
    materi: [
      {
        kind: "steps",
        title: "Lima langkah baku",
        items: [
          "Pilih variabel yang akan dilenyapkan, lalu samakan koefisiennya dengan kali silang (Level 4 & 7).",
          "Eliminasi: jumlahkan bila tandanya berlawanan, kurangkan bila tandanya sama (Level 5 & 6).",
          "Selesaikan persamaan satu variabel yang tersisa (Level 8).",
          "Substitusikan nilai itu ke salah satu persamaan ASLI, lalu cari variabel kedua (Level 9).",
          "Tulis jawabannya sebagai pasangan (x, y), lalu periksa ke KEDUA persamaan asli.",
        ],
      },
      {
        kind: "math",
        title: "Contoh ringkas",
        lines: [
          { tag: "①", lhs: "x + y", rhs: "5" },
          { tag: "②", lhs: "x − y", rhs: "1" },
          { plain: "Koefisien y berlawanan (+1 dan −1), maka dijumlahkan:" },
          { lhs: "(x + y) + (x − y)", rhs: "5 + 1" },
          { lhs: "2x", rhs: "6" },
          { lhs: "x", rhs: frac(6, 2) },
          { lhs: "x", rhs: "3" },
          { plain: "Substitusi x = 3 ke persamaan ①:" },
          { lhs: "3 + y", rhs: "5" },
          { lhs: "y", rhs: "2" },
        ],
      },
      {
        kind: "p",
        text: "Penyelesaiannya ditulis (x, y) = (3, 2). Secara grafik, pasangan ini adalah titik potong kedua garis, karena hanya titik itulah yang memenuhi kedua persamaan sekaligus.",
      },
      {
        kind: "rule",
        title: "Selalu periksa",
        text: "Masukkan kembali nilai x dan y ke KEDUA persamaan asli. Jika keduanya benar, jawabanmu pasti tepat.",
      },
      {
        kind: "note",
        text: "Catat lima langkah baku dan contoh ringkas di atas sebagai peta kerja penyelesaian SPLDV.",
      },
    ],
    examples: [
      {
        title: "Contoh — metode gabungan penuh",
        question: "Selesaikan sistem persamaan berikut.",
        qLines: [
          { tag: "①", lhs: "2x + y", rhs: "7" },
          { tag: "②", lhs: "x − y", rhs: "2" },
        ],
        steps: [
          { text: "Perhatikan koefisien y: pada ① bernilai 1, pada ② bernilai −1. Keduanya sudah sama besar dengan tanda berlawanan, sehingga tidak perlu dikalikan." },
          {
            text: "Karena tandanya berlawanan, jumlahkan kedua persamaan.",
            lines: [
              { lhs: "(2x + y) + (x − y)", rhs: "7 + 2" },
              { lhs: "2x + y + x − y", rhs: "9" },
              { lhs: "(2x + x) + (y − y)", rhs: "9" },
              { lhs: "3x", rhs: "9" },
            ],
          },
          {
            text: "Selesaikan persamaan satu variabel tersebut.",
            lines: [{ lhs: "x", rhs: frac(9, 3) }, { lhs: "x", rhs: "3" }],
          },
          {
            text: "Substitusikan x = 3 ke persamaan ② yang lebih sederhana.",
            lines: [
              { lhs: "(3) − y", rhs: "2" },
              { lhs: "−y", rhs: "2 − 3" },
              { lhs: "−y", rhs: "−1" },
              { lhs: "y", rhs: "1" },
            ],
          },
          { text: "Periksa ke kedua persamaan: 2(3) + 1 = 7 benar, dan 3 − 1 = 2 benar." },
        ],
        answer: "Penyelesaiannya (x, y) = (3, 1).",
      },
    ],
  },

  // ── LEVEL 11 ─────────────────────────────────────────────────────────────
  {
    level: 11,
    title: "Soal Cerita SPLDV",
    tagline: "Menerjemahkan cerita menjadi model matematika",
    passCorrect: 2,
    passWindow: 3,
    subs: one(11, "Memodelkan Soal Cerita", "Cerita menjadi model, lalu diselesaikan"),
    tujuan:
      "Kamu dapat mengubah kalimat cerita menjadi dua persamaan, menyelesaikannya dengan metode gabungan, lalu menjawab pertanyaan ceritanya.",
    kegunaan:
      "Sebagian besar penggunaan SPLDV di kehidupan nyata berbentuk cerita: harga barang, jumlah benda, usia, dan kecepatan.",
    materiTitle: "Dari Cerita ke Model Matematika",
    materi: [
      {
        kind: "steps",
        title: "Empat tahap",
        items: [
          "Tentukan variabel: beri huruf untuk dua hal yang belum diketahui, lengkap dengan satuannya.",
          "Ubah setiap kalimat informasi menjadi satu persamaan. Dua kalimat menghasilkan dua persamaan.",
          "Selesaikan sistem itu dengan metode gabungan (Level 10).",
          "Kembalikan jawaban ke konteks cerita dan jawab tepat seperti yang ditanyakan.",
        ],
      },
      {
        kind: "math",
        title: "Contoh penerjemahan",
        lines: [
          { plain: "Misal b = harga 1 buku, p = harga 1 pensil" },
          { plain: "“2 buku dan 1 pensil seharga 11”" },
          { lhs: "2b + p", rhs: "11" },
          { plain: "“1 buku dan 3 pensil seharga 18”" },
          { lhs: "b + 3p", rhs: "18" },
        ],
      },
      {
        kind: "rule",
        title: "Kunci penerjemahan",
        text: "Kata “dan” pada satu transaksi berarti dijumlahkan. Banyaknya barang menjadi koefisien, sedangkan total menjadi konstanta di ruas kanan.",
      },
      {
        kind: "p",
        text: "Perhatikan satuan. Jika soal memakai ribuan rupiah, tuliskan modelnya dalam ribuan agar angkanya sederhana.",
      },
      {
        kind: "note",
        text: "Catat empat tahap dan contoh penerjemahan di atas. Biasakan menulis pemisalan variabel terlebih dahulu.",
      },
    ],
    examples: [
      {
        title: "Contoh — harga buku dan pensil",
        question:
          "Harga 2 buku dan 1 pensil adalah Rp11.000. Harga 1 buku dan 3 pensil adalah Rp18.000. Tentukan harga satu buku dan satu pensil.",
        steps: [
          { text: "Misalkan b = harga 1 buku (dalam ribu rupiah) dan p = harga 1 pensil (dalam ribu rupiah)." },
          {
            text: "Terjemahkan kedua kalimat menjadi dua persamaan.",
            lines: [
              { tag: "①", lhs: "2b + p", rhs: "11" },
              { tag: "②", lhs: "b + 3p", rhs: "18" },
            ],
          },
          {
            text: "Lenyapkan b dengan kali silang: ① dikali 1 dan ② dikali 2.",
            lines: [
              { tag: "①", lhs: "2b + p", rhs: "11" },
              { tag: "②", lhs: "2(b + 3p)", rhs: "2(18)" },
              { tag: "②", lhs: "2b + 6p", rhs: "36" },
            ],
          },
          {
            text: "Koefisien b bertanda sama, maka kurangkan ② dengan ①.",
            lines: [
              { lhs: "(2b + 6p) − (2b + p)", rhs: "36 − 11" },
              { lhs: "2b + 6p − 2b − p", rhs: "25" },
              { lhs: "5p", rhs: "25" },
              { lhs: "p", rhs: frac(25, 5) },
              { lhs: "p", rhs: "5" },
            ],
          },
          {
            text: "Substitusikan p = 5 ke persamaan ①.",
            lines: [
              { lhs: "2b + (5)", rhs: "11" },
              { lhs: "2b", rhs: "11 − 5" },
              { lhs: "2b", rhs: "6" },
              { lhs: "b", rhs: frac(6, 2) },
              { lhs: "b", rhs: "3" },
            ],
          },
        ],
        answer:
          "Harga 1 buku Rp3.000 dan 1 pensil Rp5.000. Periksa: 2(3) + 5 = 11 benar, dan 3 + 3(5) = 18 benar.",
      },
    ],
  },
];

export const TOTAL_LEVELS = LEVELS.length;
export const TOTAL_SUBS = LEVELS.reduce((n, l) => n + l.subs.length, 0);

export function getSub(level: number, subIndex = 0): {
  levelDef: LevelDef;
  subDef: SubDef;
} {
  const li = Math.min(Math.max(level, 1), LEVELS.length) - 1;
  const levelDef = LEVELS[li];
  const si = Math.min(Math.max(subIndex, 0), levelDef.subs.length - 1);
  return { levelDef, subDef: levelDef.subs[si] };
}

export { eqLine };
