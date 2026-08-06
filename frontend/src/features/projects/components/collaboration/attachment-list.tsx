"use client";

import { useRef } from "react";
import { Paperclip, Trash } from "@phosphor-icons/react";
import { Label } from "@/components/shared/label";
import { ATTACHMENT_ACCEPT, type Attachment } from "@/features/projects/collaboration-api";

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentList({
  attachments,
  busy,
  canDelete,
  onUpload,
  onDelete,
}: {
  attachments: Attachment[];
  busy: boolean;
  canDelete: (attachment: Attachment) => boolean;
  onUpload: (file: File) => Promise<unknown>;
  onDelete: (attachmentId: string) => Promise<unknown>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-bp-card border-bp-border rounded-xl border p-[14px_16px]">
      <div className="mb-2.5 flex items-center justify-between">
        <Label>Attachments ({attachments.length})</Label>
        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="text-bp-teal flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-[11.5px] font-bold disabled:opacity-50"
        >
          <Paperclip size={12} weight="bold" /> Add
        </button>
        <input
          ref={fileRef}
          type="file"
          accept={ATTACHMENT_ACCEPT}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
            e.target.value = "";
          }}
        />
      </div>
      {attachments.length === 0 ? (
        <p className="text-bp-muted m-0 text-[12px]">No screenshots or files attached yet.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
          {attachments.map((file) => (
            <li
              key={file.id}
              className="bg-bp-tint border-bp-border-soft flex items-center justify-between gap-2 rounded-lg border p-[8px_10px]"
            >
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-bp-ink min-w-0 flex-1 truncate text-[12px] font-semibold underline underline-offset-2"
              >
                {file.file_name}
              </a>
              <span className="text-bp-muted shrink-0 text-[11px] tabular-nums">
                {fmtSize(file.size_bytes)}
              </span>
              {canDelete(file) && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onDelete(file.id)}
                  className="text-bp-red cursor-pointer border-none bg-transparent p-0 disabled:opacity-50"
                >
                  <Trash size={12} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
