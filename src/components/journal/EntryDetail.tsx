"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import type { JournalEntry } from "@/types/journal";
import { MOODS } from "@/lib/data/moods";
import { formatFullDate, formatRelativeDate } from "@/lib/utils/dateFormat";
import { Button } from "@/components/ui/Button";
import { DeleteConfirm } from "./DeleteConfirm";

interface EntryDetailProps {
  entry: JournalEntry;
}

export function EntryDetail({ entry }: EntryDetailProps) {
  const [showDelete, setShowDelete] = useState(false);
  const mood = MOODS[entry.mood];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        {/* Back link */}
        <Link
          href="/history"
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Back to history
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-3">
            <span className="text-4xl">{mood.emoji}</span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${mood.bgColor}`}
              style={{ color: mood.color }}
            >
              {mood.labelId}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
            {entry.title}
          </h1>
          <div className="flex flex-wrap gap-3 text-xs text-white/40">
            <span>Written {formatRelativeDate(entry.createdAt)}</span>
            <span>·</span>
            <span>{formatFullDate(entry.createdAt)}</span>
            {entry.updatedAt !== entry.createdAt && (
              <>
                <span>·</span>
                <span>Edited {formatRelativeDate(entry.updatedAt)}</span>
              </>
            )}
          </div>
        </motion.div>

        {/* Divider with glow */}
        <div
          className="h-px w-full"
          style={{
            background: `linear-gradient(to right, ${mood.color}40, transparent)`,
          }}
        />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-white/80 whitespace-pre-wrap leading-relaxed text-base"
        >
          {entry.content}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex gap-3 pt-4 border-t border-white/10"
        >
          <Link href={`/write?edit=${entry.id}`}>
            <Button variant="secondary" size="sm">
              <Pencil size={14} />
              Edit
            </Button>
          </Link>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowDelete(true)}
          >
            <Trash2 size={14} />
            Delete
          </Button>
        </motion.div>
      </motion.div>

      <DeleteConfirm
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        entryId={entry.id}
        entryTitle={entry.title}
      />
    </>
  );
}
