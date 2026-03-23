import type { Mood } from "@/types/journal";

export interface MoodMeta {
  readonly label: string;
  readonly labelId: string;
  readonly emoji: string;
  readonly color: string;
  readonly bgColor: string;
  readonly glowColor: string;
  readonly borderColor: string;
  readonly encouragement: string;
}

export const MOODS: Record<Mood, MoodMeta> = {
  happy: {
    label: "Happy",
    labelId: "Senang",
    emoji: "✨",
    color: "#facc15",
    bgColor: "bg-yellow-500/20",
    glowColor: "rgba(250, 204, 21, 0.5)",
    borderColor: "border-yellow-400",
    encouragement: "Wah, hari ini terasa menyenangkan ya~ Ceritakan lebih banyak!",
  },
  sad: {
    label: "Sad",
    labelId: "Sedih",
    emoji: "🌧️",
    color: "#60a5fa",
    bgColor: "bg-blue-500/20",
    glowColor: "rgba(96, 165, 250, 0.5)",
    borderColor: "border-blue-400",
    encouragement: "Tidak apa-apa untuk merasa sedih. Tuangkan semuanya di sini, aku mendengarmu.",
  },
  angry: {
    label: "Angry",
    labelId: "Marah",
    emoji: "🔥",
    color: "#f87171",
    bgColor: "bg-red-500/20",
    glowColor: "rgba(248, 113, 113, 0.5)",
    borderColor: "border-red-400",
    encouragement: "Marah itu manusiawi. Keluarkan semua yang mengganjal pikiranmu.",
  },
  anxious: {
    label: "Anxious",
    labelId: "Cemas",
    emoji: "🌀",
    color: "#c084fc",
    bgColor: "bg-purple-500/20",
    glowColor: "rgba(192, 132, 252, 0.5)",
    borderColor: "border-purple-400",
    encouragement: "Napas dalam-dalam. Kamu aman di sini. Mari kita ceritakan apa yang membuatmu cemas.",
  },
  calm: {
    label: "Calm",
    labelId: "Tenang",
    emoji: "🌿",
    color: "#34d399",
    bgColor: "bg-emerald-500/20",
    glowColor: "rgba(52, 211, 153, 0.5)",
    borderColor: "border-emerald-400",
    encouragement: "Ketenangan adalah anugerah. Rekam momen ini untuk masa depanmu.",
  },
  tired: {
    label: "Tired",
    labelId: "Lelah",
    emoji: "🌙",
    color: "#94a3b8",
    bgColor: "bg-slate-500/20",
    glowColor: "rgba(148, 163, 184, 0.5)",
    borderColor: "border-slate-400",
    encouragement: "Kamu sudah berusaha keras. Istirahat itu perlu. Ceritakan hari lelahmu.",
  },
  hopeful: {
    label: "Hopeful",
    labelId: "Penuh Harap",
    emoji: "🌟",
    color: "#fb923c",
    bgColor: "bg-orange-500/20",
    glowColor: "rgba(251, 146, 60, 0.5)",
    borderColor: "border-orange-400",
    encouragement: "Ada cahaya di ujung sana. Harapanmu sungguh indah. Bagikan mimpimu!",
  },
};
