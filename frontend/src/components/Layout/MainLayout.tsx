import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from './Header';
import Footer from './Footer';
import { siteConfigApi } from '../../api/siteConfigApi';
import { useSiteConfigStore } from '../../stores/useSiteConfigStore';

export default function MainLayout() {
  const { data } = useQuery({ queryKey: ['siteConfig'], queryFn: () => siteConfigApi.get().then(r => r.data) });
  const { setConfigs } = useSiteConfigStore();

  useEffect(() => {
    if (data?.configs) setConfigs(data.configs);
  }, [data, setConfigs]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
