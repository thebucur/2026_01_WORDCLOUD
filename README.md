# Word Cloud Voting App

Aplicație web interactivă cu word cloud animat unde cuvintele plutesc lent cu transparență variabilă. Utilizatorii pot vota sau propune cuvinte prin QR code, iar dimensiunea cuvintelor se actualizează în timp real bazat pe numărul de voturi.

## Caracteristici

- Word cloud animat cu cuvinte care plutesc lent și dreamy
- Transparență variabilă bazată pe numărul de voturi
- Cel mai mare cuvânt este poziționat în centru
- QR code în colțul dreapta jos pentru acces rapid la votare
- Actualizări în timp real prin WebSocket
- Interfață modernă și responsive

## Tehnologii

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + WebSocket
- **Styling**: CSS cu animații keyframes

## Instalare

1. Instalează dependențele:
```bash
npm install
```

2. Pornește backend-ul:
```bash
npm run dev:backend
```

3. Pornește frontend-ul (într-un alt terminal):
```bash
npm run dev:frontend
```

Sau pornește ambele simultan:
```bash
npm run dev
```

## Utilizare

1. Deschide aplicația în browser la `http://localhost:3000`
2. Scanează QR code-ul pentru a accesa pagina de votare
3. Votează cuvinte existente sau propune cuvinte noi
4. Observă actualizările în timp real în word cloud

## Structură Proiect

```
/
├── frontend/          # Aplicația React
├── backend/           # Server Express + WebSocket
└── package.json       # Root package.json pentru monorepo
```
