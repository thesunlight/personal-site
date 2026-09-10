import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../../api/authApi';
import { useAuthStore } from '../../../stores/useAuthStore';
import { useI18n } from '../../../i18n';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { lang, toggleLang, t } = useI18n();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login({ username, password });
      setAuth(res.data.token, res.data.admin);
      navigate('/admin');
    } catch (err: any) {
      const msg = err?.message || '';
      if (/timeout/i.test(msg) || err?.code === 'ECONNABORTED') {
        setError(t('login.timeout'));
      } else if (err?.code === 'ERR_NETWORK') {
        setError(t('login.networkError'));
      } else {
        setError(err?.message || t('login.failed'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative">
      <button onClick={toggleLang} className="absolute top-4 right-4 text-xs text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 hover:underline underline-offset-[3px]">
        {lang === 'zh' ? 'EN' : '中'}
      </button>
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-5">
        <h1 className="font-serif text-2xl font-bold text-center italic text-ink-900 dark:text-ink-100">
          {t('login.title')}
        </h1>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="space-y-3">
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder={t('login.username')}
            className="w-full px-3 py-2 text-sm bg-transparent border border-ink-200 dark:border-ink-700 rounded-md outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
            required
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={t('login.password')}
            className="w-full px-3 py-2 text-sm bg-transparent border border-ink-200 dark:border-ink-700 rounded-md outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 text-sm font-medium text-accent hover:text-accent/80 border border-accent/30 hover:border-accent rounded-md transition-colors disabled:opacity-40"
        >
          {loading ? t('login.loggingIn') : t('login.submit')}
        </button>
      </form>
    </div>
  );
}
