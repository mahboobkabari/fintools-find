export default function ShareActions({ onShare, onReset, copiedToast = false }) {
  return (
    <div class="flex items-center gap-2">
      <button
        type="button"
        onClick={onShare}
        class="px-3 py-1.5 bg-surface-strong hover:bg-hairline text-ink text-xs font-semibold rounded-pill transition-colors flex items-center gap-1.5 border border-hairline focus:outline-none focus:ring-2 focus:ring-primary"
        title="Copy shareable scenario URL"
      >
        <svg class="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
        </svg>
        <span>{copiedToast ? 'Copied!' : 'Share'}</span>
      </button>

      {onReset && (
        <button
          type="button"
          onClick={onReset}
          class="px-3 py-1.5 bg-surface-strong hover:bg-hairline text-muted hover:text-ink text-xs font-semibold rounded-pill transition-colors border border-hairline focus:outline-none focus:ring-2 focus:ring-primary"
          title="Reset to defaults"
        >
          Reset
        </button>
      )}
    </div>
  );
}
