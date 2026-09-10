import client from './client';
import type { Result, Category } from '../types';

export const categoryApi = {
  getAll: () => client.get<any, Result<Category[]>>('/api/categories'),
  getBySlug: (slug: string) => client.get<any, Result<Category>>(`/api/categories/${slug}`),
  create: (data: any) => client.post<any, Result<Category>>('/api/categories', data),
  update: (id: number, data: any) => client.put<any, Result<Category>>(`/api/categories/${id}`, data),
  delete: (id: number) => client.delete<any, Result<void>>(`/api/categories/${id}`),
};
