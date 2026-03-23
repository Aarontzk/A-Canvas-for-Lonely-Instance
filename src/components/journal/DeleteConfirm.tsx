"use client";

import { useRouter } from "next/navigation";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { useToast } from "@/hooks/useToast";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ToastList } from "@/components/ui/Toast";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  entryId: string;
  entryTitle: string;
}

export function DeleteConfirm({
  isOpen,
  onClose,
  entryId,
  entryTitle,
}: DeleteConfirmProps) {
  const router = useRouter();
  const { deleteEntry } = useJournalEntries();
  const { toasts, addToast, removeToast } = useToast();

  const handleDelete = () => {
    deleteEntry(entryId);
    addToast("Entry deleted.", "info");
    onClose();
    setTimeout(() => router.push("/history"), 500);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Delete Entry">
        <div className="space-y-5">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-white/70">
              Are you sure you want to delete{" "}
              <span className="text-white font-medium">&quot;{entryTitle}&quot;</span>?
              This cannot be undone.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} className="flex-1">
              Delete
            </Button>
          </div>
        </div>
      </Modal>
      <ToastList toasts={toasts} onRemove={removeToast} />
    </>
  );
}
