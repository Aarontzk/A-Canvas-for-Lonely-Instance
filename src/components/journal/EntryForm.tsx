"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { Mood, JournalEntry } from "@/types/journal";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { useToast } from "@/hooks/useToast";
import { MoodPicker } from "./MoodPicker";
import { Button } from "@/components/ui/Button";
import { ToastList } from "@/components/ui/Toast";
import { Save, Trash2 } from "lucide-react";

interface EntryFormProps {
  editEntry?: JournalEntry;
  onMoodChange?: (mood: Mood | null) => void;
}

const MAX_TITLE = 100;
const MAX_CONTENT = 5000;

export function EntryForm({ editEntry, onMoodChange }: EntryFormProps) {
  const router = useRouter();
  const { addEntry, updateEntry } = useJournalEntries();
  const { toasts, addToast, removeToast } = useToast();

  const [title, setTitle] = useState(editEntry?.title ?? "");
  const [content, setContent] = useState(editEntry?.content ?? "");
  const [mood, setMood] = useState<Mood | null>(editEntry?.mood ?? null);
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea
  const growTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    growTextarea();
  }, [content, growTextarea]);

  const handleMoodChange = (m: Mood) => {
    setMood(m);
    onMoodChange?.(m);
  };

  const canSubmit = title.trim().length > 0 && content.trim().length > 0 && mood !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      if (editEntry) {
        updateEntry(editEntry.id, { title: title.trim(), content: content.trim(), mood: mood! });
        addToast("Entry updated! ✨", "success");
      } else {
        addEntry(title.trim(), content.trim(), mood!);
        addToast("Entry saved! 🌟", "success");
        setTitle("");
        setContent("");
        setMood(null);
        onMoodChange?.(null);
      }
      setTimeout(() => router.push("/history"), 1000);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    if ((title || content) && !confirm("Discard this entry?")) return;
    router.push("/");
  };

  return (
    <>
      <motion.form
        onSubmit={handleSubmit}
        className="space-y-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Title */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-white/60">Title</label>
            <span className="text-xs text-white/30">
              {title.length}/{MAX_TITLE}
            </span>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE))}
            placeholder="What's on your mind today?"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/30 transition-all"
          />
        </div>

        {/* Mood */}
        <MoodPicker value={mood} onChange={handleMoodChange} />

        {/* Content */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-white/60">
              Pour your heart out
            </label>
            <span className="text-xs text-white/30">
              {content.length}/{MAX_CONTENT}
            </span>
          </div>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              setContent(e.target.value.slice(0, MAX_CONTENT));
              growTextarea();
            }}
            placeholder="Write freely... no one is judging. This is your safe space."
            rows={5}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/30 transition-all resize-none leading-relaxed"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button
            type="submit"
            variant="primary"
            glow
            loading={loading}
            disabled={!canSubmit}
            className="flex-1"
          >
            <Save size={16} />
            {editEntry ? "Update Entry" : "Save Entry"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleDiscard}
          >
            <Trash2 size={16} />
            Discard
          </Button>
        </div>
      </motion.form>
      <ToastList toasts={toasts} onRemove={removeToast} />
    </>
  );
}
