import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n';

export default function SearchBar() {
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();
  const { t } = useI18n();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) navigate(`/search?keyword=${encodeURIComponent(keyword.trim())}`);
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)}
        placeholder={t('common.search')} className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none" />
      <svg className="w-4 h-4 absolute left-2.5 top-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </form>
  );
}
