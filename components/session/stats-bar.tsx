"use client";

type Props = {
  content: string;
};

export function StatsBar({ content }: Props) {
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div className="px-4 md:px-8 py-2 md:py-3 flex justify-between items-center text-[10px] text-on-surface-variant font-label uppercase tracking-widest bg-surface/50 backdrop-blur-sm z-10 border-b border-outline-variant/5">
      <div className="flex gap-3 md:gap-6">
        <span>Words: {wordCount}</span>
        <span>Chars: {charCount}</span>
      </div>
    </div>
  );
}
