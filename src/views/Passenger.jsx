import { useMemo, useState } from 'react';
import CityMap from '../components/Map.jsx';
import { useStore } from '../store.jsx';
import { CITIES, DURATIONS, LANGUAGES, PRICE_PER_HOUR, PURPOSES, STATUS } from '../data.js';
import { formatDateTime, formatToman, toFa, uid } from '../utils.js';

const CANCELLABLE = [STATUS.PENDING, STATUS.ACCEPTED];

function nextHalfHour() {
  const d = new Date(Date.now() + 2 * 3600e3);
  d.setMinutes(d.getMinutes() < 30 ? 30 : 60, 0, 0);
  return d;
}

function toLocalInput(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function Passenger() {
  const { state, dispatch } = useStore();
  const [city, setCity] = useState('tehran');
  const [purpose, setPurpose] = useState(PURPOSES[0]);
  const [langA, setLangA] = useState('فارسی');
  const [langB, setLangB] = useState('انگلیسی');
  const [hours, setHours] = useState(2);
  const [start, setStart] = useState(() => toLocalInput(nextHalfHour()));
  const [point, setPoint] = useState(null);
  const [label, setLabel] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(null);

  const cityInfo = CITIES.find((c) => c.id === city);
  const price = hours * PRICE_PER_HOUR;

  const available = useMemo(
    () => state.translators.filter((t) => t.city === city && t.online && t.status === 'تأییدشده'),
    [state.translators, city],
  );

  const myRequests = state.requests.filter((r) => r.passenger === 'مسافر نمونه');

  function submit(e) {
    e.preventDefault();
    setError('');
    if (langA === langB) return setError('زبان‌های گفتگو باید متفاوت باشند.');
    if (!point) return setError('محل ملاقات را روی نقشه مشخص کنید.');
    if (!label.trim()) return setError('نام محل ملاقات را وارد کنید.');
    const startAt = new Date(start);
    if (startAt.getTime() < Date.now() + 2 * 3600e3) {
      return setError('رزرو باید حداقل دو ساعت بعد آغاز شود.');
    }
    if (available.length === 0) return setError('در این شهر در حال حاضر مترجمی آنلاین نیست.');

    const translator = available[0];
    const request = {
      id: uid(),
      passenger: 'مسافر نمونه',
      city,
      purpose,
      languages: [langA, langB],
      hours,
      startAt: startAt.toISOString(),
      meetingPoint: point,
      meetingLabel: label.trim(),
      translatorId: translator.id,
      status: STATUS.PENDING,
      price,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'create', request });
    setSent(request);
  }

  function cancel(id) {
    dispatch({ type: 'setStatus', id, status: STATUS.CANCELLED });
  }

  const translatorName = (id) => state.translators.find((t) => t.id === id)?.name ?? '—';

  return (
    <div className="grid-2">
      <section className="card">
        <h2 className="card-title">رزرو مترجم</h2>

        <form className="form" onSubmit={submit}>
          <label className="field">
            <span>شهر</span>
            <select value={city} onChange={(e) => { setCity(e.target.value); setPoint(null); }}>
              {CITIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>

          <label className="field">
            <span>هدف سفر</span>
            <select value={purpose} onChange={(e) => setPurpose(e.target.value)}>
              {PURPOSES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </label>

          <div className="row">
            <label className="field">
              <span>زبان شما</span>
              <select value={langA} onChange={(e) => setLangA(e.target.value)}>
                {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
              </select>
            </label>
            <label className="field">
              <span>زبان مقابل</span>
              <select value={langB} onChange={(e) => setLangB(e.target.value)}>
                {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
              </select>
            </label>
          </div>

          <div className="row">
            <label className="field">
              <span>زمان شروع</span>
              <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
            </label>
            <label className="field">
              <span>مدت (ساعت)</span>
              <select value={hours} onChange={(e) => setHours(Number(e.target.value))}>
                {DURATIONS.map((h) => <option key={h} value={h}>{toFa(h)} ساعت</option>)}
              </select>
            </label>
          </div>

          <label className="field">
            <span>نام محل ملاقات</span>
            <input
              type="text"
              placeholder="مثلاً ورودی بازار تجریش"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </label>

          <div className="field">
            <span>
              محل ملاقات روی نقشه {point ? '(انتخاب شد)' : '(کلیک کنید)'}
            </span>
            <CityMap
              center={cityInfo.center}
              selected={point}
              onPick={setPoint}
              height={260}
            />
          </div>

          <div className="price-box">
            <span>مبلغ تقریبی</span>
            <strong>{formatToman(price)}</strong>
            <small>{toFa(hours)} ساعت × {formatToman(PRICE_PER_HOUR)}</small>
          </div>

          {error && <p className="alert">{error}</p>}

          <button className="btn-primary" type="submit" disabled={available.length === 0}>
            ثبت درخواست رزرو
          </button>
          {available.length === 0 && (
            <p className="muted">در {cityInfo.name} مترجم آنلاینی نیست.</p>
          )}
        </form>

        {sent && (
          <div className="notice">
            درخواست ثبت شد و برای {translatorName(sent.translatorId)} ارسال شد. وضعیت: {sent.status}
          </div>
        )}
      </section>

      <section className="card">
        <h2 className="card-title">نوبت‌های من</h2>
        {myRequests.length === 0 && <p className="muted">هنوز نوبتی ثبت نشده است.</p>}
        <ul className="list">
          {myRequests.map((r) => (
            <li key={r.id} className="item">
              <div className="item-head">
                <strong>{translatorName(r.translatorId)}</strong>
                <span className={`badge ${r.status === STATUS.DONE ? 'ok' : ''}`}>{r.status}</span>
              </div>
              <p className="muted">
                {CITIES.find((c) => c.id === r.city)?.name} · {r.meetingLabel} · {formatDateTime(r.startAt)}
              </p>
              <p className="muted">
                {r.languages.join(' ↔ ')} · {toFa(r.hours)} ساعت · {formatToman(r.price)}
              </p>
              {CANCELLABLE.includes(r.status) && (
                <button className="btn-ghost small" onClick={() => cancel(r.id)}>لغو نوبت</button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
