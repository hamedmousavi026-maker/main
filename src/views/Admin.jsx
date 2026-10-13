import { useState } from 'react';
import { useStore } from '../store.jsx';
import { CITIES, OPEN_STATUSES, PAYMENT_STATUS, STATUS, TICKET_QUEUES } from '../data.js';
import { formatDateTime, formatToman, toFa, translatorShare, uid } from '../utils.js';

const TABS = [
  { id: 'overview', label: 'نمای کلی' },
  { id: 'translators', label: 'مترجمان' },
  { id: 'orders', label: 'نوبت‌ها' },
  { id: 'tickets', label: 'پشتیبانی و ایمنی' },
  { id: 'finance', label: 'مالی' },
];

export default function Admin() {
  const [tab, setTab] = useState('overview');

  return (
    <div className="stack">
      <nav className="tabs" aria-label="بخش‌های مدیریت">
        {TABS.map((t) => (
          <button key={t.id} className={`chip ${tab === t.id ? 'is-active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>
      {tab === 'overview' && <Overview />}
      {tab === 'translators' && <Translators />}
      {tab === 'orders' && <Orders />}
      {tab === 'tickets' && <Tickets />}
      {tab === 'finance' && <Finance />}
    </div>
  );
}

function Overview() {
  const { state } = useStore();
  const { requests, translators, tickets } = state;
  const done = requests.filter((r) => r.status === STATUS.DONE);
  const gross = done.reduce((s, r) => s + r.price, 0);
  const commission = gross - done.reduce((s, r) => s + translatorShare(r.price), 0);
  const openTickets = tickets.filter((t) => t.status === 'باز');

  return (
    <div className="stats">
      <Stat label="کل نوبت‌ها" value={requests.length} />
      <Stat label="نوبت‌های باز" value={requests.filter((r) => OPEN_STATUSES.includes(r.status)).length} />
      <Stat label="مترجمان آنلاین" value={translators.filter((t) => t.online).length} />
      <Stat label="تیکت‌های باز" value={openTickets.length} />
      <Stat label="گردش مالی تکمیل‌شده" value={formatToman(gross)} />
      <Stat label="کارمزد پلتفرم" value={formatToman(commission)} />
    </div>
  );
}

function Translators() {
  const { state, dispatch } = useStore();
  const setT = (id, patch) => dispatch({ type: 'patchTranslator', id, patch });

  return (
    <section className="card">
      <h2 className="card-title">مترجمان</h2>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>نام</th><th>شهر</th><th>زبان‌ها</th><th>حوزه‌ها</th><th>خودرو</th><th>امتیاز</th><th>حساب</th><th>آنلاین</th><th>اقدام</th></tr>
          </thead>
          <tbody>
            {state.translators.map((t) => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{CITIES.find((c) => c.id === t.city)?.name}</td>
                <td>{t.languages.join('، ')}</td>
                <td>{t.fields.join('، ')}</td>
                <td>{t.car}</td>
                <td>{toFa(t.rating.toFixed(1))}</td>
                <td><span className={`badge ${t.status === 'تأییدشده' ? 'ok' : ''}`}>{t.status}</span></td>
                <td>{t.online ? 'بله' : 'خیر'}</td>
                <td className="actions">
                  {t.status !== 'تأییدشده' && (
                    <button className="btn-primary small" onClick={() => setT(t.id, { status: 'تأییدشده' })}>تأیید</button>
                  )}
                  {t.status === 'تأییدشده' && (
                    <button className="btn-ghost small" onClick={() => setT(t.id, { status: 'تعلیق‌شده', online: false })}>تعلیق</button>
                  )}
                  {t.status === 'تعلیق‌شده' && (
                    <button className="btn-ghost small" onClick={() => setT(t.id, { status: 'تأییدشده' })}>فعال‌سازی</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Orders() {
  const { state } = useStore();
  const [filter, setFilter] = useState('همه');
  const statuses = ['همه', ...Object.values(STATUS)];
  const shown = filter === 'همه' ? state.requests : state.requests.filter((r) => r.status === filter);
  const nameOf = (id) => state.translators.find((t) => t.id === id)?.name ?? '—';

  return (
    <section className="card">
      <div className="card-head">
        <h2 className="card-title">نوبت‌ها</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="فیلتر وضعیت">
          {statuses.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>زمان</th><th>شهر</th><th>نوع</th><th>مترجم</th><th>محل</th><th>مبلغ</th><th>پرداخت</th><th>وضعیت</th></tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.id}>
                <td>{formatDateTime(r.startAt)}</td>
                <td>{CITIES.find((c) => c.id === r.city)?.name}</td>
                <td>{r.service}</td>
                <td>{nameOf(r.translatorId)}</td>
                <td>{r.meetingLabel}</td>
                <td>{formatToman(r.price)}</td>
                <td>{r.paymentStatus}</td>
                <td>{r.status}</td>
              </tr>
            ))}
            {shown.length === 0 && <tr><td colSpan={8} className="muted">نوبتی پیدا نشد.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Tickets() {
  const { state, dispatch } = useStore();
  const [queue, setQueue] = useState(TICKET_QUEUES[0]);
  const [note, setNote] = useState({});
  const list = state.tickets.filter((t) => t.queue === queue);

  function resolve(t) {
    dispatch({
      type: 'patchTicket',
      id: t.id,
      patch: { status: 'حل‌شده', resolution: note[t.id] || 'بدون یادداشت' },
    });
  }

  return (
    <section className="card">
      <div className="card-head">
        <h2 className="card-title">صف‌ها</h2>
        <div className="chips">
          {TICKET_QUEUES.map((q) => (
            <button key={q} className={`chip ${queue === q ? 'is-active' : ''}`} onClick={() => setQueue(q)}>{q}</button>
          ))}
        </div>
      </div>
      {list.length === 0 && <p className="muted">تیکتی در این صف نیست.</p>}
      <ul className="list">
        {list.map((t) => (
          <li key={t.id} className="item">
            <div className="item-head">
              <strong>{t.text}</strong>
              <span className={`badge ${t.urgent ? 'danger' : ''}`}>{t.urgent ? 'فوری' : 'عادی'} · {t.status}</span>
            </div>
            <p className="muted">سفارش: {t.orderId} · {formatDateTime(t.createdAt)}</p>
            {t.status === 'باز' ? (
              <div className="actions">
                <input
                  type="text"
                  placeholder="یادداشت پاسخ"
                  value={note[t.id] || ''}
                  onChange={(e) => setNote((n) => ({ ...n, [t.id]: e.target.value }))}
                />
                <button className="btn-primary small" onClick={() => resolve(t)}>بستن تیکت</button>
              </div>
            ) : (
              <p className="muted">نتیجه: {t.resolution}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Finance() {
  const { state, dispatch } = useStore();
  const settleable = state.requests.filter((r) => r.status === STATUS.DONE && r.paymentStatus !== PAYMENT_STATUS.SETTLED);
  const nameOf = (id) => state.translators.find((t) => t.id === id)?.name ?? '—';

  function settle(r) {
    dispatch({
      type: 'addSettlement',
      settlement: { id: uid('s'), orderId: r.id, translator: nameOf(r.translatorId), amount: translatorShare(r.price), at: new Date().toISOString() },
    });
    dispatch({ type: 'patchRequest', id: r.id, patch: { paymentStatus: PAYMENT_STATUS.SETTLED } });
  }

  return (
    <div className="grid-2">
      <section className="card">
        <h2 className="card-title">نوبت‌های آماده‌ی تسویه</h2>
        {settleable.length === 0 && <p className="muted">موردی برای تسویه نیست.</p>}
        <ul className="list">
          {settleable.map((r) => (
            <li key={r.id} className="item">
              <div className="item-head">
                <strong>{nameOf(r.translatorId)}</strong>
                <span className="badge">{r.paymentStatus}</span>
              </div>
              <p className="muted">مبلغ کل {formatToman(r.price)} · سهم مترجم {formatToman(translatorShare(r.price))}</p>
              <button className="btn-primary small" onClick={() => settle(r)}>ثبت تسویه</button>
            </li>
          ))}
        </ul>
      </section>
      <section className="card">
        <h2 className="card-title">تسویه‌های ثبت‌شده</h2>
        {state.settlements.length === 0 && <p className="muted">هنوز تسویه‌ای ثبت نشده است.</p>}
        <ul className="list">
          {state.settlements.map((s) => (
            <li key={s.id} className="item">
              <div className="item-head"><strong>{s.translator}</strong><span className="badge ok">تسویه‌شده</span></div>
              <p className="muted">{formatToman(s.amount)} · {formatDateTime(s.at)}</p>
            </li>
          ))}
        </ul>
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
