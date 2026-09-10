import { useEffect, useState } from 'react';
import { useI18n } from '../../i18n';

interface TocItem { id: string; text: string; level: number; }

export default function TableOfContents() {
  const { t } = useI18n();
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const elements = document.querySelectorAll('.markdown-body h1, .markdown-body h2, .markdown-body h3');
    const items: TocItem[] = [];
    elements.forEach(el => {
      const id = el.id;
      if (id) items.push({ id, text: el.textContent || '', level: parseInt(el.tagName[1]) });
    });
    setHeadings(items);

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) setActiveId(entry.target.id); });
    }, { rootMargin: '-20% 0px -80% 0px' });
    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (headings.length === 0) return null;

  return (
    <nav className="hidden xl:block sticky top-20 w-56 shrink-0">
      <h4 className="text-[12px] font-semibold mb-2 text-ink-400 dark:text-ink-500 uppercase tracking-wider">{t('common.toc')}</h4>
      <div className="space-y-0.5">
        {headings.map(h => (
          <a key={h.id} href={`#${h.id}`}
            className={`toc-link ${activeId === h.id ? 'active' : ''}`}
            style={{ paddingLeft: `${(h.level - 1) * 12 + 8}px` }}>
            {h.text}
          </a>
        ))}
      </div>
    </nav>
  );
}
