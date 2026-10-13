import { useState } from 'react';
import CityMap from '../components/Map.jsx';
import { useStore } from '../store.jsx';
import {
  ACTIVE_STATUSES, CITIES, NEXT_LABEL, NEXT_STATUS, PAYMENT, PAYMENT_STATUS, SERVICES, STATUS,
} from '../data.js';
import { formatDateTime, formatToman, toFa, translatorShare } from '../utils.js';

export default function Translator() {
  const { state, dispatch } = useStore();
  const [translatorId, setTranslatorId] = useState('t1');
  const [codes, setCodes] = useState({});
  const [errors, setErrors] = useState({});
  const me = state.translators.find((t) => t.id === translatorId);

  if (!me) return null;

  const mine = state.requests.filter((r) => r.translatorId === translatorId);
  const incoming = mine.filter((r) => r.status === STATUS.PENDING);
  const active = mine.filter((r) => ACTIVE_STATUSES.includes(r.status));
  const done = mine.filter((r) => r.status === STATUS.DONE);
  const extensions = mine.filter((r) => r.extension?.status === 'pending');
  const earnings = done.reduce((sum, r) => sum + translatorShare(r.price), 0);
  const approved = me.status === 'تأییدشده';

  function patch(id, p) {
    dispatch({ type: 'patchRequest', id, patch: p });
  }

  function setError(id, msg) {
    setErrors((e) => ({ ...e, [id]: msg }));
  }

  function accept(r) {
    patch(r.id, { status: STATUS.ACCEPTED });
  }

  function reject(r) {
    patch(r.id, { status: STATUS.REJECTED });
  }

  function advance(r) {
    const next = NEXT_STATUS[r.status];
    if (r.status === STATUS.ARRIVED) {
      if ((codes[r.id] || '').trim() !== r.startCode) return setError(r.id, 'کد شروع نادرست است.');
    }
    if (r.status === STATUS.IN_PROGRESS) {
      const p = { status: next };
      if (r.payment === PAYMENT.ONSITE) p.paymentStatus = PAYMENT_STATUS.ONSITE;
      return patch(r.id, p);
    }
    setError(r.id, '');
    patch(r.id, { status: next });
  }

  function decideExtension(r, accepted) {
    if (accepted) {
      patch(r.id, {
        hours: r.hours + r.extension.hours,
        price: r.price + r.extension.price,
        extension: { ...r.extension, status: 'accepted' },
      });
    } else {
      patch(r.id, { extension: { ...r.extension, status: 'rejected' } });
    }
  }

  function toggleOnline() {
    dispatch({ type: 'patchTranslator', id: translatorId, patch: { online: !me.online } });
  }

  return (
    <div className="stack">
      <section className="card toolbar">
        <label className="field inline">
          <span>ورود به عنوان</span>
          <select value={translatorId} onChange={(e) => setTranslatorId(e.target.value)}>
            {state.translators.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
        <div className="status-line">
          <span className={`dot ${me.online ? 'on' : ''}`} />
          <span>{me.online ? 'آنلاین و آماده دریافت درخواست' : 'آفلاین'}</span>
        </div>
        <button className={me.online ? 'btn-ghost' : 'btn-primary'} onClick={toggleOnline} disabled={!approved}>
          {me.online ? 'رفتن به حالت آفلاین' : 'آنلاین شدن'}
        </button>
        {!approved && <p className="alert">حساب شما هنوز تأیید نشده است ({me.status}).</p>}
      </section>

      <div className="stats">
        <Stat label="درخواست‌های جدید" value={incoming.length} />
        <Stat label="نوبت‌های فعال" value={active.length} />
        <Stat label="تکمیل‌شده" value={done.length} />
        <Stat label="سهم شما (پس از کارمزد)" value={formatToman(earnings)} />
        <Stat label="امتیاز" value={toFa(me.rating.toFixed(1))} />
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
                <p className="muted">
                  {SERVICES[r.service]?.label} · {r.meetingLabel} · {formatDateTime(r.startAt)}
                </p>
                <p className="muted">
                  {r.languages.join(' ↔ ')} · {toFa(r.persons)} نفر · {formatToman(r.price)} · {r.payment}
                </p>
                <div className="actions">
                  <button className="btn-primary small" onClick={() => accept(r)} disabled={!approved}>پذیرش</button>
                  <button className="btn-ghost small" onClick={() => reject(r)}>رد</button>
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
                <p className="muted">
                  {formatDateTime(r.startAt)} · {r.service === 'daily' ? `${toFa(r.days)} روز` : `${toFa(r.hours)} ساعت`}
                </p>
                <p className="muted">پرداخت: {r.paymentStatus}</p>

                {r.status === STATUS.ARRIVED && (
                  <label className="field">
                    <span>کد شروع از مسافر</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={4}
                      value={codes[r.id] || ''}
                      onChange={(e) => setCodes((c) => ({ ...c, [r.id]: e.target.value }))}
                    />
                  </label>
                )}
                {errors[r.id] && <p className="alert">{errors[r.id]}</p>}
                {NEXT_STATUS[r.status] && (
                  <button className="btn-primary small" onClick={() => advance(r)}>{NEXT_LABEL[r.status]}</button>
                )}

                {r.status === STATUS.IN_PROGRESS && r.payment === PAYMENT.ONSITE && (
                  <p className="muted">پس از پایان، پرداخت حضوری را از مسافر دریافت کنید.</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {extensions.length > 0 && (
        <section className="card">
          <h2 className="card-title">درخواست‌های تمدید</h2>
          <ul className="list">
            {extensions.map((r) => (
              <li key={r.id} className="item">
                <div className="item-head">
                  <strong>{r.meetingLabel}</strong>
                  <span className="badge">+{toFa(r.extension.hours)} ساعت · {formatToman(r.extension.price)}</span>
                </div>
                <div className="actions">
                  <button className="btn-primary small" onClick={() => decideExtension(r, true)}>پذیرش تمدید</button>
                  <button className="btn-ghost small" onClick={() => decideExtension(r, false)}>رد</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card">
        <h2 className="card-title">نقشه‌ی نوبت‌های فعال</h2>
        <CityMap
          center={CITIES.find((c) => c.id === me.city)?.center ?? [35.7219, 51.3347]}
          markers={active.map((r) => ({ id: r.id, position: r.meetingPoint, label: `${r.meetingLabel} — ${r.status}` }))}
          height={280}
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
