import { createContext, useContext, useEffect, useReducer } from 'react';
import { SEED_REQUESTS, TRANSLATORS } from './data.js';

const KEY = 'hamzaban-state-v1';

const initial = {
  requests: SEED_REQUESTS,
  translators: TRANSLATORS,
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...initial, ...JSON.parse(raw) } : initial;
  } catch {
    return initial;
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'create':
      return { ...state, requests: [action.request, ...state.requests] };
    case 'setStatus':
      return {
        ...state,
        requests: state.requests.map((r) =>
          r.id === action.id ? { ...r, status: action.status } : r,
        ),
      };
    case 'setTranslator':
      return {
        ...state,
        translators: state.translators.map((t) =>
          t.id === action.id ? { ...t, ...action.patch } : t,
        ),
      };
    case 'reset':
      return initial;
    default:
      return state;
  }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
