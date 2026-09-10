import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Vditor from 'vditor';
import 'vditor/dist/index.css';
import { articleApi } from '../../../api/articleApi';
import { categoryApi } from '../../../api/categoryApi';
import { tagApi } from '../../../api/tagApi';
import { useI18n } from '../../../i18n';

export default function ArticleEditor() {
  const { t, lang } = useI18n();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const vditorRef = useRef<Vditor | null>(null);
  const editorDomRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [status, setStatus] = useState(1);
  const [isTop, setIsTop] = useState(0);
  const [error, setError] = useState('');
  const [pendingContent, setPendingContent] = useState<string | null>(null);

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: () => categoryApi.getAll().then(r => r.data) });
  const { data: tags } = useQuery({ queryKey: ['tags'], queryFn: () => tagApi.getAll().then(r => r.data) });

  const { data: article } = useQuery({
    queryKey: ['editArticle', id],
    queryFn: () => articleApi.getListAll({ page: 1, size: 1 }).then(async () => {
      const res = await articleApi.getListAll({ page: 1, size: 1000 });
      return res.data.records.find((a: any) => a.id === Number(id));
    }),
    enabled: isEdit,
  });

  // Fill form fields when article data arrives
  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setSlug(article.slug);
      setSummary(article.summary || '');
      setCategoryId(article.categoryName ? (categories?.find(c => c.name === article.categoryName)?.id ?? '') : '');
      setTagIds(article.tags?.map((tg: any) => tg.id) || []);
      setStatus(article.status);
      setIsTop(article.isTop);
      // Fetch full content for editing
      fetch(`/api/articles/${article.slug}`)
        .then(r => r.json())
        .then(r => { if (r.data?.content) setPendingContent(r.data.content); });
    }
  }, [article, categories]);

  // Initialize Vditor once the DOM element is ready
  useEffect(() => {
    if (!editorDomRef.current || vditorRef.current) return;

    vditorRef.current = new Vditor(editorDomRef.current, {
      height: 500,
      mode: 'ir', // instant render — type `# ` and it becomes a heading in-place
      placeholder: t('editor.contentPlaceholder') || 'Write your content here...',
      lang: lang === 'zh' ? 'zh_CN' : 'en_US',
      toolbar: [
        'headings', 'bold', 'italic', 'strike', '|',
        'list', 'ordered-list', 'check', '|',
        'quote', 'code', 'inline-code', 'link', 'table', '|',
        'undo', 'redo', '|',
        'fullscreen',
      ],
      preview: {
        hljs: { style: 'github', lineNumber: false },
      },
      cache: { enable: false },
      after: () => {
        // If we already fetched content for editing, set it now
        if (pendingContent !== null && vditorRef.current) {
          vditorRef.current.setValue(pendingContent);
          setPendingContent(null);
        }
      },
    });

    return () => {
      vditorRef.current?.destroy();
      vditorRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When content arrives after Vditor is initialized, inject it
  useEffect(() => {
    if (pendingContent !== null && vditorRef.current) {
      vditorRef.current.setValue(pendingContent);
      setPendingContent(null);
    }
  }, [pendingContent]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => isEdit ? articleApi.update(Number(id), data) : articleApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminArticles'] });
      navigate('/admin/articles');
    },
    onError: (err: any) => {
      const msg = err?.message || '';
      if (/timeout/i.test(msg) || err?.code === 'ECONNABORTED') {
        setError(t('editor.saveTimeout'));
      } else if (err?.code === 'ERR_NETWORK') {
        setError(t('editor.saveNetworkError'));
      } else {
        setError(err?.message || t('editor.saveFailed'));
      }
    },
  });

  const handleSave = () => {
    setError('');
    if (!title.trim()) { setError(t('editor.titleRequired')); return; }
    if (categoryId === '') { setError(t('editor.categoryRequired')); return; }
    const content = vditorRef.current?.getValue() || '';
    saveMutation.mutate({ title, slug, content, summary, categoryId: Number(categoryId), tagIds, status, isTop });
  };

  const generateSlug = () => {
    setSlug(title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '') || `article-${Date.now()}`);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-2xl font-bold italic text-ink-900 dark:text-ink-100">
          {isEdit ? t('editor.editTitle') : t('editor.newTitle')}
        </h1>
        <div className="flex gap-3 text-sm">
          <button onClick={() => navigate('/admin/articles')} className="text-ink-500 hover:text-ink-900 dark:hover:text-ink-100 transition-colors">
            {t('editor.cancel')}
          </button>
          <span className="text-ink-200 dark:text-ink-700">|</span>
          <button onClick={handleSave} disabled={saveMutation.isPending} className="text-accent hover:text-accent/80 font-medium transition-colors disabled:opacity-40">
            {saveMutation.isPending ? t('editor.saving') : t('editor.save')}
          </button>
        </div>
      </div>

      {error && <p className="mb-6 text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main editor column */}
        <div className="lg:col-span-2 space-y-4">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={t('editor.titlePlaceholder')}
            className="w-full px-3 py-2.5 text-lg font-semibold bg-transparent border border-ink-200 dark:border-ink-700 rounded-md outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={slug}
              onChange={e => setSlug(e.target.value)}
              placeholder={t('editor.slugPlaceholder')}
              className="flex-1 px-3 py-2 text-sm bg-transparent border border-ink-200 dark:border-ink-700 rounded-md outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
            />
            <button onClick={generateSlug} className="px-3 py-2 text-sm text-ink-500 hover:text-accent border border-ink-200 dark:border-ink-700 rounded-md transition-colors">
              {t('editor.auto')}
            </button>
          </div>
          <div ref={editorDomRef} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <section>
            <label className="block text-xs font-medium uppercase tracking-wider text-ink-400 mb-2">
              {t('manage.thCategory')}
            </label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm bg-transparent border border-ink-200 dark:border-ink-700 rounded-md outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
            >
              <option value="">{t('editor.selectCategory')}</option>
              {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </section>

          <section>
            <label className="block text-xs font-medium uppercase tracking-wider text-ink-400 mb-2">
              {t('common.tags')}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {tags?.map((tg: any) => {
                const selected = tagIds.includes(tg.id);
                return (
                  <button
                    key={tg.id}
                    type="button"
                    onClick={() => setTagIds(prev => selected ? prev.filter(x => x !== tg.id) : [...prev, tg.id])}
                    className={`text-xs px-2 py-1 rounded-full transition-colors ${
                      selected
                        ? 'text-accent border border-accent/40'
                        : 'text-ink-400 border border-ink-200 dark:border-ink-700 hover:text-ink-700 dark:hover:text-ink-200'
                    }`}
                  >
                    {tg.name}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <label className="block text-xs font-medium uppercase tracking-wider text-ink-400 mb-2">
              {t('editor.summary')}
            </label>
            <textarea
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder={t('editor.summaryPlaceholder')}
              rows={3}
              className="w-full px-3 py-2 text-sm bg-transparent border border-ink-200 dark:border-ink-700 rounded-md outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors resize-none"
            />
          </section>

          <section className="flex gap-5 pt-2">
            <label className="flex items-center gap-2 text-sm text-ink-600 dark:text-ink-300 cursor-pointer">
              <input type="checkbox" checked={status === 1} onChange={e => setStatus(e.target.checked ? 1 : 0)} className="accent-accent" />
              {t('editor.published')}
            </label>
            <label className="flex items-center gap-2 text-sm text-ink-600 dark:text-ink-300 cursor-pointer">
              <input type="checkbox" checked={isTop === 1} onChange={e => setIsTop(e.target.checked ? 1 : 0)} className="accent-accent" />
              {t('editor.pinned')}
            </label>
          </section>
        </div>
      </div>
    </div>
  );
}
