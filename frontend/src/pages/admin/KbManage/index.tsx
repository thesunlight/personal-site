import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kbApi } from '../../../api/kbApi';
import { useI18n } from '../../../i18n';
import type { KbProject } from '../../../types';

export default function KbManage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [syncingId, setSyncingId] = useState<number | null>(null);

  const { data: projects } = useQuery({
    queryKey: ['kbProjects'],
    queryFn: () => kbApi.projects.list().then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; githubRepo: string; docsPath?: string; branch?: string; description?: string }) =>
      kbApi.projects.create(data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kbProjects'] });
      setShowCreate(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => kbApi.projects.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kbProjects'] }),
  });

  const handleSync = async (project: KbProject) => {
    setSyncingId(project.id);
    try {
      await kbApi.projects.sync(project.id);
      queryClient.invalidateQueries({ queryKey: ['kbProjects'] });
    } catch (e) {
      alert(t('kb.syncFailed'));
    } finally {
      setSyncingId(null);
    }
  };

  const handleTranslateAll = async (projectId: number) => {
    try {
      await kbApi.documents.translateAll(projectId);
      alert(t('kb.translateStarted'));
    } catch (e) {
      alert(t('kb.translateFailed'));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-ink-900 dark:text-ink-100">{t('kb.manage')}</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-3 py-1.5 text-sm bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
        >
          {t('kb.importProject')}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <CreateForm
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={() => setShowCreate(false)}
          loading={createMutation.isPending}
        />
      )}

      {/* Project list */}
      <div className="space-y-4">
        {projects?.map(p => (
          <div key={p.id} className="border border-ink-100 dark:border-ink-800 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-ink-800 dark:text-ink-200">{p.name}</h3>
                {p.description && <p className="text-sm text-ink-400 mt-1">{p.description}</p>}
                <div className="flex items-center gap-3 mt-2 text-xs text-ink-400">
                  {p.githubRepo && <span>GitHub: {p.githubRepo}</span>}
                  <span>{p.docCount} {t('kb.docs')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSync(p)}
                  disabled={syncingId === p.id}
                  className="px-2.5 py-1 text-xs border border-ink-200 dark:border-ink-700 rounded hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors disabled:opacity-50"
                >
                  {syncingId === p.id ? t('kb.syncing') : t('kb.sync')}
                </button>
                <button
                  onClick={() => handleTranslateAll(p.id)}
                  className="px-2.5 py-1 text-xs border border-ink-200 dark:border-ink-700 rounded hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors"
                >
                  {t('kb.translateAll')}
                </button>
                <button
                  onClick={() => { if (confirm(t('kb.deleteConfirm'))) deleteMutation.mutate(p.id); }}
                  className="px-2.5 py-1 text-xs text-red-500 border border-red-200 dark:border-red-800 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  {t('manage.delete')}
                </button>
              </div>
            </div>
          </div>
        ))}
        {projects?.length === 0 && (
          <p className="text-ink-400 text-sm text-center py-8">{t('kb.noProjects')}</p>
        )}
      </div>
    </div>
  );
}

function CreateForm({ onSubmit, onCancel, loading }: {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [docsPath, setDocsPath] = useState('docs/');
  const [branch, setBranch] = useState('main');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !githubRepo) return;
    onSubmit({ name, githubRepo, docsPath, branch, description });
  };

  return (
    <form onSubmit={handleSubmit} className="border border-ink-100 dark:border-ink-800 rounded-lg p-4 mb-6 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-ink-500 mb-1">{t('kb.projectName')}</label>
          <input value={name} onChange={e => setName(e.target.value)} required
            className="w-full px-3 py-1.5 text-sm border border-ink-200 dark:border-ink-700 rounded-md bg-transparent text-ink-800 dark:text-ink-200" placeholder="LangChain" />
        </div>
        <div>
          <label className="block text-xs text-ink-500 mb-1">GitHub Repo</label>
          <input value={githubRepo} onChange={e => setGithubRepo(e.target.value)} required
            className="w-full px-3 py-1.5 text-sm border border-ink-200 dark:border-ink-700 rounded-md bg-transparent text-ink-800 dark:text-ink-200" placeholder="langchain-ai/langchain" />
        </div>
        <div>
          <label className="block text-xs text-ink-500 mb-1">{t('kb.docsPath')}</label>
          <input value={docsPath} onChange={e => setDocsPath(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-ink-200 dark:border-ink-700 rounded-md bg-transparent text-ink-800 dark:text-ink-200" placeholder="docs/" />
        </div>
        <div>
          <label className="block text-xs text-ink-500 mb-1">{t('kb.branch')}</label>
          <input value={branch} onChange={e => setBranch(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-ink-200 dark:border-ink-700 rounded-md bg-transparent text-ink-800 dark:text-ink-200" placeholder="main" />
        </div>
      </div>
      <div>
        <label className="block text-xs text-ink-500 mb-1">{t('kb.description')}</label>
        <input value={description} onChange={e => setDescription(e.target.value)}
          className="w-full px-3 py-1.5 text-sm border border-ink-200 dark:border-ink-700 rounded-md bg-transparent text-ink-800 dark:text-ink-200" placeholder={t('kb.description')} />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={loading}
          className="px-3 py-1.5 text-sm bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-50">
          {loading ? t('common.loading') : t('kb.createAndSync')}
        </button>
        <button type="button" onClick={onCancel}
          className="px-3 py-1.5 text-sm text-ink-500 hover:text-ink-700 dark:hover:text-ink-300">
          {t('editor.cancel')}
        </button>
      </div>
    </form>
  );
}
