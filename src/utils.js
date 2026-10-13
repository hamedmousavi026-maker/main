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
