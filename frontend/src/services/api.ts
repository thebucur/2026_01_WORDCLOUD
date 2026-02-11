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

// Word lists
export interface WordListMeta {
  id: string;
  name: string;
}

export interface WordListsResponse {
  lists: WordListMeta[];
  activeListId: string;
}

export const getWordLists = async (): Promise<WordListsResponse> => {
  const response = await api.get<WordListsResponse>('/words/lists');
  return response.data;
};

export const createWordList = async (
  password: string,
  name: string,
  copyFromActive: boolean = false
): Promise<WordListMeta> => {
  const adminApi = createAdminApi(password);
  const response = await adminApi.post<WordListMeta>('/words/lists', {
    name,
    copyFromActive,
  });
  return response.data;
};

export const setActiveWordList = async (
  password: string,
  listId: string
): Promise<{ words: Word[]; activeListId: string }> => {
  const adminApi = createAdminApi(password);
  const response = await adminApi.put<{
    success: boolean;
    words: Word[];
    activeListId: string;
  }>('/words/lists/active', { listId });
  return { words: response.data.words, activeListId: response.data.activeListId };
};

export const deleteWordList = async (
  password: string,
  listId: string
): Promise<WordListsResponse> => {
  const adminApi = createAdminApi(password);
  const response = await adminApi.delete<{ success: boolean; lists: WordListsResponse }>(
    `/words/lists/${listId}`
  );
  return response.data.lists;
};
