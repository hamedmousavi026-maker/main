import { useState } from 'react';
import Passenger from './views/Passenger.jsx';
import Translator from './views/Translator.jsx';
import Admin from './views/Admin.jsx';
import { useStore } from './store.jsx';

const ROLES = [
  { id: 'passenger', label: 'مسافر' },
  { id: 'translator', label: 'مترجم' },
  { id: 'admin', label: 'مدیریت' },
];

export default function App() {
  const [role, setRole] = useState('passenger');
  const { dispatch } = useStore();

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">هم</span>
          <div>
            <h1>هم‌زبان</h1>
            <p>مترجم همراه شما</p>
          </div>
        </div>
        <nav className="role-switch" aria-label="انتخاب نقش">
          {ROLES.map((r) => (
            <button
              key={r.id}
              className={`chip ${role === r.id ? 'is-active' : ''}`}
              onClick={() => setRole(r.id)}
            >
              {r.label}
            </button>
          ))}
        </nav>
        <button className="btn-ghost" onClick={() => dispatch({ type: 'reset' })}>
          بازنشانی داده‌ها
        </button>
      </header>

      <main className="app-main">
        {role === 'passenger' && <Passenger />}
        {role === 'translator' && <Translator />}
        {role === 'admin' && <Admin />}
      </main>

      <footer className="app-footer">
        ترجمه گفت‌وگو؛ نه مشاوره حقوقی، وکالت یا ترجمه رسمی
      </footer>
    </div>
  );
}
