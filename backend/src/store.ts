import { WebSocket } from 'ws';
import { Word } from './models/Word';
import { randomUUID } from 'crypto';

const DEFAULT_WORDS: [string, number][] = [
  ['talent', 1],
  ['carieră', 1],
  ['recrutare', 1],
  ['selecție', 1],
  ['competențe', 1],
  ['experiență', 1],
  ['abilități', 1],
  ['dezvoltare', 1],
  ['pregătire', 1],
  ['profesionalism', 1],
  ['motivație', 1],
  ['performanță', 1],
  ['echipă', 1],
  ['colaborare', 1],
  ['lider', 1],
  ['management', 1],
  ['salariu', 1],
  ['beneficii', 1],
  ['oportunitate', 1],
  ['succes', 1],
];

export interface WordListMeta {
  id: string;
  name: string;
}

class WordStore {
  private lists: Map<string, { name: string; words: Map<string, number> }> = new Map();
  private activeListId: string = '';
  private clients: Set<WebSocket> = new Set();
  private userProposals: Set<string> = new Set(); // Track users who have proposed words

  constructor() {
    const defaultId = randomUUID();
    const words = new Map<string, number>(DEFAULT_WORDS);
    this.lists.set(defaultId, { name: 'Lista implicită', words });
    this.activeListId = defaultId;
  }

  private getActiveList() {
    const list = this.lists.get(this.activeListId);
    if (!list) throw new Error('Active list not found');
    return list;
  }

  addClient(client: WebSocket) {
    this.clients.add(client);
    client.on('close', () => {
      this.clients.delete(client);
    });
  }

  getWords(): Word[] {
    const list = this.getActiveList();
    return Array.from(list.words.entries()).map(([text, votes]) => ({ text, votes }));
  }

  voteWord(word: string): boolean {
    const list = this.getActiveList();
    const normalizedWord = word.trim().toLowerCase();
    if (list.words.has(normalizedWord)) {
      const currentVotes = list.words.get(normalizedWord) || 0;
      list.words.set(normalizedWord, currentVotes + 1);
      this.broadcastUpdate();
      return true;
    }
    return false;
  }

  addWord(word: string): boolean {
    const list = this.getActiveList();
    const normalizedWord = word.trim().toLowerCase();
    if (normalizedWord.length === 0) return false;
    if (!list.words.has(normalizedWord)) {
      list.words.set(normalizedWord, 1);
      this.broadcastUpdate();
      return true;
    }
    return this.voteWord(normalizedWord);
  }

  hasUserProposed(userId: string): boolean {
    return this.userProposals.has(userId);
  }

  markUserProposed(userId: string): void {
    this.userProposals.add(userId);
  }

  resetAllVotes(): void {
    const list = this.getActiveList();
    list.words.forEach((_, word) => list.words.set(word, 1));
    this.broadcastUpdate();
  }

  deleteWord(word: string): boolean {
    const list = this.getActiveList();
    const normalizedWord = word.trim().toLowerCase();
    if (list.words.has(normalizedWord)) {
      list.words.delete(normalizedWord);
      this.broadcastUpdate();
      return true;
    }
    return false;
  }

  getStats(): { totalWords: number; totalVotes: number; words: Word[] } {
    const words = this.getWords();
    const totalVotes = words.reduce((sum, w) => sum + w.votes, 0);
    return {
      totalWords: words.length,
      totalVotes,
      words: words.sort((a, b) => b.votes - a.votes),
    };
  }

  // Word list management
  getLists(): { lists: WordListMeta[]; activeListId: string } {
    const lists: WordListMeta[] = Array.from(this.lists.entries()).map(([id, { name }]) => ({
      id,
      name,
    }));
    return { lists, activeListId: this.activeListId };
  }

  createList(name: string, copyFromActive: boolean = false): WordListMeta {
    const id = randomUUID();
    let words: Map<string, number>;
    if (copyFromActive) {
      const active = this.getActiveList();
      words = new Map(active.words);
    } else {
      words = new Map();
    }
    this.lists.set(id, { name: name.trim() || 'Listă nouă', words });
    return { id, name: this.lists.get(id)!.name };
  }

  setActiveList(listId: string): boolean {
    if (!this.lists.has(listId)) return false;
    this.activeListId = listId;
    this.broadcastUpdate();
    return true;
  }

  deleteList(listId: string): boolean {
    if (this.lists.size <= 1) return false;
    if (!this.lists.has(listId)) return false;
    this.lists.delete(listId);
    if (this.activeListId === listId) {
      this.activeListId = this.lists.keys().next().value!;
      this.broadcastUpdate();
    }
    return true;
  }

  private broadcastUpdate() {
    const words = this.getWords();
    const message = JSON.stringify({ type: 'words-update', words });
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}

export const wordStore = new WordStore();
