import client from './client';
import type { Result, LoginVO, AdminVO } from '../types';

export const authApi = {
  login: (data: { username: string; password: string }) =>
    client.post<any, Result<LoginVO>>('/api/auth/login', data),
  me: () => client.get<any, Result<AdminVO>>('/api/auth/me'),
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    client.put<any, Result<void>>('/api/auth/password', data),
};
