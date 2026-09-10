import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { articleApi } from '../../api/articleApi';
import { categoryApi } from '../../api/categoryApi';
import { useQuery } from '@tanstack/react-query';
import { useI18n } from '../../i18n';
import type { ArticleFetchResult } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ArticleFetchDialog({ open, onClose }: Props) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<ArticleFetchResult | null>(null);
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [status, setStatus] = useState(0); // 0=draft, 1=published
  const [error, setError] = useState('');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll().then(r => r.data),
  });

  if (!open) return null;

  const handleParse = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await articleApi.fetch.parse(url.trim());
      setResult(res.data);
      if (res.data.title) {
        // Auto-detect category if possible
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || t('fetch.parseFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndEdit = () => {
    if (!result) return;
    if (categoryId === '') {
      setError(t('editor.categoryRequired'));
      return;
    }
    // Navigate to editor with prefilled data
    navigate('/admin/articles/new', {
      state: {
        prefilled: {
          title: result.title,
          content: result.content,
          summary: result.summary,
          sourceUrl: result.sourceUrl,
          sourceName: result.sourceName,
          sourceAuthor: result.author,
          coverImage: result.coverImage,
          images: result.images,
          categoryId: Number(categoryId),
          status,
        },
      },
    });
    onClose();
    resetForm();
  };

  const handleDirectSave = async () => {
    if (!result) return;
    if (categoryId === '') {
      setError(t('editor.categoryRequired'));
      return;
    }
    setSaving(true);
    setError('');
    try {
      await articleApi.fetch.save({
        title: result.title,
        content: result.content,
        summary: result.summary,
        author: result.author,
        sourceName: result.sourceName,
        coverImage: result.coverImage,
        sourceUrl: result.sourceUrl,
        images: result.images,
        categoryId: Number(categoryId),
        status,
      });
      onClose();
      resetForm();
      // Refresh article list
      window.location.reload();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || t('fetch.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setUrl('');
    setResult(null);
    setError('');
    setCategoryId('');
    setStatus(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white dark:bg-ink-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-ink-100 dark:border-ink-800">
          <h2 className="font-serif text-lg font-bold italic text-ink-900 dark:text-ink-100">
            {t('fetch.title')}
          </h2>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 transition-colors text-xl">
            ×
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* URL Input */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-ink-400 mb-1.5">
              {t('fetch.urlLabel')}
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder={t('fetch.urlPlaceholder')}
                className="flex-1 px-3 py-2 text-sm bg-transparent border border-ink-200 dark:border-ink-700 rounded-md outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
                onKeyDown={e => e.key === 'Enter' && handleParse()}
              />
              <button
                onClick={handleParse}
                disabled={loading || !url.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-md transition-colors disabled:opacity-40"
              >
                {loading ? t('fetch.parsing') : t('fetch.parse')}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Parse Result */}
          {result && (
            <>
              <div className="border-t border-ink-100 dark:border-ink-800 pt-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-ink-400 mb-1">
                    {t('fetch.resultTitle')}
                  </label>
                  <p className="text-sm font-medium text-ink-800 dark:text-ink-200">{result.title}</p>
                </div>

                <div className="flex gap-4">
                  {result.sourceName && (
                    <div>
                      <span className="text-xs text-ink-400">{t('fetch.sourceName')}: </span>
                      <span className="text-sm text-ink-600 dark:text-ink-300">{result.sourceName}</span>
                    </div>
                  )}
                  {result.author && (
                    <div>
                      <span className="text-xs text-ink-400">{t('fetch.sourceAuthor')}: </span>
                      <span className="text-sm text-ink-600 dark:text-ink-300">{result.author}</span>
                    </div>
                  )}
                </div>

                {result.images && (
                  <p className="text-xs text-ink-400">
                    {t('fetch.imageCount', { count: result.images.length })}
                  </p>
                )}

                {result.summary && (
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-ink-400 mb-1">
                      {t('fetch.resultSummary')}
                    </label>
                    <p className="text-sm text-ink-500 dark:text-ink-400 line-clamp-3">{result.summary}</p>
                  </div>
                )}
              </div>

              {/* Save Options */}
              <div className="border-t border-ink-100 dark:border-ink-800 pt-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-ink-400 mb-1.5">
                    {t('editor.selectCategory')}
                  </label>
                  <select
                    value={categoryId}
                    onChange={e => setCategoryId(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-transparent border border-ink-200 dark:border-ink-700 rounded-md outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
                  >
                    <option value="">{t('editor.selectCategory')}</option>
                    {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-ink-600 dark:text-ink-300 cursor-pointer">
                    <input type="radio" checked={status === 0} onChange={() => setStatus(0)} className="accent-accent" />
                    {t('dashboard.draft')}
                  </label>
                  <label className="flex items-center gap-2 text-sm text-ink-600 dark:text-ink-300 cursor-pointer">
                    <input type="radio" checked={status === 1} onChange={() => setStatus(1)} className="accent-accent" />
                    {t('dashboard.published')}
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveAndEdit}
                  className="flex-1 px-4 py-2 text-sm font-medium text-accent border border-accent/40 hover:bg-accent/5 rounded-md transition-colors"
                >
                  {t('fetch.editBeforeSave')}
                </button>
                <button
                  onClick={handleDirectSave}
                  disabled={saving}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-md transition-colors disabled:opacity-40"
                >
                  {saving ? t('fetch.saving') : t('fetch.directSave')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
