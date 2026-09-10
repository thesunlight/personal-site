import { useI18n } from '../../i18n';

interface Props { current: number; total: number; pages: number; onChange: (page: number) => void; }

export default function Pagination({ current, pages, onChange }: Props) {
  const { t } = useI18n();
  if (pages <= 1) return null;
  const items: number[] = [];
  for (let i = Math.max(1, current - 2); i <= Math.min(pages, current + 2); i++) items.push(i);

  return (
    <div className="flex items-center justify-center gap-1 text-sm">
      <button onClick={() => onChange(current - 1)} disabled={current === 1}
        className="px-2.5 py-1 text-[13px] text-ink-400 hover:text-accent disabled:opacity-30 disabled:hover:text-ink-400 transition-colors">
        ← {t('common.prev')}
      </button>
      {items[0] > 1 && <><button onClick={() => onChange(1)} className="w-8 h-8 text-[13px] text-ink-500 hover:text-accent transition-colors">1</button>
        {items[0] > 2 && <span className="text-ink-300 dark:text-ink-600">…</span>}</>}
      {items.map(i => (
        <button key={i} onClick={() => onChange(i)}
          className={`w-8 h-8 text-[13px] rounded-md transition-colors ${i === current ? 'text-accent font-semibold' : 'text-ink-500 hover:text-accent'}`}>
          {i}
        </button>
      ))}
      {items[items.length - 1] < pages && <>{items[items.length - 1] < pages - 1 && <span className="text-ink-300 dark:text-ink-600">…</span>}
        <button onClick={() => onChange(pages)} className="w-8 h-8 text-[13px] text-ink-500 hover:text-accent transition-colors">{pages}</button></>}
      <button onClick={() => onChange(current + 1)} disabled={current === pages}
        className="px-2.5 py-1 text-[13px] text-ink-400 hover:text-accent disabled:opacity-30 disabled:hover:text-ink-400 transition-colors">
        {t('common.next')} →
      </button>
    </div>
  );
}
