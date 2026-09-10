import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import { useState } from 'react';
import { useI18n } from '../../i18n';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const { t } = useI18n();
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={handleCopy} className="absolute top-2 right-2 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-300 dark:hover:bg-gray-600">
      {copied ? t('common.copied') : t('common.copy')}
    </button>
  );
}

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, rehypeHighlight]}
        components={{
          pre: ({ children, ...props }) => (
            <div className="group relative">
              <CopyButton text={String(children).replace(/<[^>]*>/g, '')} />
              <pre {...props}>{children}</pre>
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
