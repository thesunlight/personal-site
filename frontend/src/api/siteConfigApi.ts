import client from './client';
import type { Result, SiteConfig, DashboardStats } from '../types';

export const siteConfigApi = {
  get: () => client.get<any, Result<SiteConfig>>('/api/site/config'),
  update: (configs: Record<string, string>) =>
    client.put<any, Result<void>>('/api/site/config', configs),
  getStats: () => client.get<any, Result<DashboardStats>>('/api/dashboard/stats'),
};
