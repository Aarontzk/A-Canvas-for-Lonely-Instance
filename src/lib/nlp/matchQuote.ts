import type { Mood } from "@/types/journal";

// ── Types ────────────────────────────────────────────────
type Theme =
  | "loneliness"
  | "love"
  | "sadness"
  | "anger"
  | "anxiety"
  | "growth"
  | "peace"
  | "hope"
  | "strength"
  | "gratitude"
  | "work"
  | "friendship"
  | "family";

interface ThemedQuote {
  readonly text: string;
  readonly author: string;
  readonly theme: Theme;
}

// ── Indonesian keyword lists per theme ───────────────────
const THEME_KEYWORDS: Record<Theme, readonly string[]> = {
  loneliness: [
    "sendiri", "sepi", "kesepian", "sendirian", "hampa", "kosong",
    "ditinggal", "alone", "lonely", "sunyi", "isolasi", "jauh",
    "ngobrol", "gaada", "gak ada", "ditinggalin", "diabaikan",
  ],
  love: [
    "cinta", "sayang", "suka", "rindu", "kangen", "hati", "kasih",
    "pacar", "pasangan", "love", "romantis", "peluk", "mesra",
  ],
  sadness: [
    "sedih", "nangis", "menangis", "hancur", "patah", "galau", "kecewa",
    "duka", "pilu", "perih", "luka", "kehilangan", "hilang", "menyesal",
    "gagal", "pecundang", "malu", "minder", "bodoh", "payah", "buruk",
    "jelek", "down", "hopeless", "nyesel", "sia-sia", "rendah",
    "nggak bisa", "gak bisa", "loser", "worthless", "lemah",
  ],
  anger: [
    "marah", "kesal", "benci", "emosi", "frustasi", "jengkel", "dongkol",
    "geram", "murka", "sewot", "sebal", "dendam", "sanaa",
  ],
  anxiety: [
    "cemas", "takut", "khawatir", "gelisah", "panik", "gugup", "tegang",
    "stress", "overthink", "insomnia", "resah", "waswas", "deg",
    "pusing", "bingung", "blank", "grogi", "mual", "berbelit", "nyambung",
  ],
  growth: [
    "belajar", "tumbuh", "berkembang", "progress", "maju", "berubah",
    "improve", "skill", "proses", "usaha", "upgrade", "level",
  ],
  peace: [
    "damai", "tenang", "nyaman", "rileks", "santai", "tentram",
    "meditasi", "harmoni", "seimbang", "hening", "diam", "calm",
  ],
  hope: [
    "harap", "berharap", "impian", "mimpi", "semangat", "yakin",
    "optimis", "percaya", "masa depan", "harapan", "dream",
  ],
  strength: [
    "kuat", "bangkit", "bertahan", "survive", "pejuang", "tangguh",
    "tegar", "gigih", "berani", "tabah", "pantang", "fighter",
    "gagal", "jatuh", "kalah", "pecundang",
  ],
  gratitude: [
    "syukur", "bersyukur", "grateful", "nikmat", "berkah", "anugerah",
    "karunia", "apresiasi", "terima kasih", "thankful", "blessed",
  ],
  work: [
    "kerja", "deadline", "tugas", "kantor", "sibuk",
    "meeting", "proyek", "project", "lembur", "produktif", "karir",
  ],
  friendship: [
    "teman", "sahabat", "bareng", "bersama", "hangout", "kumpul",
    "nongkrong", "seru", "rame", "bestie", "geng", "squad",
  ],
  family: [
    "keluarga", "mama", "papa", "ibu", "ayah", "kakak", "adik",
    "saudara", "rumah", "orang tua", "anak", "nenek", "kakek",
  ],
};

// ── Mood → theme fallback mapping ────────────────────────
const MOOD_THEMES: Record<Mood, readonly Theme[]> = {
  happy: ["gratitude", "hope", "love"],
  sad: ["sadness", "strength", "hope"],
  angry: ["anger", "strength", "peace"],
  anxious: ["anxiety", "peace", "hope"],
  calm: ["peace", "gratitude", "growth"],
  tired: ["strength", "peace", "hope"],
  hopeful: ["hope", "growth", "strength"],
};

// ── Themed quote bank ────────────────────────────────────
const THEMED_QUOTES: readonly ThemedQuote[] = [
  // Loneliness
  { text: "Kesendirian bukan berarti kamu sendirian. Kadang itu ruang untuk mendengar dirimu sendiri.", author: "Tere Liye", theme: "loneliness" },
  { text: "The soul that sees beauty may sometimes walk alone.", author: "Johann Wolfgang von Goethe", theme: "loneliness" },
  { text: "Di balik kesendirian, ada keberanian yang sedang tumbuh diam-diam.", author: "Boy Candra", theme: "loneliness" },
  { text: "Loneliness adds beauty to life. It puts a special burn on sunsets and makes night air smell better.", author: "Henry Rollins", theme: "loneliness" },
  // Love
  { text: "Cinta bukan tentang memiliki, tapi tentang memberi tanpa mengharap.", author: "Kahlil Gibran", theme: "love" },
  { text: "The best thing to hold onto in life is each other.", author: "Audrey Hepburn", theme: "love" },
  { text: "Cinta itu seperti angin, kau tak bisa melihatnya tapi kau bisa merasakannya.", author: "Nicholas Sparks", theme: "love" },
  { text: "We loved with a love that was more than love.", author: "Edgar Allan Poe", theme: "love" },
  // Sadness
  { text: "Air mata bukan tanda kelemahan. Itu tanda bahwa kamu sudah kuat terlalu lama.", author: "Johnny Depp", theme: "sadness" },
  { text: "Every storm runs out of rain, every dark night turns into day.", author: "Gary Allan", theme: "sadness" },
  { text: "Kadang yang paling menyakitkan bukan kehilangan, tapi mengetahui kamu tak bisa berbuat apa-apa.", author: "Fiersa Besari", theme: "sadness" },
  { text: "The wound is the place where the light enters you.", author: "Rumi", theme: "sadness" },
  // Anger
  { text: "Marah itu manusiawi, tapi jangan biarkan marahmu mengambil kebijakanmu.", author: "Ali bin Abi Thalib", theme: "anger" },
  { text: "For every minute you are angry, you lose sixty seconds of happiness.", author: "Ralph Waldo Emerson", theme: "anger" },
  { text: "Orang kuat bukan yang menang dalam pertarungan, tapi yang menahan diri saat marah.", author: "Hadits Nabi", theme: "anger" },
  { text: "Anger is an acid that does more harm to the vessel in which it is stored.", author: "Mark Twain", theme: "anger" },
  // Anxiety
  { text: "Kecemasan tidak mengosongkan hari esok dari kesedihannya, tapi mengosongkan hari ini dari kekuatannya.", author: "Corrie ten Boom", theme: "anxiety" },
  { text: "You don't have to control your thoughts. You just have to stop letting them control you.", author: "Dan Millman", theme: "anxiety" },
  { text: "Tarik napas. Lepaskan. Dan percayalah bahwa semua akan baik-baik saja.", author: "Anonim", theme: "anxiety" },
  { text: "Nothing diminishes anxiety faster than action.", author: "Walter Anderson", theme: "anxiety" },
  // Growth
  { text: "Perubahan tidak akan datang jika kita menunggu orang lain. Kitalah yang ditunggu.", author: "Barack Obama", theme: "growth" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", theme: "growth" },
  { text: "Proses tidak pernah mengkhianati hasil. Tetap bergerak, walau pelan.", author: "Anonim", theme: "growth" },
  { text: "Growth is painful. Change is painful. But nothing is as painful as staying stuck.", author: "Mandy Hale", theme: "growth" },
  // Peace
  { text: "Ketenangan bukan tentang berada di tempat tanpa kebisingan, tapi tentang menemukan kedamaian di tengah badai.", author: "Anonim", theme: "peace" },
  { text: "Peace comes from within. Do not seek it without.", author: "Buddha", theme: "peace" },
  { text: "Di keheningan, kamu akan menemukan jawaban yang selama ini kamu cari.", author: "Eckhart Tolle", theme: "peace" },
  { text: "The life of inner peace, being harmonious and without stress, is the easiest type of existence.", author: "Norman Vincent Peale", theme: "peace" },
  // Hope
  { text: "Selalu ada harapan di balik setiap malam yang paling gelap.", author: "Anonim", theme: "hope" },
  { text: "Hope is being able to see that there is light despite all of the darkness.", author: "Desmond Tutu", theme: "hope" },
  { text: "Mimpi tidak punya tanggal kedaluwarsa. Tarik napas dan coba lagi.", author: "KidPresident", theme: "hope" },
  { text: "Once you choose hope, anything's possible.", author: "Christopher Reeve", theme: "hope" },
  // Strength
  { text: "Kamu lebih kuat dari yang kamu pikirkan, lebih berani dari yang kamu rasakan.", author: "A.A. Milne", theme: "strength" },
  { text: "She was powerful not because she wasn't scared but because she went on so strongly despite the fear.", author: "Atticus", theme: "strength" },
  { text: "Jatuh bukan akhir segalanya. Yang terpenting adalah bangun lagi.", author: "Anonim", theme: "strength" },
  { text: "Rock bottom became the solid foundation on which I rebuilt my life.", author: "J.K. Rowling", theme: "strength" },
  // Gratitude
  { text: "Bersyukur bukan karena segalanya sempurna, tapi karena kita bisa melihat keindahan di balik ketidaksempurnaan.", author: "Anonim", theme: "gratitude" },
  { text: "Gratitude turns what we have into enough.", author: "Melody Beattie", theme: "gratitude" },
  { text: "Nikmat yang paling sering dilupakan adalah kesehatan dan waktu luang.", author: "Hadits Nabi", theme: "gratitude" },
  { text: "When you are grateful, fear disappears and abundance appears.", author: "Tony Robbins", theme: "gratitude" },
  // Work
  { text: "Istirahat sejenak bukan berarti menyerah. Itu berarti kamu menghargai dirimu sendiri.", author: "Anonim", theme: "work" },
  { text: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott", theme: "work" },
  { text: "Kamu tidak harus menyukai prosesnya, cukup jalani dan lihat hasilnya nanti.", author: "Anonim", theme: "work" },
  { text: "You are not defined by your job. You are defined by how you treat yourself after a hard day.", author: "Anonim", theme: "work" },
  // Friendship
  { text: "Teman sejati bukan yang hadir saat kamu di puncak, tapi yang bertahan saat kamu di bawah.", author: "Anonim", theme: "friendship" },
  { text: "A real friend is one who walks in when the rest of the world walks out.", author: "Walter Winchell", theme: "friendship" },
  { text: "Persahabatan itu seperti bintang. Tak selalu terlihat, tapi selalu ada.", author: "Anonim", theme: "friendship" },
  { text: "Friendship is born at that moment when one person says to another, 'What! You too?'", author: "C.S. Lewis", theme: "friendship" },
  // Family
  { text: "Keluarga bukan soal darah yang sama, tapi tentang siapa yang mau bertahan bersamamu.", author: "Anonim", theme: "family" },
  { text: "Family is not an important thing. It's everything.", author: "Michael J. Fox", theme: "family" },
  { text: "Rumah bukan tentang tempatnya, tapi tentang orang-orang di dalamnya.", author: "Anonim", theme: "family" },
  { text: "The love of a family is life's greatest blessing.", author: "Anonim", theme: "family" },
];

// ── NLP helpers ──────────────────────────────────────────

/** Simple Indonesian affix stripping for fuzzy keyword matching */
function stem(word: string): string {
  let w = word;
  // Strip common Indonesian prefixes
  w = w.replace(/^(meny|meng|mem|men|me|ber|ter|per|pen|pem|peny|peng|di|ke|se)/, "");
  // Strip common suffixes
  w = w.replace(/(kan|an|nya|lah|kah|ku|mu|i)$/, "");
  return w.length > 2 ? w : word;
}

/** Tokenize Indonesian/English text: lowercase, strip punctuation, remove short words */
function tokenize(text: string): readonly string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

/** Deterministic hash from string — ensures same entry always gets same quote */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// ── Main export ──────────────────────────────────────────

export interface MatchedQuote {
  readonly text: string;
  readonly author: string;
  readonly theme: Theme;
  readonly confidence: number; // 0-1 how well the entry matched
}

/**
 * Analyze journal entry text using lightweight NLP and return the best matching quote.
 *
 * Pipeline:
 * 1. Tokenize + stem the entry content
 * 2. Score each theme by counting keyword matches (exact + stemmed)
 * 3. Apply mood-based bonus for relevant themes
 * 4. Pick the highest-scoring theme
 * 5. Select a quote deterministically from that theme (based on content hash)
 */
export function matchQuoteToEntry(content: string, mood: Mood): MatchedQuote {
  const tokens = tokenize(content);
  const stemmedTokens = tokens.map(stem);

  // Score each theme
  const scores: Record<string, number> = {};
  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      const kwStem = stem(keyword);
      for (let i = 0; i < tokens.length; i++) {
        // Exact match (higher weight)
        if (tokens[i] === keyword || tokens[i].includes(keyword)) {
          score += 3;
        }
        // Stemmed match
        else if (stemmedTokens[i] === kwStem || stemmedTokens[i].includes(kwStem)) {
          score += 2;
        }
      }
    }
    scores[theme] = score;
  }

  // Apply mood-based bonus
  const moodThemes = MOOD_THEMES[mood];
  for (let i = 0; i < moodThemes.length; i++) {
    const bonus = (moodThemes.length - i) * 2; // first theme gets highest bonus
    scores[moodThemes[i]] = (scores[moodThemes[i]] ?? 0) + bonus;
  }

  // Find best theme
  let bestTheme: Theme = moodThemes[0];
  let bestScore = 0;
  for (const [theme, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestTheme = theme as Theme;
    }
  }

  // Filter quotes for that theme
  const themeQuotes = THEMED_QUOTES.filter((q) => q.theme === bestTheme);

  // Deterministic pick using content hash
  const hash = hashCode(content);
  const quote = themeQuotes[hash % themeQuotes.length];

  // Confidence: how much came from content vs mood fallback
  const moodBonus = moodThemes.reduce((sum, t, i) => (
    t === bestTheme ? sum + (moodThemes.length - i) * 2 : sum
  ), 0);
  const contentScore = bestScore - moodBonus;
  const confidence = Math.min(contentScore / 10, 1);

  return {
    text: quote.text,
    author: quote.author,
    theme: bestTheme,
    confidence,
  };
}
