import { useState } from 'react';
import { useStore } from '../store.jsx';
import { CITIES, STATUS } from '../data.js';
import { formatDateTime, formatToman, toFa } from '../utils.js';

export default function Admin() {
  const { state, dispatch } = useStore();
  const [filter, setFilter] = useState('همه');

  const { requests, translators } = state;
  const revenue = requests.filter((r) => r.status === STATUS.DONE).reduce((s, r) => s + r.price, 0);
  const open = requests.filter((r) => [STATUS.PENDING, STATUS.ACCEPTED, STATUS.ON_WAY, STATUS.ARRIVED, STATUS.IN_PROGRESS].includes(r.status)).length;

  const statuses = ['همه', ...Object.values(STATUS)];
  const shown = filter === 'همه' ? requests : requests.filter((r) => r.status === filter);

  const translatorName = (id) => translators.find((t) => t.id === id)?.name ?? '—';

  function setTranslator(id, patch) {
    dispatch({ type: 'setTranslator', id, patch });
  }

  return (
    <div className="stack">
      <div className="stats">
        <div className="stat"><span className="muted">کل نوبت‌ها</span><strong>{toFa(requests.length)}</strong></div>
        <div className="stat"><span className="muted">نوبت‌های باز</span><strong>{toFa(open)}</strong></div>
        <div className="stat"><span className="muted">مترجمان آنلاین</span><strong>{toFa(translators.filter((t) => t.online).length)}</strong></div>
        <div className="stat"><span className="muted">گردش مالی تکمیل‌شده</span><strong>{formatToman(revenue)}</strong></div>
      </div>

      <section className="card">
        <div className="card-head">
          <h2 className="card-title">مترجمان</h2>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>نام</th><th>شهر</th><th>زبان‌ها</th><th>امتیاز</th><th>وضعیت حساب</th><th>آنلاین</th><th>اقدام</th>
              </tr>
            </thead>
            <tbody>
              {translators.map((t) => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td>{CITIES.find((c) => c.id === t.city)?.name}</td>
                  <td>{t.languages.join('، ')}</td>
                  <td>{toFa(t.rating.toFixed(1))}</td>
                  <td><span className={`badge ${t.status === 'تأییدشده' ? 'ok' : ''}`}>{t.status}</span></td>
                  <td>{t.online ? 'بله' : 'خیر'}</td>
                  <td className="actions">
                    {t.status !== 'تأییدشده' && (
                      <button className="btn-primary small" onClick={() => setTranslator(t.id, { status: 'تأییدشده' })}>تأیید</button>
                    )}
                    {t.status === 'تأییدشده' && (
                      <button className="btn-ghost small" onClick={() => setTranslator(t.id, { status: 'تعلیق‌شده', online: false })}>تعلیق</button>
                    )}
                    {t.status === 'تعلیق‌شده' && (
                      <button className="btn-ghost small" onClick={() => setTranslator(t.id, { status: 'تأییدشده' })}>فعال‌سازی</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

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
              <tr>
                <th>زمان</th><th>شهر</th><th>مترجم</th><th>محل</th><th>مبلغ</th><th>وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id}>
                  <td>{formatDateTime(r.startAt)}</td>
                  <td>{CITIES.find((c) => c.id === r.city)?.name}</td>
                  <td>{translatorName(r.translatorId)}</td>
                  <td>{r.meetingLabel}</td>
                  <td>{formatToman(r.price)}</td>
                  <td>{r.status}</td>
                </tr>
              ))}
              {shown.length === 0 && (
                <tr><td colSpan={6} className="muted">نوبتی با این فیلتر پیدا نشد.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
