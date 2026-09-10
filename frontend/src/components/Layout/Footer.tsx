import { useSiteConfigStore } from '../../stores/useSiteConfigStore';

export default function Footer() {
  const { configs } = useSiteConfigStore();
  return (
    <footer className="border-t border-ink-100 dark:border-ink-800">
      <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col gap-1 text-[13px] text-ink-400 dark:text-ink-500">
        <p>{configs.site_footer || '\u00a9 2026 HuangML. All Rights Reserved'}</p>
        {configs.icp_number && <p className="text-[12px]">{configs.icp_number}</p>}
      </div>
    </footer>
  );
}
