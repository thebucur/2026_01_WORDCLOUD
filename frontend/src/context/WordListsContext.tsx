import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import {
  getWordLists,
  setActiveWordList,
  WordListsResponse,
} from '../services/api';

interface WordListsContextValue extends WordListsResponse {
  refreshLists: () => Promise<void>;
  setActiveList: (listId: string) => Promise<boolean>;
  isAdmin: boolean;
}

const WordListsContext = createContext<WordListsContextValue | null>(null);

export function WordListsProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<WordListsResponse>({
    lists: [],
    activeListId: '',
  });
  const [isAdmin, setIsAdmin] = useState(false);

  const refreshLists = useCallback(async () => {
    const result = await getWordLists();
    setData(result);
    setIsAdmin(!!sessionStorage.getItem('adminPassword'));
  }, []);

  const setActiveList = useCallback(async (listId: string): Promise<boolean> => {
    const password = sessionStorage.getItem('adminPassword');
    if (!password || listId === data.activeListId) return false;
    try {
      await setActiveWordList(password, listId);
      await refreshLists();
      return true;
    } catch {
      return false;
    }
  }, [data.activeListId, refreshLists]);

  useEffect(() => {
    refreshLists();
  }, [refreshLists]);

  const value: WordListsContextValue = {
    ...data,
    refreshLists,
    setActiveList,
    isAdmin,
  };

  return (
    <WordListsContext.Provider value={value}>{children}</WordListsContext.Provider>
  );
}

export function useWordLists(): WordListsContextValue {
  const ctx = useContext(WordListsContext);
  if (!ctx) throw new Error('useWordLists must be used within WordListsProvider');
  return ctx;
}
