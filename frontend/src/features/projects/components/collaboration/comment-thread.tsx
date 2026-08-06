"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar } from "@/components/shared/avatar";
import { Label } from "@/components/shared/label";
import { fmtDate } from "@/features/blueprints/blueprint-content";
import type { Comment } from "@/features/projects/collaboration-api";

export function CommentThread({
  comments,
  busy,
  onAdd,
  onEdit,
  onDelete,
}: {
  comments: Comment[];
  busy: boolean;
  onAdd: (body: string) => Promise<unknown>;
  onEdit: (commentId: string, body: string) => Promise<unknown>;
  onDelete: (commentId: string) => Promise<unknown>;
}) {
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState("");

  return (
    <div className="bg-bp-card border-bp-border rounded-xl border p-[14px_16px]">
      <Label>Comments ({comments.length})</Label>
      <ul className="m-0 mb-3 flex list-none flex-col gap-3 p-0">
        <AnimatePresence initial={false}>
          {comments.map((comment) => (
            <motion.li
              key={comment.id}
              layout
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-2.5"
            >
              <Avatar initials={comment.author_initials} size={28} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-bp-ink text-[12.5px] font-bold">
                    {comment.author_name}
                  </span>
                  <span className="text-bp-label text-[10.5px]">
                    {fmtDate(comment.created_at.slice(0, 10))}
                    {comment.edited_at ? " · edited" : ""}
                  </span>
                </div>
                {editingId === comment.id ? (
                  <div className="mt-1.5">
                    <textarea
                      value={editingBody}
                      onChange={(e) => setEditingBody(e.target.value)}
                      className="text-bp-ink border-bp-border w-full resize-y rounded-lg border p-[8px_10px] text-[12.5px] outline-none"
                    />
                    <div className="mt-1.5 flex gap-2">
                      <button
                        type="button"
                        disabled={busy || !editingBody.trim()}
                        onClick={() =>
                          onEdit(comment.id, editingBody).then(() => setEditingId(null))
                        }
                        className="bp-primary-btn"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="text-bp-muted cursor-pointer border-none bg-transparent text-[11.5px] font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-bp-body m-0 mt-0.5 text-[12.5px] leading-relaxed whitespace-pre-wrap">
                    {comment.body}
                  </p>
                )}
                {comment.is_mine && editingId !== comment.id && (
                  <div className="mt-1 flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(comment.id);
                        setEditingBody(comment.body);
                      }}
                      className="text-bp-muted cursor-pointer border-none bg-transparent p-0 text-[11px] font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onDelete(comment.id)}
                      className="text-bp-red cursor-pointer border-none bg-transparent p-0 text-[11px] font-semibold disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Add a comment…"
        className="text-bp-ink border-bp-border mb-2 min-h-[70px] w-full resize-y rounded-lg border p-[10px_12px] text-[12.5px] outline-none"
      />
      <button
        type="button"
        disabled={busy || !draft.trim()}
        onClick={() => onAdd(draft).then(() => setDraft(""))}
        className="bp-primary-btn disabled:cursor-not-allowed disabled:opacity-50"
      >
        Comment
      </button>
    </div>
  );
}
