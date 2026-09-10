import client from './client';
import type { Result, Tag } from '../types';

export const tagApi = {
  getAll: () => client.get<any, Result<Tag[]>>('/api/tags'),
  create: (data: any) => client.post<any, Result<Tag>>('/api/tags', data),
  update: (id: number, data: any) => client.put<any, Result<Tag>>(`/api/tags/${id}`, data),
  delete: (id: number) => client.delete<any, Result<void>>(`/api/tags/${id}`),
};
