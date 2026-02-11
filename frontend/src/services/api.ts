import axios from 'axios';
import { Word } from '../types/word';

const api = axios.create({
  baseURL: '/api',
});

export const getWords = async (): Promise<Word[]> => {
  const response = await api.get<Word[]>('/words');
  return response.data;
};

export const voteWord = async (word: string): Promise<Word[]> => {
  const response = await api.post<{ success: boolean; words: Word[] }>('/words/vote', { word });
  return response.data.words;
};

export const proposeWord = async (word: string): Promise<Word[]> => {
  const response = await api.post<{ success: boolean; words: Word[] }>('/words/propose', { word });
  return response.data.words;
};

export const resetVotes = async (): Promise<Word[]> => {
  const response = await api.post<{ success: boolean; words: Word[] }>('/words/reset-votes');
  return response.data.words;
};

// Admin API functions
export interface AdminStats {
  totalWords: number;
  totalVotes: number;
  words: Word[];
}

const createAdminApi = (password: string) => {
  return axios.create({
    baseURL: '/api',
    headers: {
      'x-admin-password': password,
    },
  });
};

export const adminGetStats = async (password: string): Promise<AdminStats> => {
  const adminApi = createAdminApi(password);
  const response = await adminApi.get<AdminStats>('/words/admin/stats');
  return response.data;
};

export const adminResetVotes = async (password: string): Promise<Word[]> => {
  const adminApi = createAdminApi(password);
  const response = await adminApi.post<{ success: boolean; words: Word[] }>('/words/admin/reset-votes');
  return response.data.words;
};

export const adminDeleteWord = async (password: string, word: string): Promise<Word[]> => {
  const adminApi = createAdminApi(password);
  const response = await adminApi.delete<{ success: boolean; words: Word[] }>('/words/admin/word', {
    data: { word },
  });
  return response.data.words;
};

export const adminAddWord = async (password: string, word: string): Promise<Word[]> => {
  const adminApi = createAdminApi(password);
  const response = await adminApi.post<{ success: boolean; words: Word[] }>('/words/admin/word', { word });
  return response.data.words;
};
