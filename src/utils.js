import { COMMISSION, INSTANT_SURCHARGE, PRICE_PER_DAY, PRICE_PER_HOUR } from './data.js';

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

// تبدیل ارقام لاتین به فارسی
export function toFa(value) {
  return String(value).replace(/[0-9]/g, (d) => FA_DIGITS[d]);
}

export function formatToman(amount) {
  return `${toFa(Number(amount).toLocaleString('en-US'))} تومان`;
}

export function formatDateTime(iso) {
  const d = new Date(iso);
  const date = d.toLocaleDateString('fa-IR', { month: 'long', day: 'numeric' });
  const time = d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
  return `${date}، ${time}`;
}

export function uid(prefix = 'r') {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function randomCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

// محاسبه‌ی قیمت یک نوبت
export function calcPrice({ service, hours, days, persons = 1 }) {
  let base = service === 'daily' ? days * PRICE_PER_DAY : hours * PRICE_PER_HOUR;
  if (service === 'instant') base *= 1 + INSTANT_SURCHARGE;
  if (persons > 1) base *= 1 + (persons - 1) * 0.1;
  return Math.round(base / 1000) * 1000;
}

// سهم مترجم بعد از کارمزد پلتفرم
export function translatorShare(price) {
  return Math.round(price * (1 - COMMISSION));
}

// اعتبارسنجی فرم رزرو؛ پیام خطا یا null
export function validateBooking({ service, langA, langB, startAt, hours, days, point, label, persons }) {
  if (langA === langB) return 'زبان‌های گفتگو باید متفاوت باشند.';
  if (!point) return 'محل ملاقات را روی نقشه مشخص کنید.';
  if (!label.trim()) return 'نام محل ملاقات را وارد کنید.';
  if (persons < 1 || persons > 3) return 'تعداد افراد باید بین ۱ تا ۳ نفر باشد.';
  if (service === 'daily') {
    if (days < 2 || days > 7) return 'تعداد روزها باید بین ۲ و ۷ باشد.';
  } else if (service === 'hourly') {
    if (hours < 2) return 'حداقل مدت رزرو ساعتی ۲ ساعت است.';
  }
  if (service !== 'instant') {
    const ms = startAt.getTime() - Date.now();
    if (Number.isNaN(ms)) return 'زمان محلی انتخاب‌شده معتبر نیست.';
    if (ms < 2 * 3600e3) return 'رزرو باید حداقل دو ساعت بعد آغاز شود.';
    if (startAt.getMinutes() % 30 !== 0) return 'زمان شروع باید در گام ۳۰ دقیقه باشد.';
  }
  return null;
}
