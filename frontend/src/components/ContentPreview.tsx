"use client";

/** Inline preview for lesson media (TASK step 17 — video / PDF). */
export function ContentPreview({
  title,
  type,
  fileUrl,
}: {
  title: string;
  type: string;
  fileUrl: string;
}) {
  const t = type.trim().toLowerCase();

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-900/5 shadow-inner">
      <div className="border-b border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-800">
        Preview — {title}
      </div>
      <div className="aspect-video max-h-[min(70vh,560px)] w-full bg-black/5">
        {t === "video" ? (
          <video
            className="h-full w-full object-contain"
            src={fileUrl}
            controls
            playsInline
            preload="metadata"
          >
            <track kind="captions" />
          </video>
        ) : (
          <iframe
            title={title}
            src={fileUrl}
            className="h-full min-h-[480px] w-full"
          />
        )}
      </div>
    </div>
  );
}
