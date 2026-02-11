import { WebSocket } from 'ws';
import { Word } from './models/Word';

class WordStore {
  private words: Map<string, number> = new Map();
  private clients: Set<WebSocket> = new Set();

  // Initialize with some default words - workforce & recrutare (all start with 1 vote)
  constructor() {
    this.words.set('talent', 1);
    this.words.set('carieră', 1);
    this.words.set('recrutare', 1);
    this.words.set('selecție', 1);
    this.words.set('competențe', 1);
    this.words.set('experiență', 1);
    this.words.set('abilități', 1);
    this.words.set('dezvoltare', 1);
    this.words.set('pregătire', 1);
    this.words.set('profesionalism', 1);
    this.words.set('motivație', 1);
    this.words.set('performanță', 1);
    this.words.set('echipă', 1);
    this.words.set('colaborare', 1);
    this.words.set('lider', 1);
    this.words.set('management', 1);
    this.words.set('salariu', 1);
    this.words.set('beneficii', 1);
    this.words.set('oportunitate', 1);
    this.words.set('succes', 1);
  }

  addClient(client: WebSocket) {
    this.clients.add(client);
    client.on('close', () => {
      this.clients.delete(client);
    });
  }

  getWords(): Word[] {
    return Array.from(this.words.entries())
      .map(([text, votes]) => ({ text, votes }));
  }

  voteWord(word: string): boolean {
    const normalizedWord = word.trim().toLowerCase();
    if (this.words.has(normalizedWord)) {
      const currentVotes = this.words.get(normalizedWord) || 0;
      this.words.set(normalizedWord, currentVotes + 1);
      this.broadcastUpdate();
      return true;
    }
    return false;
  }

  addWord(word: string): boolean {
    const normalizedWord = word.trim().toLowerCase();
    if (normalizedWord.length === 0) {
      return false;
    }
    if (!this.words.has(normalizedWord)) {
      this.words.set(normalizedWord, 1);
      this.broadcastUpdate();
      return true;
    } else {
      // If word exists, just vote for it
      return this.voteWord(normalizedWord);
    }
  }

  resetAllVotes(): void {
    // Reset all vote counts to 1
    this.words.forEach((votes, word) => {
      this.words.set(word, 1);
    });
    this.broadcastUpdate();
  }

  deleteWord(word: string): boolean {
    const normalizedWord = word.trim().toLowerCase();
    if (this.words.has(normalizedWord)) {
      this.words.delete(normalizedWord);
      this.broadcastUpdate();
      return true;
    }
    return false;
  }

  getStats(): { totalWords: number; totalVotes: number; words: Word[] } {
    const words = this.getWords();
    const totalVotes = words.reduce((sum, word) => sum + word.votes, 0);
    return {
      totalWords: words.length,
      totalVotes,
      words: words.sort((a, b) => b.votes - a.votes), // Sort by votes descending
    };
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
