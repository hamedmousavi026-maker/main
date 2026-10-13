import { useState } from 'react';
import { useStore } from '../store.jsx';
import { CITIES, NEXT_LABEL, NEXT_STATUS, STATUS } from '../data.js';
import { formatDateTime, formatToman, toFa } from '../utils.js';
import CityMap from '../components/Map.jsx';

const ACTIVE = [STATUS.ACCEPTED, STATUS.ON_WAY, STATUS.ARRIVED, STATUS.IN_PROGRESS];

export default function Translator() {
  const { state, dispatch } = useStore();
  const [translatorId, setTranslatorId] = useState('t1');
  const me = state.translators.find((t) => t.id === translatorId);

  const mine = state.requests.filter((r) => r.translatorId === translatorId);
  const incoming = mine.filter((r) => r.status === STATUS.PENDING);
  const active = mine.filter((r) => ACTIVE.includes(r.status));
  const done = mine.filter((r) => r.status === STATUS.DONE);

  const earnings = done.reduce((sum, r) => sum + r.price * 0.8, 0);

  function setStatus(id, status) {
    dispatch({ type: 'setStatus', id, status });
  }

  function toggleOnline() {
    dispatch({ type: 'setTranslator', id: translatorId, patch: { online: !me.online } });
  }

  if (!me) return null;

  return (
    <div className="stack">
      <section className="card toolbar">
        <label className="field inline">
          <span>ورود به عنوان</span>
          <select value={translatorId} onChange={(e) => setTranslatorId(e.target.value)}>
            {state.translators.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </label>
        <div className="status-line">
          <span className={`dot ${me.online ? 'on' : ''}`} />
          <span>{me.online ? 'آنلاین و آماده دریافت درخواست' : 'آفلاین'}</span>
        </div>
        <button className={me.online ? 'btn-ghost' : 'btn-primary'} onClick={toggleOnline} disabled={me.status !== 'تأییدشده'}>
          {me.online ? 'رفتن به حالت آفلاین' : 'آنلاین شدن'}
        </button>
        {me.status !== 'تأییدشده' && <p className="alert">حساب شما هنوز تأیید نشده است ({me.status}).</p>}
      </section>

      <div className="stats">
        <Stat label="درخواست‌های جدید" value={incoming.length} />
        <Stat label="نوبت‌های فعال" value={active.length} />
        <Stat label="تکمیل‌شده" value={done.length} />
        <Stat label="درآمد تخمینی (۸۰٪)" value={formatToman(earnings)} />
      </div>

      <div className="grid-2">
        <section className="card">
          <h2 className="card-title">درخواست‌های جدید</h2>
          {incoming.length === 0 && <p className="muted">درخواستی منتظر پاسخ نیست.</p>}
          <ul className="list">
            {incoming.map((r) => (
              <li key={r.id} className="item">
                <div className="item-head">
                  <strong>{r.purpose}</strong>
                  <span className="badge">{CITIES.find((c) => c.id === r.city)?.name}</span>
                </div>
                <p className="muted">{r.meetingLabel} · {formatDateTime(r.startAt)}</p>
                <p className="muted">{r.languages.join(' ↔ ')} · {toFa(r.hours)} ساعت · {formatToman(r.price)}</p>
                <div className="actions">
                  <button className="btn-primary small" onClick={() => setStatus(r.id, STATUS.ACCEPTED)}>پذیرش</button>
                  <button className="btn-ghost small" onClick={() => setStatus(r.id, STATUS.REJECTED)}>رد</button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2 className="card-title">نوبت‌های فعال</h2>
          {active.length === 0 && <p className="muted">نوبت فعالی ندارید.</p>}
          <ul className="list">
            {active.map((r) => (
              <li key={r.id} className="item">
                <div className="item-head">
                  <strong>{r.meetingLabel}</strong>
                  <span className="badge ok">{r.status}</span>
                </div>
                <p className="muted">{formatDateTime(r.startAt)} · {toFa(r.hours)} ساعت</p>
                {NEXT_STATUS[r.status] && (
                  <button className="btn-primary small" onClick={() => setStatus(r.id, NEXT_STATUS[r.status])}>
                    {NEXT_LABEL[r.status]}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card">
        <h2 className="card-title">نقشه‌ی نوبت‌های فعال</h2>
        <CityMap
          center={CITIES.find((c) => c.id === me.city)?.center ?? [35.6892, 51.389]}
          markers={active.map((r) => ({
            id: r.id,
            position: r.meetingPoint,
            label: `${r.meetingLabel} — ${r.status}`,
          }))}
          height={300}
        />
      </section>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span className="muted">{label}</span>
      <strong>{typeof value === 'number' ? toFa(value) : value}</strong>
    </div>
  );
}
