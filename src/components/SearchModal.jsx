import { useState, useMemo } from 'preact/hooks';

export default function SearchModal({ tools = [], isOpen = false, onClose }) {
  const [query, setQuery] = useState('');

  const filteredTools = useMemo(() => {
    if (!query.trim()) return tools.slice(0, 8);
    const q = query.toLowerCase();
    return tools.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.metaDescription.toLowerCase().includes(q) ||
        t.categoryName.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q)
    );
  }, [tools, query]);

  if (!isOpen) return null;

  return (
    <div class="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm flex items-start justify-center pt-16 px-4" onClick={onClose}>
      <div
        class="bg-canvas border border-hairline rounded-xl max-w-2xl w-full p-6 shadow-soft space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div class="flex items-center justify-between border-b border-hairline pb-4">
          <div class="flex items-center gap-3 flex-1">
            <svg class="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search 194 financial calculators..."
              value={query}
              onInput={(e) => setQuery(e.currentTarget.value)}
              class="w-full bg-transparent text-ink placeholder:text-muted font-sans text-base focus:outline-none"
              autoFocus
            />
          </div>
          <button type="button" onClick={onClose} class="text-muted hover:text-ink text-sm font-medium">
            Close
          </button>
        </div>

        <div class="max-h-96 overflow-y-auto space-y-2">
          {filteredTools.length === 0 ? (
            <div class="p-4 text-center text-sm text-muted font-mono">No matching calculators found.</div>
          ) : (
            filteredTools.map((t) => (
              <a
                key={t.slug}
                href={`/tools/${t.category}/${t.slug}/`}
                class="block p-3 rounded-lg hover:bg-surface-soft transition-colors group"
                onClick={onClose}
              >
                <div class="flex items-center justify-between">
                  <h4 class="text-sm font-semibold text-ink group-hover:text-primary transition-colors">{t.title}</h4>
                  <span class="text-[11px] font-mono text-muted">{t.categoryName}</span>
                </div>
                <p class="text-xs text-body line-clamp-1 mt-0.5">{t.metaDescription}</p>
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
