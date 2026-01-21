export interface Word {
  text: string;
  votes: number;
}

export interface WebSocketMessage {
  type: 'words-update';
  words: Word[];
}
