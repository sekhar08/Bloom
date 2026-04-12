'use client';

import { useState } from 'react';
import { generateVideoSummary } from '@/app/actions';
import { Sparkles, Loader2, RefreshCcw } from 'lucide-react';

interface SummaryData {
    title: string;
    summary: string;
    tags: string[];
}

export default function VideoSummary({ recordingId }: { recordingId: string }) {
    const [summary, setSummary] = useState<SummaryData | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError(false);

        const result = await generateVideoSummary(recordingId);

        if (result) {
            setSummary(result);
        } else {
            setError(true);
        }

        setIsGenerating(false);
    };

  if (summary) {
    return (
        <section className="ui-panel rounded-[2rem] p-6 md:p-8">
            <span className="ui-badge">AI Summary</span>
            <h3 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">{summary.title}</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)]">{summary.summary}</p>
            <div className="mt-5 flex flex-wrap gap-2">
            {summary.tags.map((tag) => (
                <span 
                key={tag} 
                className="rounded-full border border-[var(--border)] bg-[rgba(255,255,255,0.04)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--foreground-soft)]"
                >
                #{tag}
                </span>
            ))}
            </div>
        </section>
    );
  }

  return (
    <button
        type="button"
        onClick={handleGenerate}
        disabled={isGenerating}
        className="ui-panel ui-button-secondary w-full rounded-[1.75rem] px-5 py-4 disabled:cursor-not-allowed disabled:opacity-60"
        aria-live="polite"
    >
        {isGenerating ? (
            <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Analyzing Recording…
            </>
        ) : error ? (
            <>
            <RefreshCcw className="h-4 w-4" aria-hidden="true" />
            Try Again
            </>
        ) : (
            <>
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Generate AI Summary
            </>
        )}
    </button>
  );
}
