import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useMemo } from 'react';
import { kbApi } from '../../api/kbApi';
import { useI18n } from '../../i18n';
import MarkdownRenderer from '../../components/Article/MarkdownRenderer';
import type { KbDocument } from '../../types';

export default function KbProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const docSlug = searchParams.get('doc');
  const { t, lang } = useI18n();
  const [selectedDocSlug, setSelectedDocSlug] = useState(docSlug || '');

  const { data: project } = useQuery({
    queryKey: ['kbProject', slug],
    queryFn: () => kbApi.projects.getBySlug(slug!).then(r => r.data),
    enabled: !!slug,
  });

  const { data: tree } = useQuery({
    queryKey: ['kbDocTree', project?.id],
    queryFn: () => kbApi.documents.tree(project!.id).then(r => r.data),
    enabled: !!project?.id,
  });

  const { data: docDetail } = useQuery({
    queryKey: ['kbDoc', project?.id, selectedDocSlug],
    queryFn: () => kbApi.documents.detail(project!.id, selectedDocSlug).then(r => r.data),
    enabled: !!project?.id && !!selectedDocSlug,
  });

  useEffect(() => {
    if (docSlug) setSelectedDocSlug(docSlug);
  }, [docSlug]);

  useEffect(() => {
    if (!selectedDocSlug && tree && tree.length > 0) {
      const first = findFirstDoc(tree);
      if (first) {
        setSelectedDocSlug(first.slug);
        setSearchParams({ doc: first.slug }, { replace: true });
      }
    }
  }, [tree, selectedDocSlug, setSearchParams]);

  const handleDocClick = (docSlug: string) => {
    setSelectedDocSlug(docSlug);
    setSearchParams({ doc: docSlug });
  };

  const content = useMemo(() => {
    if (!docDetail) return '';
    return lang === 'zh' && docDetail.contentZh ? docDetail.contentZh : docDetail.content || '';
  }, [docDetail, lang]);

  const tocItems = useMemo(() => {
    if (!content) return [];
    const headings: { level: number; text: string; id: string }[] = [];
    const regex = /^(#{1,4})\s+(.+)$/gm;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const text = match[2].replace(/[*_`~\[\]]/g, '');
      headings.push({ level: match[1].length, text, id: text.toLowerCase().replace(/[^\w]+/g, '-') });
    }
    return headings;
  }, [content]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Project header */}
      <div className="mb-6">
        <Link to="/kb" className="text-sm text-ink-400 hover:text-accent transition-colors">
          &larr; {t('kb.backToProjects')}
        </Link>
        {project && (
          <div className="mt-3">
            <h1 className="font-serif text-2xl font-bold text-ink-900 dark:text-ink-100">{project.name}</h1>
            {project.description && (
              <p className="text-sm text-ink-400 mt-1">{project.description}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-8">
        {/* Left: Document tree */}
        <aside className="w-64 shrink-0 hidden lg:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <h3 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3">
              {t('kb.documents')}
            </h3>
            {tree && <DocTree nodes={tree} selectedSlug={selectedDocSlug} onSelect={handleDocClick} depth={0} />}
          </div>
        </aside>

        {/* Center: Content */}
        <div className="flex-1 min-w-0">
          {docDetail ? (
            <article>
              <div className="flex items-center justify-between mb-4">
                <h1 className="font-serif text-xl font-bold text-ink-900 dark:text-ink-100">
                  {docDetail.title}
                </h1>
                {docDetail.contentZh && (
                  <div className="flex items-center gap-1 text-xs">
                    <button
                      onClick={() => {/* lang toggle handles this */}}
                      className={`px-2 py-0.5 rounded ${lang === 'en' ? 'bg-accent/10 text-accent' : 'text-ink-400 hover:text-ink-600'}`}
                    >
                      EN
                    </button>
                    <span className="text-ink-300 dark:text-ink-600">/</span>
                    <button
                      onClick={() => {/* lang toggle handles this */}}
                      className={`px-2 py-0.5 rounded ${lang === 'zh' ? 'bg-accent/10 text-accent' : 'text-ink-400 hover:text-ink-600'}`}
                    >
                      中
                    </button>
                  </div>
                )}
              </div>
              {docDetail.sourceUrl && (
                <a href={docDetail.sourceUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-ink-400 hover:text-accent transition-colors mb-4 inline-block">
                  {t('kb.viewSource')} &rarr;
                </a>
              )}
              <div className="mt-4">
                <MarkdownRenderer content={content} />
              </div>
            </article>
          ) : (
            <div className="text-ink-400 text-sm py-12 text-center">
              {t('common.loading')}
            </div>
          )}
        </div>

        {/* Right: TOC */}
        {tocItems.length > 0 && (
          <aside className="w-48 shrink-0 hidden xl:block">
            <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
              <h3 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3">
                {t('common.toc')}
              </h3>
              <nav className="space-y-1">
                {tocItems.map((item, i) => (
                  <a key={i} href={`#${item.id}`}
                    className={`block text-xs leading-relaxed transition-colors ${
                      item.level === 1 ? 'text-ink-600 dark:text-ink-300 font-medium' :
                      item.level === 2 ? 'text-ink-500 dark:text-ink-400 pl-2' :
                      'text-ink-400 dark:text-ink-500 pl-4'
                    } hover:text-accent`}>
                    {item.text}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function DocTree({ nodes, selectedSlug, onSelect, depth }: {
  nodes: KbDocument[];
  selectedSlug: string;
  onSelect: (slug: string) => void;
  depth: number;
}) {
  return (
    <ul className={depth === 0 ? '' : 'ml-3 border-l border-ink-100 dark:border-ink-800 pl-2'}>
      {nodes.map(node => (
        <li key={node.id}>
          <button
            onClick={() => onSelect(node.slug)}
            className={`block w-full text-left py-1 text-xs transition-colors ${
              selectedSlug === node.slug
                ? 'text-accent font-medium'
                : 'text-ink-500 dark:text-ink-400 hover:text-ink-800 dark:hover:text-ink-200'
            }`}
          >
            {node.title}
          </button>
          {node.children && node.children.length > 0 && (
            <DocTree nodes={node.children} selectedSlug={selectedSlug} onSelect={onSelect} depth={depth + 1} />
          )}
        </li>
      ))}
    </ul>
  );
}

function findFirstDoc(nodes: KbDocument[]): KbDocument | null {
  for (const node of nodes) {
    return node;
  }
  return null;
}
