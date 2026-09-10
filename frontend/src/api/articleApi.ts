import client from './client';
import type { Result, PageResult, Article, ArticleDetail, ArchiveYear, ArticleFetchResult } from '../types';

export const articleApi = {
  getList: (params: { page?: number; size?: number; categoryId?: number; tagId?: number; keyword?: string }) =>
    client.get<any, Result<PageResult<Article>>>('/api/articles', { params }),
  getListAll: (params: { page?: number; size?: number; categoryId?: number; keyword?: string }) =>
    client.get<any, Result<PageResult<Article>>>('/api/articles/all', { params }),
  getDetail: (slug: string) =>
    client.get<any, Result<ArticleDetail>>(`/api/articles/${slug}`),
  getTop: () =>
    client.get<any, Result<Article[]>>('/api/articles/top'),
  getArchives: () =>
    client.get<any, Result<ArchiveYear[]>>('/api/articles/archives'),
  create: (data: any) =>
    client.post<any, Result<Article>>('/api/articles', data),
  update: (id: number, data: any) =>
    client.put<any, Result<Article>>(`/api/articles/${id}`, data),
  delete: (id: number) =>
    client.delete<any, Result<void>>(`/api/articles/${id}`),
  toggleTop: (id: number) =>
    client.put<any, Result<void>>(`/api/articles/${id}/top`),
  toggleStatus: (id: number) =>
    client.put<any, Result<void>>(`/api/articles/${id}/status`),
  fetch: {
    parse: (url: string) =>
      client.post<any, Result<ArticleFetchResult>>('/api/article-fetch/parse', { url }),
    save: (data: any) =>
      client.post<any, Result<Article>>('/api/article-fetch/save', data),
  },
};
