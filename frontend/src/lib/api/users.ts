import { apiClient } from './client';
import type { User, UserRole } from '@/types';

export const usersApi = {
  getEngineers: () =>
    apiClient.get<
      Array<Pick<User, 'id' | 'firstName' | 'lastName' | 'middleName' | 'email'>>
    >('/users/engineers'),

  getManagers: () =>
    apiClient.get<
      Array<Pick<User, 'id' | 'firstName' | 'lastName' | 'middleName' | 'email'>>
    >('/users/managers'),

  getObservers: () =>
    apiClient.get<
      Array<Pick<User, 'id' | 'firstName' | 'lastName' | 'middleName' | 'email'>>
    >('/users/observers'),

  findByEmail: (email: string, role?: UserRole) =>
    apiClient.get<
      Pick<User, 'id' | 'firstName' | 'lastName' | 'middleName' | 'email' | 'role'>
    >('/users/search', { email, role }),
};
