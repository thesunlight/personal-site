import client from './client';
import type { Result, KbProject, KbDocument } from '../types';

export const kbApi = {
  projects: {
    list: () => client.get<any, Result<KbProject[]>>('/api/kb/projects'),
    getBySlug: (slug: string) => client.get<any, Result<KbProject>>(`/api/kb/projects/${slug}`),
    create: (data: { name: string; githubRepo: string; docsPath?: string; branch?: string; description?: string }) =>
      client.post<any, Result<KbProject>>('/api/kb/projects', data),
    sync: (id: number) => client.post<any, Result<{ synced: number }>>(`/api/kb/projects/${id}/sync`),
    delete: (id: number) => client.delete<any, Result<void>>(`/api/kb/projects/${id}`),
  },
  documents: {
    tree: (projectId: number) => client.get<any, Result<KbDocument[]>>(`/api/kb/projects/${projectId}/documents/tree`),
    detail: (projectId: number, slug: string) =>
      client.get<any, Result<KbDocument>>(`/api/kb/projects/${projectId}/documents/${slug}`),
    updateContent: (projectId: number, id: number, data: { content?: string; contentZh?: string }) =>
      client.put<any, Result<void>>(`/api/kb/projects/${projectId}/documents/${id}/content`, data),
    translate: (projectId: number, id: number) =>
      client.post<any, Result<void>>(`/api/kb/projects/${projectId}/documents/${id}/translate`),
    translateAll: (projectId: number) =>
      client.post<any, Result<void>>(`/api/kb/projects/${projectId}/documents/translate-all`),
  },
};
