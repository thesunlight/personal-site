import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tagApi } from '../../../api/tagApi';
import type { Tag } from '../../../types';
import { useI18n } from '../../../i18n';

const inputCls = 'w-full px-3 py-2 text-sm bg-transparent border border-ink-200 dark:border-ink-700 rounded-md outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors';

export default function TagManage() {
  const { t: t2 } = useI18n();
  const queryClient = useQueryClient();
  const { data: tags } = useQuery({ queryKey: ['tags'], queryFn: () => tagApi.getAll().then(r => r.data) });
  const [editing, setEditing] = useState<Tag | null>(null);
  const [form, setForm] = useState({ name: '', slug: '' });

  const createMut = useMutation({ mutationFn: (d: any) => tagApi.create(d), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tags'] }); resetForm(); } });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: any }) => tagApi.update(id, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tags'] }); resetForm(); } });
  const deleteMut = useMutation({ mutationFn: (id: number) => tagApi.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tags'] }) });

  const resetForm = () => { setEditing(null); setForm({ name: '', slug: '' }); };
  const handleEdit = (tag: Tag) => { setEditing(tag); setForm({ name: tag.name, slug: tag.slug }); };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateMut.mutate({ id: editing.id, data: form });
    else createMut.mutate(form);
  };

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold italic text-ink-900 dark:text-ink-100 mb-8">{t2('tm.title')}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-sm font-medium text-ink-600 dark:text-ink-300 uppercase tracking-wider">
            {editing ? t2('tm.edit') : t2('tm.new')}
          </h2>
          <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={t2('cm.name')} className={inputCls} required />
          <input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder={t2('cm.slugShort')} className={inputCls} required />
          <div className="flex gap-3 pt-1">
            <button type="submit" className="text-sm font-medium text-accent hover:text-accent/80 transition-colors">
              {editing ? t2('cm.update') : t2('cm.create')}
            </button>
            {editing && (
              <>
                <span className="text-ink-200 dark:text-ink-700">|</span>
                <button type="button" onClick={resetForm} className="text-sm text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 transition-colors">
                  {t2('editor.cancel')}
                </button>
              </>
            )}
          </div>
        </form>

        {/* Table */}
        <div className="lg:col-span-2 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 dark:border-ink-800/80">
                <th className="text-left py-3 pr-4 font-medium text-ink-400 text-xs uppercase tracking-wider">{t2('cm.name')}</th>
                <th className="text-left py-3 pr-4 font-medium text-ink-400 text-xs uppercase tracking-wider">{t2('cm.slugShort')}</th>
                <th className="text-left py-3 pr-4 font-medium text-ink-400 text-xs uppercase tracking-wider">{t2('cm.thArticles')}</th>
                <th className="text-right py-3 font-medium text-ink-400 text-xs uppercase tracking-wider">{t2('manage.thActions')}</th>
              </tr>
            </thead>
            <tbody>
              {tags?.map((tag: any) => (
                <tr key={tag.id} className="border-b border-ink-100 dark:border-ink-800/80 last:border-0 hover:bg-ink-50/50 dark:hover:bg-ink-900/30 transition-colors">
                  <td className="py-3 pr-4 font-medium text-ink-800 dark:text-ink-200">{tag.name}</td>
                  <td className="py-3 pr-4 text-ink-400 dark:text-ink-500">{tag.slug}</td>
                  <td className="py-3 pr-4 text-ink-400 dark:text-ink-500 tabular-nums">{tag.articleCount}</td>
                  <td className="py-3 text-right space-x-3">
                    <button onClick={() => handleEdit(tag)} className="text-xs text-ink-500 hover:text-accent transition-colors">{t2('common.edit')}</button>
                    <button onClick={() => { if (confirm(t2('cm.deleteConfirm'))) deleteMut.mutate(tag.id); }} className="text-xs text-ink-400 hover:text-red-500 transition-colors">{t2('manage.delete')}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
