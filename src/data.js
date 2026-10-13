export const LANGUAGES = [
  'فارسی', 'انگلیسی', 'عربی', 'ترکی', 'فرانسوی', 'آلمانی', 'روسی', 'چینی',
];

export const CITIES = [
  { id: 'tehran', name: 'تهران', center: [35.6892, 51.389] },
  { id: 'isfahan', name: 'اصفهان', center: [32.6546, 51.668] },
  { id: 'shiraz', name: 'شیراز', center: [29.5918, 52.5836] },
];

export const PURPOSES = ['گردشگری', 'خرید و امور روزمره', 'درمانی و پزشکی', 'جلسه کاری', 'حقوقی و اداری', 'سفر خارج از شهر'];

export const DURATIONS = [1, 2, 3, 4, 6, 8];

export const PRICE_PER_HOUR = 350000;

export const TRANSLATORS = [
  { id: 't1', name: 'سارا احمدی', city: 'tehran', languages: ['انگلیسی', 'فرانسوی'], rating: 4.9, online: true, status: 'تأییدشده' },
  { id: 't2', name: 'علی رضایی', city: 'tehran', languages: ['عربی', 'انگلیسی'], rating: 4.7, online: true, status: 'تأییدشده' },
  { id: 't3', name: 'مینا نوری', city: 'isfahan', languages: ['آلمانی', 'انگلیسی'], rating: 4.8, online: false, status: 'تأییدشده' },
  { id: 't4', name: 'امیر شریفی', city: 'shiraz', languages: ['ترکی', 'روسی'], rating: 4.6, online: true, status: 'در انتظار بررسی' },
  { id: 't5', name: 'یاسمین کاظمی', city: 'tehran', languages: ['چینی', 'انگلیسی'], rating: 4.5, online: false, status: 'تعلیق‌شده' },
];

// وضعیت‌های یک نوبت ترجمه
export const STATUS = {
  PENDING: 'در انتظار پاسخ مترجم',
  ACCEPTED: 'پذیرفته‌شده',
  ON_WAY: 'مترجم در مسیر',
  ARRIVED: 'مترجم رسیده',
  IN_PROGRESS: 'در حال همراهی',
  DONE: 'تکمیل‌شده',
  REJECTED: 'ردشده توسط مترجم',
  CANCELLED: 'لغوشده',
};

// گام بعدی برای مترجم
export const NEXT_STATUS = {
  [STATUS.ACCEPTED]: STATUS.ON_WAY,
  [STATUS.ON_WAY]: STATUS.ARRIVED,
  [STATUS.ARRIVED]: STATUS.IN_PROGRESS,
  [STATUS.IN_PROGRESS]: STATUS.DONE,
};

export const NEXT_LABEL = {
  [STATUS.ACCEPTED]: 'شروع حرکت به سمت مسافر',
  [STATUS.ON_WAY]: 'رسیدم',
  [STATUS.ARRIVED]: 'شروع همراهی',
  [STATUS.IN_PROGRESS]: 'پایان همراهی',
};

export const SEED_REQUESTS = [
  {
    id: 'r-seed-1',
    passenger: 'مسافر نمونه',
    city: 'tehran',
    purpose: 'گردشگری',
    languages: ['انگلیسی', 'فارسی'],
    hours: 3,
    startAt: new Date(Date.now() + 3 * 3600e3).toISOString(),
    meetingPoint: [35.7004, 51.3376],
    meetingLabel: 'میدان تجریش',
    translatorId: 't1',
    status: STATUS.PENDING,
    price: 3 * 350000,
    createdAt: new Date(Date.now() - 20 * 60e3).toISOString(),
  },
  {
    id: 'r-seed-2',
    passenger: 'مسافر نمونه',
    city: 'isfahan',
    purpose: 'خرید و امور روزمره',
    languages: ['انگلیسی', 'آلمانی'],
    hours: 2,
    startAt: new Date(Date.now() - 1 * 3600e3).toISOString(),
    meetingPoint: [32.6572, 51.6776],
    meetingLabel: 'میدان نقش جهان',
    translatorId: 't3',
    status: STATUS.IN_PROGRESS,
    price: 2 * 350000,
    createdAt: new Date(Date.now() - 5 * 3600e3).toISOString(),
  },
];
