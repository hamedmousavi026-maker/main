export const LANGUAGES = ['فارسی', 'انگلیسی', 'عربی', 'ترکی', 'فرانسوی', 'آلمانی', 'روسی', 'چینی'];

export const CITIES = [
  {
    id: 'tehran',
    name: 'تهران',
    center: [35.7219, 51.3347],
    places: [
      { label: 'میدان تجریش', pos: [35.7004, 51.4308] },
      { label: 'پارک ملت', pos: [35.7456, 51.3754] },
      { label: 'هتل اسپیناس پالاس', pos: [35.7541, 51.3766] },
      { label: 'مرکز خرید پالادیوم', pos: [35.7585, 51.4133] },
    ],
  },
  {
    id: 'isfahan',
    name: 'اصفهان',
    center: [32.6546, 51.668],
    places: [
      { label: 'میدان نقش جهان', pos: [32.6572, 51.6776] },
      { label: 'هتل عباسی', pos: [32.6601, 51.6755] },
      { label: 'سی‌وسه‌پل', pos: [32.6513, 51.6802] },
    ],
  },
  {
    id: 'shiraz',
    name: 'شیراز',
    center: [29.5918, 52.5836],
    places: [
      { label: 'حافظیه', pos: [29.6297, 52.5353] },
      { label: 'ارگ کریم‌خان', pos: [29.6145, 52.5358] },
      { label: 'هتل زندیه', pos: [29.6119, 52.5387] },
    ],
  },
];

export const PURPOSES = ['گردشگری', 'خرید و امور روزمره', 'درمانی و پزشکی', 'جلسه کاری', 'حقوقی و اداری', 'سفر خارج از شهر'];

// نوع خدمت و قواعد آن
export const SERVICES = {
  hourly: { id: 'hourly', label: 'ساعتی', hint: 'رزرو زمان‌دار، حداقل ۲ ساعت' },
  daily: { id: 'daily', label: 'چندروزه', hint: 'بسته‌ی روزانه، ۲ تا ۷ روز' },
  instant: { id: 'instant', label: 'درخواست فوری', hint: 'تطبیق خودکار با نزدیک‌ترین مترجم' },
};

export const HOUR_OPTIONS = [2, 3, 4, 6, 8];
export const DAY_OPTIONS = [2, 3, 4, 5, 6, 7];
export const PRICE_PER_HOUR = 350000;
export const PRICE_PER_DAY = 2400000;
export const INSTANT_SURCHARGE = 0.15;
export const COMMISSION = 0.2;

export const TRANSLATORS = [
  { id: 't1', name: 'سارا احمدی', city: 'tehran', languages: ['انگلیسی', 'فرانسوی'], rating: 4.9, online: true, status: 'تأییدشده', fields: ['گردشگری', 'جلسه کاری'], car: 'تویوتا کرولا · سفید' },
  { id: 't2', name: 'علی رضایی', city: 'tehran', languages: ['عربی', 'انگلیسی'], rating: 4.7, online: true, status: 'تأییدشده', fields: ['خرید و امور روزمره', 'سفر خارج از شهر'], car: 'پژو ۲۰۷ · نقره‌ای' },
  { id: 't3', name: 'مینا نوری', city: 'isfahan', languages: ['آلمانی', 'انگلیسی'], rating: 4.8, online: false, status: 'تأییدشده', fields: ['گردشگری'], car: '—' },
  { id: 't4', name: 'امیر شریفی', city: 'shiraz', languages: ['ترکی', 'روسی'], rating: 4.6, online: true, status: 'در انتظار بررسی', fields: ['گردشگری'], car: '—' },
  { id: 't5', name: 'یاسمین کاظمی', city: 'tehran', languages: ['چینی', 'انگلیسی'], rating: 4.5, online: false, status: 'تعلیق‌شده', fields: ['حقوقی و اداری'], car: '—' },
];

export const STATUS = {
  PENDING: 'در انتظار پاسخ مترجم',
  ACCEPTED: 'پذیرفته‌شده',
  ON_WAY: 'مترجم در مسیر',
  ARRIVED: 'مترجم رسیده',
  IN_PROGRESS: 'در حال همراهی',
  DONE: 'تکمیل‌شده',
  REJECTED: 'ردشده توسط مترجم',
  CANCELLED: 'لغوشده',
  NO_SHOW: 'عدم حضور',
};

export const OPEN_STATUSES = [STATUS.PENDING, STATUS.ACCEPTED, STATUS.ON_WAY, STATUS.ARRIVED, STATUS.IN_PROGRESS];
export const ACTIVE_STATUSES = [STATUS.ACCEPTED, STATUS.ON_WAY, STATUS.ARRIVED, STATUS.IN_PROGRESS];
export const CANCELLABLE = [STATUS.PENDING, STATUS.ACCEPTED];

export const NEXT_STATUS = {
  [STATUS.ACCEPTED]: STATUS.ON_WAY,
  [STATUS.ON_WAY]: STATUS.ARRIVED,
  [STATUS.ARRIVED]: STATUS.IN_PROGRESS,
  [STATUS.IN_PROGRESS]: STATUS.DONE,
};

export const NEXT_LABEL = {
  [STATUS.ACCEPTED]: 'شروع حرکت به سمت مسافر',
  [STATUS.ON_WAY]: 'رسیدم',
  [STATUS.ARRIVED]: 'شروع همراهی با کد',
  [STATUS.IN_PROGRESS]: 'پایان همراهی',
};

export const PAYMENT = {
  ONLINE: 'پرداخت آنلاین',
  ONSITE: 'پرداخت پس از پایان خدمت',
};

export const PAYMENT_STATUS = {
  WAITING: 'منتظر پرداخت',
  PAID: 'پرداخت آنلاین تأیید شد',
  ONSITE: 'منتظر پرداخت پایان کار',
  SETTLED: 'تسویه‌شده',
  REFUNDED: 'بازپرداخت شده',
};

export const TICKET_QUEUES = ['ایمنی', 'پشتیبانی'];

export const SEED_REQUESTS = [
  {
    id: 'r-seed-1',
    passenger: 'مسافر نمونه',
    city: 'tehran',
    purpose: 'گردشگری',
    service: 'hourly',
    languages: ['انگلیسی', 'فارسی'],
    hours: 3,
    days: 0,
    persons: 1,
    startAt: new Date(Date.now() + 3 * 3600e3).toISOString(),
    meetingPoint: [35.7004, 51.4308],
    meetingLabel: 'میدان تجریش',
    translatorId: 't1',
    status: STATUS.PENDING,
    payment: PAYMENT.ONLINE,
    paymentStatus: PAYMENT_STATUS.WAITING,
    price: 3 * PRICE_PER_HOUR,
    startCode: '4821',
    extension: null,
    rating: null,
    tickets: [],
    createdAt: new Date(Date.now() - 20 * 60e3).toISOString(),
  },
  {
    id: 'r-seed-2',
    passenger: 'مسافر نمونه',
    city: 'isfahan',
    purpose: 'خرید و امور روزمره',
    service: 'hourly',
    languages: ['انگلیسی', 'آلمانی'],
    hours: 2,
    days: 0,
    persons: 1,
    startAt: new Date(Date.now() - 1 * 3600e3).toISOString(),
    meetingPoint: [32.6572, 51.6776],
    meetingLabel: 'میدان نقش جهان',
    translatorId: 't3',
    status: STATUS.IN_PROGRESS,
    payment: PAYMENT.ONSITE,
    paymentStatus: PAYMENT_STATUS.ONSITE,
    price: 2 * PRICE_PER_HOUR,
    startCode: '1174',
    extension: null,
    rating: null,
    tickets: [],
    createdAt: new Date(Date.now() - 5 * 3600e3).toISOString(),
  },
];
