import { useMemo, useState } from 'react';
import CityMap from '../components/Map.jsx';
import { useStore } from '../store.jsx';
import {
  ACTIVE_STATUSES, CANCELLABLE, CITIES, DAY_OPTIONS, HOUR_OPTIONS, LANGUAGES, PAYMENT, PAYMENT_STATUS,
  PRICE_PER_HOUR, PURPOSES, SERVICES, STATUS,
} from '../data.js';
import { calcPrice, formatDateTime, formatToman, randomCode, toFa, uid, validateBooking } from '../utils.js';

export const PASSENGER_NAME = 'مسافر نمونه';

function nextHalfHour() {
  const d = new Date(Date.now() + 2.5 * 3600e3);
  d.setMinutes(d.getMinutes() < 30 ? 30 : 60, 0, 0);
  return d;
}

function toLocalInput(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function Passenger() {
  const { state, dispatch } = useStore();
  const [service, setService] = useState('hourly');
  const [city, setCity] = useState('tehran');
  const [purpose, setPurpose] = useState(PURPOSES[0]);
  const [langA, setLangA] = useState('فارسی');
  const [langB, setLangB] = useState('انگلیسی');
  const [hours, setHours] = useState(2);
  const [days, setDays] = useState(2);
  const [persons, setPersons] = useState(1);
  const [start, setStart] = useState(() => toLocalInput(nextHalfHour()));
  const [placeIdx, setPlaceIdx] = useState(0);
  const [point, setPoint] = useState(CITIES[0].places[0].pos);
  const [label, setLabel] = useState(CITIES[0].places[0].label);
  const [payment, setPayment] = useState(PAYMENT.ONLINE);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const cityInfo = CITIES.find((c) => c.id === city);
  const price = calcPrice({ service, hours, days, persons });

  // مترجم آنلاین و تأییدشده‌ی همان شهر که زبان مقابل را بلد است
  const candidates = useMemo(
    () =>
      state.translators.filter(
        (t) => t.city === city && t.online && t.status === 'تأییدشده' && t.languages.includes(langB),
      ),
    [state.translators, city, langB],
  );

  const myOrders = state.requests.filter((r) => r.passenger === PASSENGER_NAME);
  const translatorName = (id) => state.translators.find((t) => t.id === id)?.name ?? '—';

  function pickPlace(idx) {
    setPlaceIdx(idx);
    const p = cityInfo.places[idx];
    if (p) {
      setPoint(p.pos);
      setLabel(p.label);
    }
  }

  function changeCity(id) {
    setCity(id);
    setPlaceIdx(0);
    const first = CITIES.find((c) => c.id === id).places[0];
    setPoint(first.pos);
    setLabel(first.label);
  }

  function submit(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    const startAt = service === 'instant' ? new Date() : new Date(start);
    const msg = validateBooking({ service, langA, langB, startAt, hours, days, point, label, persons });
    if (msg) return setError(msg);
    if (candidates.length === 0) {
      return setError(
        service === 'instant'
          ? 'مترجم آنلاینی برای این زبان و شهر پیدا نشد.'
          : 'در این شهر و برای این زبان مترجم آنلاینی نیست.',
      );
    }

    const translator = candidates[0];
    const request = {
      id: uid(),
      passenger: PASSENGER_NAME,
      city,
      purpose,
      service,
      languages: [langA, langB],
      hours: service === 'hourly' ? hours : 0,
      days: service === 'daily' ? days : 0,
      persons,
      startAt: startAt.toISOString(),
      meetingPoint: point,
      meetingLabel: label.trim(),
      translatorId: translator.id,
      status: STATUS.PENDING,
      payment,
      paymentStatus: payment === PAYMENT.ONLINE ? PAYMENT_STATUS.WAITING : PAYMENT_STATUS.ONSITE,
      price,
      startCode: randomCode(),
      extension: null,
      rating: null,
      tickets: [],
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'createRequest', request });
    setNotice(`درخواست برای ${translator.name} ارسال شد. پس از پذیرش، وضعیت نوبت به‌روز می‌شود.`);
  }

  function patch(id, p) {
    dispatch({ type: 'patchRequest', id, patch: p });
  }

  function requestExtension(r) {
    const extHours = 1;
    patch(r.id, {
      extension: { hours: extHours, price: calcPrice({ service: 'hourly', hours: extHours, persons: r.persons }), status: 'pending' },
    });
  }

  function raiseSafety(r) {
    dispatch({
      type: 'addTicket',
      ticket: {
        id: uid('t'),
        queue: 'ایمنی',
        urgent: true,
        orderId: r.id,
        from: PASSENGER_NAME,
        text: 'مسافر درخواست کمک ایمنی ثبت کرده است.',
        status: 'باز',
        createdAt: new Date().toISOString(),
      },
    });
  }

  function rate(r, score) {
    patch(r.id, { rating: score });
  }

  return (
    <div className="grid-2">
      <section className="card">
        <h2 className="card-title">رزرو مترجم</h2>

        <div className="chips" role="radiogroup" aria-label="نوع خدمت">
          {Object.values(SERVICES).map((s) => (
            <button
              key={s.id}
              type="button"
              className={`chip ${service === s.id ? 'is-active' : ''}`}
              onClick={() => setService(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="muted hint">{SERVICES[service].hint}</p>

        <form className="form" onSubmit={submit}>
          <div className="row">
            <label className="field">
              <span>شهر</span>
              <select value={city} onChange={(e) => changeCity(e.target.value)}>
                {CITIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className="field">
              <span>هدف سفر</span>
              <select value={purpose} onChange={(e) => setPurpose(e.target.value)}>
                {PURPOSES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </label>
          </div>

          <div className="row">
            <label className="field">
              <span>زبان شما</span>
              <select value={langA} onChange={(e) => setLangA(e.target.value)}>
                {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
              </select>
            </label>
            <label className="field">
              <span>زبان طرف مقابل</span>
              <select value={langB} onChange={(e) => setLangB(e.target.value)}>
                {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
              </select>
            </label>
          </div>

          <div className="row">
            {service !== 'instant' && (
              <label className="field">
                <span>زمان شروع</span>
                <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
              </label>
            )}
            {service === 'hourly' && (
              <label className="field">
                <span>مدت (ساعت)</span>
                <select value={hours} onChange={(e) => setHours(Number(e.target.value))}>
                  {HOUR_OPTIONS.map((h) => <option key={h} value={h}>{toFa(h)} ساعت</option>)}
                </select>
              </label>
            )}
            {service === 'daily' && (
              <label className="field">
                <span>تعداد روز</span>
                <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
                  {DAY_OPTIONS.map((d) => <option key={d} value={d}>{toFa(d)} روز</option>)}
                </select>
              </label>
            )}
            <label className="field">
              <span>تعداد افراد</span>
              <select value={persons} onChange={(e) => setPersons(Number(e.target.value))}>
                {[1, 2, 3].map((n) => <option key={n} value={n}>{toFa(n)} نفر</option>)}
              </select>
            </label>
          </div>

          <div className="row">
            <label className="field">
              <span>محل ملاقات</span>
              <select value={placeIdx} onChange={(e) => pickPlace(Number(e.target.value))}>
                {cityInfo.places.map((p, i) => <option key={p.label} value={i}>{p.label}</option>)}
              </select>
            </label>
            <label className="field">
              <span>نام دقیق محل</span>
              <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} />
            </label>
          </div>

          <div className="field">
            <span>روی نقشه کلیک کنید تا نقطه‌ی دقیق‌تر انتخاب شود</span>
            <CityMap
              center={cityInfo.center}
              selected={point}
              onPick={(p) => { setPoint(p); setLabel('نقطه‌ی انتخاب‌شده روی نقشه'); }}
              height={240}
            />
          </div>

          <div className="field">
            <span>روش پرداخت</span>
            <div className="chips">
              {Object.values(PAYMENT).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`chip ${payment === p ? 'is-active' : ''}`}
                  onClick={() => setPayment(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="price-box">
            <span>مبلغ تقریبی</span>
            <strong>{formatToman(price)}</strong>
            <small>
              {service === 'hourly' && `${toFa(hours)} ساعت`}
              {service === 'daily' && `${toFa(days)} روز`}
              {service === 'instant' && 'درخواست فوری (با افزایش ۱۵٪)'}
              {persons > 1 && ` · ${toFa(persons)} نفر`}
              {' · تعرفه پایه '}{formatToman(PRICE_PER_HOUR)} در ساعت
            </small>
          </div>

          {error && <p className="alert">{error}</p>}
          {notice && <p className="notice">{notice}</p>}

          <button className="btn-primary" type="submit" disabled={candidates.length === 0}>
            ثبت درخواست رزرو
          </button>
          {candidates.length === 0 && (
            <p className="muted">در {cityInfo.name} برای {langB} مترجم آنلاینی نیست.</p>
          )}
        </form>
      </section>

      <section className="card">
        <h2 className="card-title">نوبت‌های من</h2>
        {myOrders.length === 0 && <p className="muted">هنوز نوبتی ثبت نشده است.</p>}
        <ul className="list">
          {myOrders.map((r) => (
            <li key={r.id} className="item">
              <div className="item-head">
                <strong>{translatorName(r.translatorId)}</strong>
                <span className={`badge ${r.status === STATUS.DONE ? 'ok' : ''}`}>{r.status}</span>
              </div>
              <p className="muted">
                {CITIES.find((c) => c.id === r.city)?.name} · {r.meetingLabel} · {formatDateTime(r.startAt)}
              </p>
              <p className="muted">
                {SERVICES[r.service]?.label} · {r.languages.join(' ↔ ')} · {formatToman(r.price)} · {r.payment}
              </p>
              <p className="muted">وضعیت پرداخت: {r.paymentStatus}</p>

              {[STATUS.ACCEPTED, STATUS.ON_WAY, STATUS.ARRIVED].includes(r.status) && (
                <p className="code-box">کد شروع همراهی: <strong>{toFa(r.startCode)}</strong> (به مترجم بدهید)</p>
              )}

              {r.status === STATUS.ACCEPTED && r.payment === PAYMENT.ONLINE && r.paymentStatus === PAYMENT_STATUS.WAITING && (
                <button className="btn-primary small" onClick={() => patch(r.id, { paymentStatus: PAYMENT_STATUS.PAID })}>
                  پرداخت آنلاین
                </button>
              )}

              {r.status === STATUS.IN_PROGRESS && !r.extension && (
                <button className="btn-ghost small" onClick={() => requestExtension(r)}>
                  درخواست تمدید ۱ ساعته ({formatToman(calcPrice({ service: 'hourly', hours: 1, persons: r.persons }))})
                </button>
              )}
              {r.extension?.status === 'pending' && <p className="muted">تمدید منتظر پاسخ مترجم است.</p>}
              {r.extension?.status === 'accepted' && <p className="muted">تمدید {toFa(r.extension.hours)} ساعته پذیرفته شد.</p>}
              {r.extension?.status === 'rejected' && <p className="muted">تمدید رد شد؛ زمان و مبلغ اصلی حفظ شدند.</p>}

              {ACTIVE_STATUSES.includes(r.status) && (
                <button className="btn-ghost small danger" onClick={() => raiseSafety(r)}>
                  کمک ایمنی
                </button>
              )}

              {r.status === STATUS.DONE && !r.rating && (
                <div className="rating">
                  <span className="muted">امتیاز به مترجم:</span>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} className="chip small" onClick={() => rate(r, n)}>{toFa(n)}</button>
                  ))}
                </div>
              )}
              {r.rating && <p className="muted">امتیاز شما: {toFa(r.rating)} از ۵</p>}

              {CANCELLABLE.includes(r.status) && (
                <button className="btn-ghost small" onClick={() => patch(r.id, { status: STATUS.CANCELLED })}>
                  لغو نوبت
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
