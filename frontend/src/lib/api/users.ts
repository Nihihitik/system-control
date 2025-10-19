import { apiClient } from './client';
import type { User } from '@/types';

export const usersApi = {
  getEngineers: () =>
    apiClient.get<
      Array<Pick<User, 'id' | 'firstName' | 'lastName' | 'middleName' | 'email'>>
    >('/users/engineers'),
};
