export type GroupFilter = 'all' | 'nhom5' | 'nhom6';
export type SessionType = 'SÁNG' | 'CHIỀU';
export type ColorTheme = 'blue' | 'amber' | 'purple' | 'emerald' | 'indigo' | 'rose' | 'cyan';

export interface Student {
  stt: number;
  id: string;
  lastName: string;
  firstName: string;
  group: 'nhom5' | 'nhom6';
  groupLabel: 'Nhóm 5' | 'Nhóm 6';
}

export interface DayInfo {
  dayOfWeek: number;
  label: string;
  shortLabel: string;
  offsetFromMonday: number;
}

export interface WeekData {
  id: string;
  name: string;
  shortTitle: string;
  rangeText: string;
  noteSummary: string;
  start: string;
  end: string;
}

export interface ScheduleItem {
  id: string;
  dayOfWeek: number;
  session: SessionType;
  subject: string;
  shortCode: string;
  room: string;
  groups: ('nhom5' | 'nhom6')[];
  groupBadge: string;
  rosterKey: GroupFilter | null;
  periods: string;
  startDate: string;
  endDate: string;
  totalWeeks: number | null;
  durationText: string;
  colorTheme: ColorTheme;
}

export const STUDENTS_DATA: Student[] = [
  // NHÓM 5 (14 Sinh viên)
  { stt: 1, id: '3126112818', lastName: 'Lê Phan', firstName: 'An', group: 'nhom5', groupLabel: 'Nhóm 5' },
  { stt: 2, id: '3126112829', lastName: 'Nguyễn Đức', firstName: 'Anh', group: 'nhom5', groupLabel: 'Nhóm 5' },
  { stt: 3, id: '3126137635', lastName: 'Nguyễn Huy', firstName: 'Anh', group: 'nhom5', groupLabel: 'Nhóm 5' },
  { stt: 4, id: '3126129849', lastName: 'Nguyễn Khang', firstName: 'Anh', group: 'nhom5', groupLabel: 'Nhóm 5' },
  { stt: 5, id: '3126130270', lastName: 'Trần Thị Quỳnh', firstName: 'Anh', group: 'nhom5', groupLabel: 'Nhóm 5' },
  { stt: 6, id: '3126118029', lastName: 'Vũ Gia', firstName: 'Bảo', group: 'nhom5', groupLabel: 'Nhóm 5' },
  { stt: 7, id: '3126122196', lastName: 'Hoàng Hữu', firstName: 'Bình', group: 'nhom5', groupLabel: 'Nhóm 5' },
  { stt: 8, id: '3126138637', lastName: 'Nguyễn Thái', firstName: 'Bình', group: 'nhom5', groupLabel: 'Nhóm 5' },
  { stt: 9, id: '3126124545', lastName: 'Vũ Nguyễn Nguyên', firstName: 'Bình', group: 'nhom5', groupLabel: 'Nhóm 5' },
  { stt: 10, id: '3126124300', lastName: 'Lê Quỳnh', firstName: 'Chi', group: 'nhom5', groupLabel: 'Nhóm 5' },
  { stt: 11, id: '3126137625', lastName: 'Nguyễn Duy', firstName: 'Cường', group: 'nhom5', groupLabel: 'Nhóm 5' },
  { stt: 12, id: '3126122958', lastName: 'Nguyễn Nam', firstName: 'Giang', group: 'nhom5', groupLabel: 'Nhóm 5' },
  { stt: 13, id: '3126121421', lastName: 'Trần Như', firstName: 'Hải', group: 'nhom5', groupLabel: 'Nhóm 5' },
  { stt: 14, id: '3126112564', lastName: 'Trương Hoàng', firstName: 'Hiệp', group: 'nhom5', groupLabel: 'Nhóm 5' },

  // NHÓM 6 (13 Sinh viên)
  { stt: 1, id: '3126125494', lastName: 'Lê Văn', firstName: 'Hòe', group: 'nhom6', groupLabel: 'Nhóm 6' },
  { stt: 2, id: '3126136065', lastName: 'Nguyễn Tiến', firstName: 'Huy', group: 'nhom6', groupLabel: 'Nhóm 6' },
  { stt: 3, id: '3126130050', lastName: 'Nguyễn Thị Mai', firstName: 'Hương', group: 'nhom6', groupLabel: 'Nhóm 6' },
  { stt: 4, id: '3126138652', lastName: 'Trần Anh', firstName: 'Khoa', group: 'nhom6', groupLabel: 'Nhóm 6' },
  { stt: 5, id: '3126131483', lastName: 'Hoàng Khánh', firstName: 'Ly', group: 'nhom6', groupLabel: 'Nhóm 6' },
  { stt: 6, id: '3126129867', lastName: 'Nguyễn Tuấn', firstName: 'Minh', group: 'nhom6', groupLabel: 'Nhóm 6' },
  { stt: 7, id: '3126137671', lastName: 'Lê Tuấn Anh', firstName: 'Nghĩa', group: 'nhom6', groupLabel: 'Nhóm 6' },
  { stt: 8, id: '3126132158', lastName: 'Hướng Lương', firstName: 'Nguyên', group: 'nhom6', groupLabel: 'Nhóm 6' },
  { stt: 9, id: '3126129428', lastName: 'Nguyễn Ngọc Như', firstName: 'Quỳnh', group: 'nhom6', groupLabel: 'Nhóm 6' },
  { stt: 10, id: '3126118181', lastName: 'Nguyễn Khắc', firstName: 'Sáng', group: 'nhom6', groupLabel: 'Nhóm 6' },
  { stt: 11, id: '3126115645', lastName: 'Lê Quốc', firstName: 'Toản', group: 'nhom6', groupLabel: 'Nhóm 6' },
  { stt: 12, id: '3126137658', lastName: 'Dương Gia Anh', firstName: 'Vũ', group: 'nhom6', groupLabel: 'Nhóm 6' },
  { stt: 13, id: '3126130211', lastName: 'Phạm Đường', firstName: 'Vũ', group: 'nhom6', groupLabel: 'Nhóm 6' }
];

export const DAYS_INFO: DayInfo[] = [
  { dayOfWeek: 2, label: 'Thứ Hai', shortLabel: 'T2', offsetFromMonday: 0 },
  { dayOfWeek: 3, label: 'Thứ Ba', shortLabel: 'T3', offsetFromMonday: 1 },
  { dayOfWeek: 4, label: 'Thứ Tư', shortLabel: 'T4', offsetFromMonday: 2 },
  { dayOfWeek: 5, label: 'Thứ Năm', shortLabel: 'T5', offsetFromMonday: 3 },
  { dayOfWeek: 6, label: 'Thứ Sáu', shortLabel: 'T6', offsetFromMonday: 4 },
  { dayOfWeek: 7, label: 'Thứ Bảy', shortLabel: 'T7', offsetFromMonday: 5 },
  { dayOfWeek: 8, label: 'Chủ Nhật', shortLabel: 'CN', offsetFromMonday: 6 }
];

export const WEEKS_DATA: WeekData[] = [
  {
    id: 'all',
    name: 'Lịch tổng quát toàn kỳ (12/10 – 19/12/2026)',
    shortTitle: 'Toàn học kỳ I',
    rangeText: '12/10 – 19/12/2026',
    noteSummary: 'Hiển thị tất cả các học phần trong Học kỳ I. Nhấn vào tên nhóm trên từng môn để xem danh sách sinh viên.',
    start: '2026-10-12',
    end: '2026-12-20'
  },
  {
    id: '1',
    name: 'Tuần 1 (12/10 – 18/10/2026) · Bắt đầu Lý thuyết',
    shortTitle: 'Tuần 1',
    rangeText: '12/10 – 18/10/2026',
    noteSummary: 'Tuần 1 bắt đầu các môn Lý thuyết và học phần nhà A. Chưa học Thực hành Giải phẫu (C402) và Thực hành Hóa học (C606).',
    start: '2026-10-12',
    end: '2026-10-18'
  },
  {
    id: '2',
    name: 'Tuần 2 (19/10 – 25/10/2026) · Chưa học TH GP & TH HH',
    shortTitle: 'Tuần 2',
    rangeText: '19/10 – 25/10/2026',
    noteSummary: 'Tuần 2 chưa bắt đầu học Thực hành Giải phẫu (C402) và Thực hành Hóa học (C606).',
    start: '2026-10-19',
    end: '2026-10-25'
  },
  {
    id: '3',
    name: 'Tuần 3 (26/10 – 01/11/2026) · Bắt đầu Thực hành GP & HH',
    shortTitle: 'Tuần 3',
    rangeText: '26/10 – 01/11/2026',
    noteSummary: 'Tuần 3 chính thức bắt đầu Thực hành Giải phẫu (P. C402) và Thực hành Hóa học (P. C606) cho cả Nhóm 5 và Nhóm 6.',
    start: '2026-10-26',
    end: '2026-11-01'
  },
  {
    id: '4',
    name: 'Tuần 4 (02/11 – 08/11/2026) · Học đầy đủ các môn',
    shortTitle: 'Tuần 4',
    rangeText: '02/11 – 08/11/2026',
    noteSummary: 'Tuần 4 học đầy đủ cả Lý thuyết và Thực hành theo đúng phân nhóm.',
    start: '2026-11-02',
    end: '2026-11-08'
  },
  {
    id: '5',
    name: 'Tuần 5 (09/11 – 15/11/2026) · Học đầy đủ các môn',
    shortTitle: 'Tuần 5',
    rangeText: '09/11 – 15/11/2026',
    noteSummary: 'Tuần 5 học đầy đủ cả Lý thuyết và Thực hành theo đúng phân nhóm.',
    start: '2026-11-09',
    end: '2026-11-15'
  },
  {
    id: '6',
    name: 'Tuần 6 (16/11 – 22/11/2026) · Học đầy đủ các môn',
    shortTitle: 'Tuần 6',
    rangeText: '16/11 – 22/11/2026',
    noteSummary: 'Tuần 6 học đầy đủ cả Lý thuyết và Thực hành theo đúng phân nhóm.',
    start: '2026-11-16',
    end: '2026-11-22'
  },
  {
    id: '7',
    name: 'Tuần 7 (23/11 – 29/11/2026) · Học đầy đủ các môn',
    shortTitle: 'Tuần 7',
    rangeText: '23/11 – 29/11/2026',
    noteSummary: 'Tuần 7 học đầy đủ cả Lý thuyết và Thực hành theo đúng phân nhóm.',
    start: '2026-11-23',
    end: '2026-11-29'
  },
  {
    id: '8',
    name: 'Tuần 8 (30/11 – 06/12/2026) · Tuần cuối LT & TH Giải phẫu',
    shortTitle: 'Tuần 8',
    rangeText: '30/11 – 06/12/2026',
    noteSummary: 'Tuần 8 là tuần học cuối của Lý thuyết Giải phẫu, Thực hành Giải phẫu (6 buổi) và Lý thuyết Hóa học.',
    start: '2026-11-30',
    end: '2026-12-06'
  },
  {
    id: '9',
    name: 'Tuần 9 (07/12 – 13/12/2026) · Còn TH Hóa học & môn A00',
    shortTitle: 'Tuần 9',
    rangeText: '07/12 – 13/12/2026',
    noteSummary: 'LT Giải phẫu, TH Giải phẫu & LT Hóa học đã kết thúc (05/12). Chỉ còn Thực hành Hóa học (Buổi 7/8) & các môn nhà A.',
    start: '2026-12-07',
    end: '2026-12-13'
  },
  {
    id: '10',
    name: 'Tuần 10 (14/12 – 20/12/2026) · Tuần cuối TH Hóa học',
    shortTitle: 'Tuần 10',
    rangeText: '14/12 – 20/12/2026',
    noteSummary: 'Tuần 10 hoàn thành buổi cuối Thực hành Hóa học (Buổi 8/8) và kết thúc lịch học phần HK1.',
    start: '2026-12-14',
    end: '2026-12-20'
  }
];

export const SCHEDULE_ITEMS: ScheduleItem[] = [
  // THỨ HAI - CHIỀU
  {
    id: 'mon-chieu-ltgp',
    dayOfWeek: 2,
    session: 'CHIỀU',
    subject: 'Lý thuyết Giải phẫu',
    shortCode: 'LT Giải phẫu',
    room: 'Giảng đường Khoa Y',
    groups: ['nhom5', 'nhom6'],
    groupBadge: 'Chung N5–N8',
    rosterKey: null,
    periods: '4 tiết/buổi',
    startDate: '2026-10-12',
    endDate: '2026-12-05',
    totalWeeks: 8,
    durationText: '8 tuần (12/10 – 05/12/2026)',
    colorTheme: 'blue'
  },
  // THỨ BA - CHIỀU (Chỉ Nhóm 6)
  {
    id: 'tue-chieu-thhh-n6',
    dayOfWeek: 3,
    session: 'CHIỀU',
    subject: 'Thực hành Hóa học',
    shortCode: 'TH HH',
    room: 'Phòng C606',
    groups: ['nhom6'],
    groupBadge: 'Nhóm 6 (13 SV)',
    rosterKey: 'nhom6',
    periods: '4 tiết/buổi',
    startDate: '2026-10-26',
    endDate: '2026-12-19',
    totalWeeks: 8,
    durationText: '8 tuần (26/10 – 19/12/2026)',
    colorTheme: 'purple'
  },
  // THỨ TƯ - SÁNG
  {
    id: 'wed-sang-tnrhm',
    dayOfWeek: 4,
    session: 'SÁNG',
    subject: 'TNRHM',
    shortCode: 'TNRHM',
    room: 'Phòng A00',
    groups: ['nhom5', 'nhom6'],
    groupBadge: 'Cả lớp (27 SV)',
    rosterKey: 'all',
    periods: 'Theo lịch nhà A',
    startDate: '2026-10-12',
    endDate: '2026-12-19',
    totalWeeks: null,
    durationText: 'Bắt đầu từ 12/10/2026',
    colorTheme: 'indigo'
  },
  // THỨ TƯ - CHIỀU (Nhóm 5 học TH Hóa học, Nhóm 6 học TH Giải phẫu)
  {
    id: 'wed-chieu-thhh-n5',
    dayOfWeek: 4,
    session: 'CHIỀU',
    subject: 'Thực hành Hóa học',
    shortCode: 'TH HH',
    room: 'Phòng C606',
    groups: ['nhom5'],
    groupBadge: 'Nhóm 5 (14 SV)',
    rosterKey: 'nhom5',
    periods: '4 tiết/buổi',
    startDate: '2026-10-26',
    endDate: '2026-12-19',
    totalWeeks: 8,
    durationText: '8 tuần (26/10 – 19/12/2026)',
    colorTheme: 'purple'
  },
  {
    id: 'wed-chieu-thgp-n6',
    dayOfWeek: 4,
    session: 'CHIỀU',
    subject: 'Thực hành Giải phẫu',
    shortCode: 'TH GP',
    room: 'Phòng C402',
    groups: ['nhom6'],
    groupBadge: 'Nhóm 6 (13 SV)',
    rosterKey: 'nhom6',
    periods: '5 tiết/buổi',
    startDate: '2026-10-26',
    endDate: '2026-12-05',
    totalWeeks: 6,
    durationText: '6 tuần (26/10 – 05/12/2026)',
    colorTheme: 'amber'
  },
  // THỨ NĂM - SÁNG (Chỉ Nhóm 5 học TH Giải phẫu)
  {
    id: 'thu-sang-thgp-n5',
    dayOfWeek: 5,
    session: 'SÁNG',
    subject: 'Thực hành Giải phẫu',
    shortCode: 'TH GP',
    room: 'Phòng C402',
    groups: ['nhom5'],
    groupBadge: 'Nhóm 5 (14 SV)',
    rosterKey: 'nhom5',
    periods: '5 tiết/buổi',
    startDate: '2026-10-26',
    endDate: '2026-12-05',
    totalWeeks: 6,
    durationText: '6 tuần (26/10 – 05/12/2026)',
    colorTheme: 'amber'
  },
  // THỨ NĂM - CHIỀU
  {
    id: 'thu-chieu-hat',
    dayOfWeek: 5,
    session: 'CHIỀU',
    subject: 'HAT (Ngoại ngữ)',
    shortCode: 'HAT',
    room: 'Phòng A00',
    groups: ['nhom5', 'nhom6'],
    groupBadge: 'Cả lớp (27 SV)',
    rosterKey: 'all',
    periods: 'Theo lịch nhà A',
    startDate: '2026-10-12',
    endDate: '2026-12-19',
    totalWeeks: null,
    durationText: 'Bắt đầu từ 12/10/2026',
    colorTheme: 'rose'
  },
  // THỨ SÁU - CHIỀU
  {
    id: 'fri-chieu-tnrhm',
    dayOfWeek: 6,
    session: 'CHIỀU',
    subject: 'TNRHM',
    shortCode: 'TNRHM',
    room: 'Phòng A00',
    groups: ['nhom5', 'nhom6'],
    groupBadge: 'Cả lớp (27 SV)',
    rosterKey: 'all',
    periods: 'Theo lịch nhà A',
    startDate: '2026-10-12',
    endDate: '2026-12-19',
    totalWeeks: null,
    durationText: 'Bắt đầu từ 12/10/2026',
    colorTheme: 'indigo'
  },
  // THỨ BẢY - SÁNG
  {
    id: 'sat-sang-tint',
    dayOfWeek: 7,
    session: 'SÁNG',
    subject: 'TINT (Tin học)',
    shortCode: 'TINT',
    room: 'Phòng A00',
    groups: ['nhom5', 'nhom6'],
    groupBadge: 'Cả lớp (27 SV)',
    rosterKey: 'all',
    periods: 'Theo lịch nhà A',
    startDate: '2026-10-12',
    endDate: '2026-12-19',
    totalWeeks: null,
    durationText: 'Bắt đầu từ 12/10/2026',
    colorTheme: 'cyan'
  },
  // THỨ BẢY - CHIỀU
  {
    id: 'sat-chieu-lthh',
    dayOfWeek: 7,
    session: 'CHIỀU',
    subject: 'Lý thuyết Hóa học',
    shortCode: 'LT Hóa học',
    room: 'Giảng đường Khoa Y',
    groups: ['nhom5', 'nhom6'],
    groupBadge: 'Chung N5–N8',
    rosterKey: null,
    periods: '4 tiết/buổi',
    startDate: '2026-10-12',
    endDate: '2026-12-05',
    totalWeeks: 8,
    durationText: '8 tuần (12/10 – 05/12/2026)',
    colorTheme: 'emerald'
  }
];

export const QUICK_NOTE_TEMPLATES = [
  'Nhớ mang áo Blouse trắng',
  'Mang giáo trình & tài liệu',
  'Có bài kiểm tra',
  'Điểm danh đầu giờ'
];

export function removeVietnameseTones(str: string): string {
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

export function parseDateLocal(yyyy_mm_dd: string): Date {
  const [y, m, d] = yyyy_mm_dd.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDateISO(dateObj: Date): string {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDDMM(dateObj: Date): string {
  const d = String(dateObj.getDate()).padStart(2, '0');
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}`;
}

export function formatDDMMYYYY(yyyy_mm_dd: string): string {
  const [y, m, d] = yyyy_mm_dd.split('-');
  return `${d}/${m}/${y}`;
}

export function getVietnamToday(): Date {
  const now = new Date();
  const vnString = now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
  const vnDate = new Date(vnString);
  return new Date(vnDate.getFullYear(), vnDate.getMonth(), vnDate.getDate());
}

export function getVNDayOfWeek(dateObj: Date): number {
  const jsDay = dateObj.getDay();
  return jsDay === 0 ? 8 : jsDay + 1;
}

export interface EvaluatedStatus {
  status: 'upcoming' | 'active' | 'ended';
  active: boolean;
  label: string;
  textClass: string;
}

export function evaluateItemStatusOnDate(item: ScheduleItem, targetDateStr: string): EvaluatedStatus {
  const targetDate = parseDateLocal(targetDateStr);
  const startDate = parseDateLocal(item.startDate);
  const endDate = parseDateLocal(item.endDate);

  if (targetDate < startDate) {
    return {
      status: 'upcoming',
      active: false,
      label: `Chưa bắt đầu · Học từ ${formatDDMM(startDate)}`,
      textClass: 'text-amber-700 dark:text-amber-400'
    };
  }
  if (targetDate > endDate) {
    return {
      status: 'ended',
      active: false,
      label: `Đã kết thúc (${formatDDMM(endDate)})`,
      textClass: 'text-slate-500 dark:text-slate-400'
    };
  }

  if (item.totalWeeks) {
    const diffDays = Math.floor((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const weekNum = Math.floor(diffDays / 7) + 1;
    return {
      status: 'active',
      active: true,
      label: `Đang học · Buổi ${weekNum}/${item.totalWeeks}`,
      textClass: 'text-emerald-700 dark:text-emerald-400'
    };
  }

  return {
    status: 'active',
    active: true,
    label: 'Đang học tuần này',
    textClass: 'text-emerald-700 dark:text-emerald-400'
  };
}
