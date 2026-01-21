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
