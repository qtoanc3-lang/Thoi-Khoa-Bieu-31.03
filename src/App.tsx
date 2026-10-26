/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Download,
  FileText,
  FlaskConical,
  Languages,
  Laptop,
  LayoutGrid,
  Moon,
  Printer,
  Search,
  Smartphone,
  Stethoscope,
  Sun,
  Sunset,
  Table as TableIcon,
  Trash2,
  UserCheck,
  Users,
  X
} from 'lucide-react';
import {
  STUDENTS_DATA,
  DAYS_INFO,
  WEEKS_DATA,
  SCHEDULE_ITEMS,
  QUICK_NOTE_TEMPLATES,
  GroupFilter,
  ScheduleItem,
  removeVietnameseTones,
  parseDateLocal,
  formatDateISO,
  formatDDMM,
  formatDDMMYYYY,
  getVietnamToday,
  getVNDayOfWeek,
  evaluateItemStatusOnDate
} from './data/scheduleData';

interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'info';
}

const THEME_ACCENTS: Record<
  ScheduleItem['colorTheme'],
  {
    surface: string;
    border: string;
    hoverBorder: string;
    title: string;
    roomChip: string;
    groupText: string;
    dotColor: string;
    label: string;
  }
> = {
  blue: {
    surface: 'bg-blue-50/95 dark:bg-blue-950/45',
    border: 'border-blue-300 dark:border-blue-800',
    hoverBorder: 'hover:border-blue-500 dark:hover:border-blue-500',
    title: 'text-blue-950 dark:text-blue-100',
    roomChip: 'bg-blue-600 text-white',
    groupText: 'text-blue-800 dark:text-blue-300',
    dotColor: 'bg-blue-600',
    label: 'LT Giải phẫu'
  },
  amber: {
    surface: 'bg-amber-50/95 dark:bg-amber-950/45',
    border: 'border-amber-300 dark:border-amber-800',
    hoverBorder: 'hover:border-amber-500 dark:hover:border-amber-500',
    title: 'text-amber-950 dark:text-amber-100',
    roomChip: 'bg-amber-600 text-white',
    groupText: 'text-amber-900 dark:text-amber-300',
    dotColor: 'bg-amber-500',
    label: 'TH Giải phẫu (C402)'
  },
  purple: {
    surface: 'bg-purple-50/95 dark:bg-purple-950/45',
    border: 'border-purple-300 dark:border-purple-800',
    hoverBorder: 'hover:border-purple-500 dark:hover:border-purple-500',
    title: 'text-purple-950 dark:text-purple-100',
    roomChip: 'bg-purple-600 text-white',
    groupText: 'text-purple-900 dark:text-purple-300',
    dotColor: 'bg-purple-600',
    label: 'TH Hóa học (C606)'
  },
  emerald: {
    surface: 'bg-emerald-50/95 dark:bg-emerald-950/45',
    border: 'border-emerald-300 dark:border-emerald-800',
    hoverBorder: 'hover:border-emerald-500 dark:hover:border-emerald-500',
    title: 'text-emerald-950 dark:text-emerald-100',
    roomChip: 'bg-emerald-600 text-white',
    groupText: 'text-emerald-900 dark:text-emerald-300',
    dotColor: 'bg-emerald-600',
    label: 'LT Hóa học'
  },
  indigo: {
    surface: 'bg-indigo-50/95 dark:bg-indigo-950/45',
    border: 'border-indigo-300 dark:border-indigo-800',
    hoverBorder: 'hover:border-indigo-500 dark:hover:border-indigo-500',
    title: 'text-indigo-950 dark:text-indigo-100',
    roomChip: 'bg-indigo-600 text-white',
    groupText: 'text-indigo-900 dark:text-indigo-300',
    dotColor: 'bg-indigo-600',
    label: 'TNRHM (A00)'
  },
  rose: {
    surface: 'bg-rose-50/95 dark:bg-rose-950/45',
    border: 'border-rose-300 dark:border-rose-800',
    hoverBorder: 'hover:border-rose-500 dark:hover:border-rose-500',
    title: 'text-rose-950 dark:text-rose-100',
    roomChip: 'bg-rose-600 text-white',
    groupText: 'text-rose-900 dark:text-rose-300',
    dotColor: 'bg-rose-600',
    label: 'HAT (A00)'
  },
  cyan: {
    surface: 'bg-cyan-50/95 dark:bg-cyan-950/45',
    border: 'border-cyan-300 dark:border-cyan-800',
    hoverBorder: 'hover:border-cyan-500 dark:hover:border-cyan-500',
    title: 'text-cyan-950 dark:text-cyan-100',
    roomChip: 'bg-cyan-600 text-white',
    groupText: 'text-cyan-900 dark:text-cyan-300',
    dotColor: 'bg-cyan-600',
    label: 'TINT (A00)'
  }
};

function renderSubjectIcon(colorTheme: ScheduleItem['colorTheme']) {
  switch (colorTheme) {
    case 'blue':
      return <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />;
    case 'amber':
      return <Stethoscope className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />;
    case 'purple':
    case 'emerald':
      return <FlaskConical className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />;
    case 'rose':
      return <Languages className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />;
    case 'cyan':
      return <Laptop className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />;
    default:
      return <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />;
  }
}

export default function App() {
  // 1. State initialization with localStorage persistence
  const [groupFilter, setGroupFilterState] = useState<GroupFilter>(() => {
    const saved = localStorage.getItem('rm3103_group');
    if (saved === 'nhom5' || saved === 'nhom6' || saved === 'all') return saved;
    return 'all';
  });

  const [myStudentId, setMyStudentIdState] = useState<string | null>(() => {
    return localStorage.getItem('rm3103_my_student') || null;
  });

  const [weekFilter, setWeekFilter] = useState<string>(() => {
    const todayISO = formatDateISO(getVietnamToday());
    const matched = WEEKS_DATA.find((w) => w.id !== 'all' && todayISO >= w.start && todayISO <= w.end);
    return matched ? matched.id : 'all';
  });

  // Default to 'card' on screens < 1024px so phones & tablets open in compact mobile format immediately
  const [viewMode, setViewMode] = useState<'table' | 'card'>(() => {
    return typeof window !== 'undefined' && window.innerWidth < 1024 ? 'card' : 'table';
  });

  // Optional day filter in Mobile Card view ('all' or dayOfWeek 2..7)
  const [mobileDayFilter, setMobileDayFilter] = useState<number | 'all'>('all');

  const [hideInactive, setHideInactive] = useState<boolean>(false);

  const [notes, setNotes] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem('rm3103_notes') || '{}');
    } catch {
      return {};
    }
  });

  const [referenceDateStr, setReferenceDateStr] = useState<string>(() => {
    return formatDateISO(getVietnamToday());
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('rm3103_theme');
    if (savedTheme === 'dark') return true;
    if (savedTheme === 'light') return false;
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Modals state
  const [studentModalOpen, setStudentModalOpen] = useState<boolean>(false);
  const [studentModalTab, setStudentModalTab] = useState<GroupFilter>('all');
  const [studentSearch, setStudentSearch] = useState<string>('');

  const [activeNoteItem, setActiveNoteItem] = useState<ScheduleItem | null>(null);
  const [noteDraft, setNoteDraft] = useState<string>('');

  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [icsGroupSelect, setIcsGroupSelect] = useState<GroupFilter>('all');

  const [phoneModalOpen, setPhoneModalOpen] = useState<boolean>(false);
  const [phoneModalGroup, setPhoneModalGroup] = useState<GroupFilter>('nhom5');

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync dark mode class on <html>
  useEffect(() => {
    const rootEl = document.documentElement;
    if (isDark) {
      rootEl.classList.add('dark');
      localStorage.setItem('rm3103_theme', 'dark');
    } else {
      rootEl.classList.remove('dark');
      localStorage.setItem('rm3103_theme', 'light');
    }
  }, [isDark]);

  // Sync personal student selection with group filter on initial load
  useEffect(() => {
    if (myStudentId) {
      const st = STUDENTS_DATA.find((s) => s.id === myStudentId);
      if (st) {
        setGroupFilterState(st.group);
        localStorage.setItem('rm3103_group', st.group);
      }
    }
  }, [myStudentId]);

  const showToast = (message: string, type: 'success' | 'info' = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2600);
  };

  const setGroupFilter = (nextGroup: GroupFilter) => {
    setGroupFilterState(nextGroup);
    localStorage.setItem('rm3103_group', nextGroup);
    setIcsGroupSelect(nextGroup);
  };

  const copyTextToClipboard = (text: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  };

  const fallbackCopy = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
    } catch {
      // ignore
    }
    document.body.removeChild(textarea);
  };

  // Current Vietnam Date Info
  const todayObj = useMemo(() => getVietnamToday(), []);
  const todayISO = useMemo(() => formatDateISO(todayObj), [todayObj]);
  const todayVNDay = useMemo(() => getVNDayOfWeek(todayObj), [todayObj]);
  const liveDateLabel = useMemo(() => {
    const dayInfo = DAYS_INFO.find((d) => d.dayOfWeek === todayVNDay);
    return `${dayInfo?.label || ''}, ${formatDDMMYYYY(todayISO)}`;
  }, [todayVNDay, todayISO]);

  // Personal Student Object
  const myStudent = useMemo(() => {
    if (!myStudentId) return null;
    return STUDENTS_DATA.find((s) => s.id === myStudentId) || null;
  }, [myStudentId]);

  // Selected Week Object
  const currentWeekObj = useMemo(() => {
    return WEEKS_DATA.find((w) => w.id === weekFilter) || WEEKS_DATA[0];
  }, [weekFilter]);

  const getDateForDayInSelectedWeek = (offsetFromMonday: number): Date | null => {
    if (weekFilter === 'all') return null;
    const weekObj = WEEKS_DATA.find((w) => w.id === weekFilter);
    if (!weekObj) return null;
    const mondayDate = parseDateLocal(weekObj.start);
    return new Date(
      mondayDate.getFullYear(),
      mondayDate.getMonth(),
      mondayDate.getDate() + offsetFromMonday
    );
  };

  const stepWeek = (direction: number) => {
    const idx = WEEKS_DATA.findIndex((w) => w.id === weekFilter);
    let nextIdx = idx + direction;
    if (nextIdx < 0) nextIdx = WEEKS_DATA.length - 1;
    if (nextIdx >= WEEKS_DATA.length) nextIdx = 0;
    setWeekFilter(WEEKS_DATA[nextIdx].id);
  };

  const jumpToCurrentWeek = () => {
    const matched = WEEKS_DATA.find((w) => w.id !== 'all' && todayISO >= w.start && todayISO <= w.end);
    if (matched) {
      setWeekFilter(matched.id);
      showToast(`Đã chuyển về ${matched.shortTitle} (${matched.rangeText})`, 'info');
    } else {
      setWeekFilter('all');
      showToast('Ngày hiện tại nằm ngoài khung 10 tuần học, hiển thị lịch tổng quát.', 'info');
    }
  };

  // Today & Tomorrow Widget Computation
  const referenceDateObj = useMemo(() => {
    return referenceDateStr ? parseDateLocal(referenceDateStr) : todayObj;
  }, [referenceDateStr, todayObj]);

  const tomorrowDateObj = useMemo(() => {
    return new Date(
      referenceDateObj.getFullYear(),
      referenceDateObj.getMonth(),
      referenceDateObj.getDate() + 1
    );
  }, [referenceDateObj]);

  const getDaySummaryData = (dateObj: Date) => {
    const vnDay = getVNDayOfWeek(dateObj);
    const dayInfo = DAYS_INFO.find((d) => d.dayOfWeek === vnDay)!;
    const dateISO = formatDateISO(dateObj);
    const items = SCHEDULE_ITEMS.filter((item) => {
      if (item.dayOfWeek !== vnDay) return false;
      return groupFilter === 'all' || item.groups.includes(groupFilter);
    });
    return { dayInfo, dateISO, items };
  };

  const todaySummary = useMemo(() => getDaySummaryData(referenceDateObj), [referenceDateObj, groupFilter]);
  const tomorrowSummary = useMemo(() => getDaySummaryData(tomorrowDateObj), [tomorrowDateObj, groupFilter]);

  const copyDaySchedule = (which: 'today' | 'tomorrow') => {
    const summary = which === 'today' ? todaySummary : tomorrowSummary;
    const groupName =
      groupFilter === 'all'
        ? 'Lớp RM31.03 (N5 & N6)'
        : groupFilter === 'nhom5'
        ? 'Nhóm 5 - RM31.03'
        : 'Nhóm 6 - RM31.03';

    let text = `LỊCH HỌC ${groupName.toUpperCase()} - ${summary.dayInfo.label.toUpperCase()} (${formatDDMMYYYY(
      summary.dateISO
    )}):\n`;

    if (summary.items.length === 0) {
      text += '• Nghỉ cả ngày.';
    } else {
      summary.items.forEach((it) => {
        const st = evaluateItemStatusOnDate(it, summary.dateISO);
        text += `• Buổi ${it.session}: ${it.subject} (${it.groupBadge}) | ${it.room} | ${it.periods} [${st.label}]\n`;
      });
    }

    copyTextToClipboard(text.trim());
    showToast('Đã sao chép lịch học!', 'success');
  };

  // Student Modal helpers
  const openStudentModal = (tab: GroupFilter = 'all') => {
    setStudentModalTab(tab);
    setStudentModalOpen(true);
  };

  const filteredStudents = useMemo(() => {
    const qNorm = removeVietnameseTones(studentSearch.trim());
    return STUDENTS_DATA.filter((st) => {
      if (studentModalTab !== 'all' && st.group !== studentModalTab) return false;
      if (!qNorm) return true;
      const fullName = `${st.lastName} ${st.firstName}`;
      const fullNorm = removeVietnameseTones(fullName);
      return fullNorm.includes(qNorm) || st.id.includes(qNorm);
    });
  }, [studentModalTab, studentSearch]);

  const selectPersonalStudent = (studentId: string) => {
    const st = STUDENTS_DATA.find((s) => s.id === studentId);
    if (!st) return;
    setMyStudentIdState(st.id);
    localStorage.setItem('rm3103_my_student', st.id);
    setGroupFilter(st.group);
    setStudentModalOpen(false);
    showToast(`Đã chọn lịch của ${st.lastName} ${st.firstName} (${st.groupLabel})!`, 'success');
  };

  const clearPersonalStudent = () => {
    setMyStudentIdState(null);
    localStorage.removeItem('rm3103_my_student');
    showToast('Đã tắt chế độ cá nhân hóa.', 'info');
  };

  const copyCurrentStudentList = () => {
    if (filteredStudents.length === 0) {
      showToast('Không có sinh viên nào để sao chép.', 'info');
      return;
    }
    const title =
      studentModalTab === 'all'
        ? 'DANH SÁCH LỚP RM31.03 (NHÓM 5 & NHÓM 6 - 27 SV)'
        : studentModalTab === 'nhom5'
        ? 'DANH SÁCH NHÓM 5 - LỚP RM31.03 (14 SV)'
        : 'DANH SÁCH NHÓM 6 - LỚP RM31.03 (13 SV)';

    const lines = [
      title,
      'Học phần: Thực hành Hóa học (Mã HP: 191393024)',
      ...filteredStudents.map(
        (st) => `${st.stt}. ${st.id} - ${st.lastName} ${st.firstName} (${st.groupLabel})`
      )
    ];
    copyTextToClipboard(lines.join('\n'));
    showToast(`Đã sao chép danh sách ${filteredStudents.length} SV!`, 'success');
  };

  // Note Modal helpers
  const openNoteModalForItem = (item: ScheduleItem) => {
    setActiveNoteItem(item);
    setNoteDraft(notes[item.id] || '');
  };

  const saveNote = () => {
    if (!activeNoteItem) return;
    const trimmed = noteDraft.trim();
    const nextNotes = { ...notes };
    if (trimmed) {
      nextNotes[activeNoteItem.id] = trimmed;
      showToast('Đã lưu ghi chú!', 'success');
    } else {
      delete nextNotes[activeNoteItem.id];
      showToast('Đã xóa ghi chú.', 'info');
    }
    setNotes(nextNotes);
    localStorage.setItem('rm3103_notes', JSON.stringify(nextNotes));
    setActiveNoteItem(null);
  };

  const deleteNote = () => {
    if (!activeNoteItem) return;
    const nextNotes = { ...notes };
    delete nextNotes[activeNoteItem.id];
    setNotes(nextNotes);
    localStorage.setItem('rm3103_notes', JSON.stringify(nextNotes));
    setActiveNoteItem(null);
    showToast('Đã xóa ghi chú.', 'info');
  };

  const clearAllNotes = () => {
    setNotes({});
    localStorage.removeItem('rm3103_notes');
    showToast('Đã xóa toàn bộ ghi chú.', 'info');
  };

  // .ICS Export helper
  const downloadICSFile = () => {
    const targetGroup = icsGroupSelect;
    const filteredItems = SCHEDULE_ITEMS.filter(
      (item) => targetGroup === 'all' || item.groups.includes(targetGroup)
    );

    const icsLines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//HUBT Khoa Rang Ham Mat//Lich Hoc RM31.03//VI',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];

    filteredItems.forEach((item) => {
      const startObj = parseDateLocal(item.startDate);
      const endObj = parseDateLocal(item.endDate);

      const cursor = new Date(startObj.getFullYear(), startObj.getMonth(), startObj.getDate());
      while (getVNDayOfWeek(cursor) !== item.dayOfWeek) {
        cursor.setDate(cursor.getDate() + 1);
      }

      const startTimeStr = item.session === 'SÁNG' ? '070000' : '130000';
      const endTimeStr = item.session === 'SÁNG' ? '104500' : '164500';

      while (cursor <= endObj) {
        const y = cursor.getFullYear();
        const m = String(cursor.getMonth() + 1).padStart(2, '0');
        const d = String(cursor.getDate()).padStart(2, '0');
        const datePart = `${y}${m}${d}`;

        const summary = `[${item.shortCode}] ${item.subject} - ${item.room} (${item.groupBadge})`;
        const noteText = notes[item.id] ? ` | Ghi chú: ${notes[item.id]}` : '';
        const desc = `Lớp RM31.03 - Khoa Răng Hàm Mặt HUBT | Thời lượng: ${item.periods} | ${item.durationText}${noteText}`;

        icsLines.push(
          'BEGIN:VEVENT',
          `UID:${item.id}-${datePart}@rm3103.hubt.edu.vn`,
          `DTSTAMP:${datePart}T000000Z`,
          `DTSTART;TZID=Asia/Ho_Chi_Minh:${datePart}T${startTimeStr}`,
          `DTEND;TZID=Asia/Ho_Chi_Minh:${datePart}T${endTimeStr}`,
          `SUMMARY:${summary}`,
          `LOCATION:${item.room} - Khoa Răng Hàm Mặt HUBT`,
          `DESCRIPTION:${desc}`,
          'END:VEVENT'
        );

        cursor.setDate(cursor.getDate() + 7);
      }
    });

    icsLines.push('END:VCALENDAR');

    const blob = new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileSuffix = targetGroup === 'all' ? 'CaLop' : targetGroup === 'nhom5' ? 'Nhom5' : 'Nhom6';
    a.download = `LichHoc_RM31.03_${fileSuffix}_HK1_2026.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportModalOpen(false);
    showToast('Đã tải file lịch .ICS!', 'success');
  };

  // Generate and download phone-optimized high-resolution PNG image of the concise timetable
  const exportPhoneScheduleImage = (targetGroup: GroupFilter) => {
    const items = SCHEDULE_ITEMS.filter((item) => {
      if (targetGroup === 'all') return true;
      return item.groups.includes(targetGroup);
    });

    const canvas = document.createElement('canvas');
    const width = 1080;
    const headerHeight = 270;
    const rowHeight = 115;
    const tableHeaderHeight = 70;
    const footerHeight = 248;
    const height = headerHeight + tableHeaderHeight + items.length * rowHeight + footerHeight;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Header gradient
    const grad = ctx.createLinearGradient(0, 0, width, 0);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.5, '#1e3a8a');
    grad.addColorStop(1, '#0f766e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, headerHeight);

    // School name
    ctx.fillStyle = '#5eead4';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TRƯỜNG ĐẠI HỌC KINH DOANH VÀ CÔNG NGHỆ HÀ NỘI · KHOA RĂNG HÀM MẶT', width / 2, 48);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 36px system-ui, -apple-system, sans-serif';
    ctx.fillText('THỜI KHÓA BIỂU LỚP RM31.03 (HK1 2026 - 2027)', width / 2, 102);

    // Target group
    const groupName =
      targetGroup === 'all'
        ? 'CẢ LỚP (27 SINH VIÊN)'
        : targetGroup === 'nhom5'
        ? 'NHÓM 5 (14 SINH VIÊN)'
        : 'NHÓM 6 (13 SINH VIÊN)';
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 25px system-ui, -apple-system, sans-serif';
    ctx.fillText(`ĐỐI TƯỢNG: ${groupName} · BÁC SĨ RĂNG HÀM MẶT`, width / 2, 150);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '500 20px system-ui, -apple-system, sans-serif';
    ctx.fillText('Học kỳ I: 12/10/2026 – 19/12/2026 · Mã HP TH Hóa: 191393024', width / 2, 190);

    // Important note on chemistry practical
    ctx.fillStyle = '#fed7aa';
    ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
    ctx.fillText('⚡ TH Hóa học: Nhóm 5 học Chiều T4 (P. C606) | Nhóm 6 học Sáng T5 (P. C606)', width / 2, 226);

    // Table columns
    const tableTop = headerHeight + 25;
    const colX = [40, 150, 320, 720, 870, 1040]; // Thứ, Buổi, Môn học, Phòng, Ngày áp dụng

    // Table Header
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(colX[0], tableTop, colX[5] - colX[0], tableHeaderHeight);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 21px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THỨ', (colX[0] + colX[1]) / 2, tableTop + 43);
    ctx.fillText('BUỔI', (colX[1] + colX[2]) / 2, tableTop + 43);
    ctx.textAlign = 'left';
    ctx.fillText('MÔN HỌC', colX[2] + 25, tableTop + 43);
    ctx.textAlign = 'center';
    ctx.fillText('PHÒNG', (colX[3] + colX[4]) / 2, tableTop + 43);
    ctx.fillText('NGÀY ÁP DỤNG', (colX[4] + colX[5]) / 2, tableTop + 43);

    let currentY = tableTop + tableHeaderHeight;

    items.forEach((item, idx) => {
      // Row background
      ctx.fillStyle = idx % 2 === 0 ? '#f8fafc' : '#ffffff';
      ctx.fillRect(colX[0], currentY, colX[5] - colX[0], rowHeight);

      // Borders
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.strokeRect(colX[0], currentY, colX[5] - colX[0], rowHeight);
      for (let i = 1; i < colX.length - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(colX[i], currentY);
        ctx.lineTo(colX[i], currentY + rowHeight);
        ctx.stroke();
      }

      // 1. Thứ
      ctx.textAlign = 'center';
      ctx.fillStyle = '#0f172a';
      ctx.font = '900 32px system-ui, -apple-system, sans-serif';
      ctx.fillText(`T${item.dayOfWeek}`, (colX[0] + colX[1]) / 2, currentY + 54);
      ctx.fillStyle = '#64748b';
      ctx.font = '600 16px system-ui, -apple-system, sans-serif';
      const dayName = DAYS_INFO.find((d) => d.dayOfWeek === item.dayOfWeek)?.label || '';
      ctx.fillText(dayName, (colX[0] + colX[1]) / 2, currentY + 80);

      // 2. Buổi
      const isMorning = item.session === 'SÁNG';
      ctx.fillStyle = isMorning ? '#fef3c7' : '#dbeafe';
      const pillW = 126;
      const pillH = 34;
      const pillX = (colX[1] + colX[2]) / 2 - pillW / 2;
      const pillY = currentY + 23;
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, 8);
      ctx.fill();

      ctx.fillStyle = isMorning ? '#b45309' : '#1d4ed8';
      ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
      ctx.fillText(item.session, (colX[1] + colX[2]) / 2, pillY + 24);

      ctx.fillStyle = '#475569';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(isMorning ? '07:00 – 10:45' : '13:00 – 16:45', (colX[1] + colX[2]) / 2, currentY + 88);

      // 3. Môn học
      ctx.textAlign = 'left';
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
      ctx.fillText(item.subject, colX[2] + 25, currentY + 46);

      ctx.fillStyle = '#64748b';
      ctx.font = '500 17px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${item.periods} · ${item.groupBadge}`, colX[2] + 25, currentY + 77);

      // 4. Phòng (pill)
      const roomStr = item.room.replace('Phòng ', '');
      const roomPillW = 114;
      const roomPillH = 46;
      const roomPillX = (colX[3] + colX[4]) / 2 - roomPillW / 2;
      const roomPillY = currentY + 34;

      if (roomStr.startsWith('C606')) {
        ctx.fillStyle = '#7e22ce';
      } else if (roomStr.startsWith('C402')) {
        ctx.fillStyle = '#d97706';
      } else if (roomStr.startsWith('D112')) {
        ctx.fillStyle = '#1d4ed8';
      } else if (roomStr.startsWith('C208')) {
        ctx.fillStyle = '#059669';
      } else {
        ctx.fillStyle = '#0284c7';
      }

      ctx.beginPath();
      ctx.roundRect(roomPillX, roomPillY, roomPillW, roomPillH, 10);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = '900 23px monospace';
      ctx.fillText(roomStr, (colX[3] + colX[4]) / 2, roomPillY + 32);

      // 5. Ngày áp dụng
      ctx.textAlign = 'center';
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
      const startStr = item.startDate === '2026-10-12' ? 'Từ 12/10/2026' : 'Từ 26/10/2026';
      ctx.fillText(startStr, (colX[4] + colX[5]) / 2, currentY + 47);

      ctx.fillStyle = '#64748b';
      ctx.font = '500 16px system-ui, -apple-system, sans-serif';
      ctx.fillText(item.totalWeeks ? `(${item.totalWeeks} tuần)` : '(Tuần 1–10)', (colX[4] + colX[5]) / 2, currentY + 77);

      currentY += rowHeight;
    });

    // Outer table border
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(colX[0], tableTop, colX[5] - colX[0], currentY - tableTop);

    // Footer summary box
    const footerY = currentY + 22;
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(colX[0], footerY, colX[5] - colX[0], 175, 12);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 19px system-ui, -apple-system, sans-serif';
    ctx.fillText('📍 DANH MỤC PHÒNG HỌC & LƯU Ý PHÂN NHÓM:', colX[0] + 25, footerY + 36);

    ctx.fillStyle = '#334155';
    ctx.font = '500 17px system-ui, -apple-system, sans-serif';
    ctx.fillText('• TH Hóa học (P. C606): Nhóm 5 học Chiều T4 | Nhóm 6 học Sáng T5 (Đã chuyển sang Sáng T5).', colX[0] + 25, footerY + 68);
    ctx.fillText('• TH Giải phẫu (P. C402): Nhóm 5 học Sáng T5 | Nhóm 6 học Chiều T4 (Bắt đầu từ 26/10/2026).', colX[0] + 25, footerY + 96);
    ctx.fillText('• Các phòng lý thuyết: LT Giải phẫu (D112), TNRHM (D210 & D206), Tiếng Anh 1 (C222), Tin 1 (D314), LT Hóa (C208).', colX[0] + 25, footerY + 124);

    ctx.fillStyle = '#b45309';
    ctx.font = 'bold 17px system-ui, -apple-system, sans-serif';
    ctx.fillText('• Lưu ý môn TNRHM: 2 buổi Sáng T4 & Chiều T6 dự kiến chuyển sang Sáng & Chiều Chủ Nhật (theo GV).', colX[0] + 25, footerY + 152);

    // Save as PNG
    const link = document.createElement('a');
    link.download = `TKB_RM31.03_${targetGroup.toUpperCase()}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Đã tải ảnh TKB ${groupName}!`, 'success');
  };

  // Render a compact course card inside the timetable grid or mobile agenda card
  const renderCourseCellCard = (item: ScheduleItem, specificDateObj: Date | null) => {
    const accent = THEME_ACCENTS[item.colorTheme];
    const userNote = notes[item.id] || '';
    const statusInfo = specificDateObj
      ? evaluateItemStatusOnDate(item, formatDateISO(specificDateObj))
      : null;

    if (statusInfo && !statusInfo.active && hideInactive) {
      return null;
    }

    const inactiveStyle = statusInfo && !statusInfo.active ? 'opacity-55 grayscale-[25%]' : '';
    const strikeStyle = statusInfo && statusInfo.status === 'ended' ? 'line-through' : '';

    return (
      <div
        key={item.id}
        onClick={() => openNoteModalForItem(item)}
        className={`group rounded-xl p-2.5 sm:p-3 border ${accent.surface} ${accent.border} ${accent.hoverBorder} ${inactiveStyle} hover:shadow-xs transition-all cursor-pointer text-left`}
      >
        {/* Top Row: Clickable Group Roster Link + Highlighted Room Tag */}
        <div className="flex items-center justify-between gap-1.5 text-[11px] mb-1">
          {item.rosterKey ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openStudentModal(item.rosterKey!);
              }}
              title={`Xem danh sách sinh viên ${item.groupBadge}`}
              className={`font-bold ${accent.groupText} hover:underline underline-offset-2 flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer`}
            >
              <Users className="w-3 h-3 opacity-80" />
              <span>{item.groupBadge}</span>
            </button>
          ) : (
            <span className={`font-bold ${accent.groupText} whitespace-nowrap shrink-0`}>
              {item.groupBadge}
            </span>
          )}
          <span
            className={`font-mono font-bold text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded shadow-2xs tabular-nums whitespace-nowrap shrink-0 ${accent.roomChip}`}
          >
            {item.room}
          </span>
        </div>

        {/* Course Subject Title */}
        <div
          className={`font-extrabold text-xs sm:text-sm ${accent.title} ${strikeStyle} flex items-center gap-1.5 leading-snug`}
        >
          {renderSubjectIcon(item.colorTheme)}
          <span>{item.subject}</span>
        </div>

        {/* Compact Metadata line */}
        <div className="mt-1 text-[11px] text-slate-700 dark:text-slate-300 tabular-nums leading-tight">
          <span>{item.periods}</span>
          <span className="mx-1" aria-hidden="true">·</span>
          <span>{item.durationText}</span>
        </div>

        {/* Week-specific status line */}
        {statusInfo && (
          <div
            className={`mt-1.5 pt-1 border-t border-black/10 dark:border-white/10 text-[10px] sm:text-[11px] font-bold tabular-nums ${statusInfo.textClass}`}
          >
            {statusInfo.label}
          </div>
        )}

        {/* User note if present */}
        {userNote && (
          <div className="mt-1.5 p-1.5 rounded-lg bg-yellow-100/95 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-700 text-[11px] text-yellow-950 dark:text-yellow-100 font-semibold break-words">
            📌 {userNote}
          </div>
        )}
      </div>
    );
  };

  const tableDays = DAYS_INFO.slice(0, 6); // Thứ Hai -> Thứ Bảy
  const noteKeys = Object.keys(notes);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/80 text-slate-900 dark:bg-slate-950 dark:text-slate-100 pb-16 md:pb-0">
      {/* Toast Notification Stack */}
      <div className="fixed bottom-16 md:bottom-5 right-3 sm:right-5 z-50 flex flex-col gap-2 pointer-events-none no-print">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto px-3.5 py-2 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 transition-all ${
              t.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-blue-900 dark:bg-slate-800 text-white border-blue-700'
            }`}
          >
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* TOP BAR CONTRACT: Compact 52px on mobile, 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-2xs no-print">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-13 sm:h-14 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            className="text-sm sm:text-base font-extrabold tracking-tight text-blue-900 dark:text-teal-300 whitespace-nowrap shrink-0 truncate"
          >
            RM31.03 · Khoa Răng Hàm Mặt HUBT
          </a>

          {/* Zone 2: 4–5 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a
              href="#hom-nay"
              className="hover:text-blue-700 dark:hover:text-teal-400 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Hôm Nay
            </a>
            <a
              href="#bang-lich"
              className="hover:text-blue-700 dark:hover:text-teal-400 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Thời Khóa Biểu
            </a>
            <button
              type="button"
              onClick={() => openStudentModal('all')}
              className="hover:text-blue-700 dark:hover:text-teal-400 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Danh Sách Lớp
            </button>
            <a
              href="#quy-dinh"
              className="hover:text-blue-700 dark:hover:text-teal-400 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Học Phần
            </a>
            <a
              href="#ghi-chu"
              className="hover:text-blue-700 dark:hover:text-teal-400 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Ghi Chú
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => {
                setIcsGroupSelect(groupFilter);
                setExportModalOpen(true);
              }}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-700 to-teal-600 hover:from-blue-800 hover:to-teal-700 rounded-lg shadow-2xs transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              Xuất .ICS
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR (<768px) FOR THUMB ERGONOMICS */}
      <nav
        aria-label="Điều hướng di động"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 grid grid-cols-4 h-14 no-print"
      >
        <a
          href="#hom-nay"
          className="flex flex-col items-center justify-center text-[11px] font-bold text-slate-600 dark:text-slate-300 active:text-blue-600"
        >
          <Clock className="w-4 h-4 mb-0.5 text-blue-600 dark:text-blue-400" />
          <span>Hôm nay</span>
        </a>
        <a
          href="#bang-lich"
          className="flex flex-col items-center justify-center text-[11px] font-bold text-slate-600 dark:text-slate-300 active:text-blue-600"
        >
          <Calendar className="w-4 h-4 mb-0.5 text-teal-600 dark:text-teal-400" />
          <span>Lịch tuần</span>
        </a>
        <button
          type="button"
          onClick={() => openStudentModal('all')}
          className="flex flex-col items-center justify-center text-[11px] font-bold text-slate-600 dark:text-slate-300 active:text-blue-600 cursor-pointer"
        >
          <Users className="w-4 h-4 mb-0.5 text-indigo-600 dark:text-indigo-400" />
          <span>DS 27 SV</span>
        </button>
        <a
          href="#ghi-chu"
          className="flex flex-col items-center justify-center text-[11px] font-bold text-slate-600 dark:text-slate-300 active:text-blue-600"
        >
          <FileText className="w-4 h-4 mb-0.5 text-amber-600 dark:text-amber-400" />
          <span>Ghi chú {noteKeys.length > 0 ? `(${noteKeys.length})` : ''}</span>
        </a>
      </nav>

      {/* MAIN WORKSPACE CONTAINER - Compact spacing for phones */}
      <main id="top" className="flex-grow max-w-6xl w-full mx-auto px-2.5 sm:px-5 py-3 sm:py-5 space-y-3.5 sm:space-y-5">
        {/* COMPACT COLORFUL MEDICAL HERO BANNER */}
        <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-teal-700 dark:from-slate-900 dark:via-blue-950 dark:to-teal-950 text-white rounded-2xl shadow-sm border border-blue-700/40 p-3.5 sm:p-5 no-print">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-[11px] sm:text-xs font-semibold text-teal-200 tabular-nums flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                <span>Khoa Răng Hàm Mặt - HUBT</span>
                <span aria-hidden="true">·</span>
                <span>HK1 (2026–2027)</span>
                <span aria-hidden="true">·</span>
                <span className="text-amber-300 font-bold">{liveDateLabel}</span>
              </div>
              <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-white">
                Thời Khóa Biểu Lớp RM31.03
              </h1>
              <p className="text-xs sm:text-sm text-blue-100">
                Phân nhóm:{' '}
                <button
                  type="button"
                  onClick={() => openStudentModal('nhom5')}
                  className="font-bold text-amber-300 underline decoration-amber-300/70 underline-offset-2 hover:text-white cursor-pointer"
                >
                  Nhóm 5 (14 SV)
                </button>{' '}
                &amp;{' '}
                <button
                  type="button"
                  onClick={() => openStudentModal('nhom6')}
                  className="font-bold text-teal-200 underline decoration-teal-200/70 underline-offset-2 hover:text-white cursor-pointer"
                >
                  Nhóm 6 (13 SV)
                </button>
              </p>
            </div>

            {/* Compact Action Bar */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => openStudentModal('all')}
                className="min-h-[40px] px-3 py-1.5 rounded-xl bg-teal-500/30 hover:bg-teal-500/45 border border-teal-300/40 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-teal-200" />
                <span>DS 27 SV</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPhoneModalGroup(groupFilter === 'all' ? 'nhom5' : groupFilter);
                  setPhoneModalOpen(true);
                }}
                title="Xem và tải bảng thời khóa biểu rút gọn tối ưu cho điện thoại"
                className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/35 to-amber-600/35 hover:from-amber-500/50 hover:to-amber-600/50 border border-amber-300/60 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
              >
                <Smartphone className="w-3.5 h-3.5 text-amber-300" />
                <span>Tải TKB</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                title="In hoặc xuất PDF thời khóa biểu ra khổ A4 xoay ngang (Landscape) tràn đều 100% trang giấy"
                className="min-h-[40px] px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-blue-200" />
                <span>In A4 Ngang</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDark((prev) => !prev)}
                aria-label="Đổi giao diện Sáng / Tối"
                className="min-h-[40px] px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {isDark ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-300" />
                    <span>Chế độ Sáng</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-blue-100" />
                    <span>Chế độ Tối</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* PERSONALIZED STUDENT BAR */}
          {myStudent && (
            <div className="mt-3 pt-3 border-t border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-start sm:items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400/25 border border-amber-300/40 flex items-center justify-center text-amber-200 shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-white tabular-nums">
                    <span className="text-teal-200">Lịch của: </span>
                    <strong className="font-extrabold text-amber-300">
                      {myStudent.lastName} {myStudent.firstName}
                    </strong>
                    <span className="mx-1" aria-hidden="true">·</span>
                    <span className="font-mono text-[11px] text-blue-100">{myStudent.id}</span>
                    <span className="mx-1" aria-hidden="true">·</span>
                    <span className="font-bold text-teal-200">{myStudent.groupLabel}</span>
                  </div>
                  <p className="text-[11px] text-blue-100 mt-0.5 leading-snug">
                    {myStudent.group === 'nhom5'
                      ? 'TH Hóa: Chiều T4 (C606) · TH Giải phẫu: Sáng T5 (C402)'
                      : 'TH Hóa: Sáng T5 (C606) · TH Giải phẫu: Chiều T4 (C402)'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => openStudentModal('all')}
                  className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-[11px] font-semibold text-white cursor-pointer"
                >
                  Đổi SV
                </button>
                <button
                  type="button"
                  onClick={clearPersonalStudent}
                  className="px-2 py-1 rounded-lg bg-rose-500/35 hover:bg-rose-500/55 text-[11px] font-semibold text-white cursor-pointer"
                >
                  Thoát
                </button>
              </div>
            </div>
          )}
        </section>

        {/* 1. LỊCH HỌC NHANH: HÔM NAY & NGÀY MAI (Đưa lên đầu trang cho sinh viên dễ nhìn, dễ tra cứu tức thì) */}
        <section
          id="hom-nay"
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xs border border-slate-200 dark:border-slate-800 p-3.5 sm:p-5 no-print"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pb-3 mb-3.5 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  Lịch Học Nhanh: Hôm Nay &amp; Ngày Mai
                </h2>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Xem nhanh môn học, phòng học và ca sáng/chiều mà không cần cuộn trang
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Nút chọn nhanh Nhóm ngay tại khối Lịch Nhanh */}
              <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                {(
                  [
                    { key: 'all', label: 'Cả lớp' },
                    { key: 'nhom5', label: 'Nhóm 5' },
                    { key: 'nhom6', label: 'Nhóm 6' }
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setGroupFilter(tab.key)}
                    className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      groupFilter === tab.key
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Bộ chọn ngày tham chiếu */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 tabular-nums">
                <input
                  id="custom-date-picker"
                  type="date"
                  value={referenceDateStr}
                  onChange={(e) => setReferenceDateStr(e.target.value)}
                  className="min-h-[34px] px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    setReferenceDateStr(todayISO);
                    showToast('Đã đặt lại về hôm nay.', 'info');
                  }}
                  className="min-h-[34px] px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 font-bold text-blue-700 dark:text-blue-300 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Hôm nay
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Hôm nay */}
            <div className="rounded-xl bg-gradient-to-br from-blue-50/90 via-blue-50/50 to-indigo-50/60 dark:from-blue-950/30 dark:to-slate-900 p-3 border border-blue-200 dark:border-blue-800/70">
              <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-blue-200/70 dark:border-blue-800/60">
                <div className="flex items-center gap-1.5 tabular-nums">
                  <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-extrabold uppercase">
                    Hôm nay
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-blue-950 dark:text-blue-100">
                    {todaySummary.dayInfo.label}, {formatDDMMYYYY(todaySummary.dateISO)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyDaySchedule('today')}
                  className="text-[11px] font-bold text-blue-700 dark:text-blue-300 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>

              {todaySummary.items.length === 0 ? (
                <div className="py-3 px-2.5 rounded-lg bg-white/80 dark:bg-slate-900/70 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
                  🎉 Nghỉ cả ngày — Không có lịch học.
                </div>
              ) : (
                <div className="space-y-2">
                  {todaySummary.items.map((item) => {
                    const st = evaluateItemStatusOnDate(item, todaySummary.dateISO);
                    const accent = THEME_ACCENTS[item.colorTheme];
                    return (
                      <div
                        key={item.id}
                        onClick={() => openNoteModalForItem(item)}
                        className={`p-2.5 rounded-xl bg-white dark:bg-slate-900 border ${accent.border} cursor-pointer flex items-center justify-between gap-2`}
                      >
                        <div>
                          <div className="text-[11px] font-bold tabular-nums flex flex-wrap items-center gap-1">
                            <span
                              className={
                                item.session === 'SÁNG'
                                  ? 'text-amber-700 dark:text-amber-400'
                                  : 'text-blue-700 dark:text-blue-400'
                              }
                            >
                              {item.session}
                            </span>
                            <span>·</span>
                            <span className={accent.groupText}>{item.groupBadge}</span>
                            <span>·</span>
                            <span className={`font-mono px-1.5 py-0.2 rounded text-[10px] ${accent.roomChip}`}>
                              {item.room}
                            </span>
                          </div>
                          <div className={`font-extrabold text-xs sm:text-sm mt-0.5 ${accent.title}`}>
                            {item.subject}
                          </div>
                        </div>
                        <div className={`text-[11px] font-bold tabular-nums shrink-0 ${st.textClass}`}>
                          {st.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Ngày mai */}
            <div className="rounded-xl bg-gradient-to-br from-teal-50/90 via-teal-50/50 to-emerald-50/60 dark:from-teal-950/30 dark:to-slate-900 p-3 border border-teal-200 dark:border-teal-800/70">
              <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-teal-200/70 dark:border-teal-800/60">
                <div className="flex items-center gap-1.5 tabular-nums">
                  <span className="px-2 py-0.5 rounded bg-teal-600 text-white text-[10px] font-extrabold uppercase">
                    Ngày mai
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-teal-950 dark:text-teal-100">
                    {tomorrowSummary.dayInfo.label}, {formatDDMMYYYY(tomorrowSummary.dateISO)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyDaySchedule('tomorrow')}
                  className="text-[11px] font-bold text-teal-700 dark:text-teal-300 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>

              {tomorrowSummary.items.length === 0 ? (
                <div className="py-3 px-2.5 rounded-lg bg-white/80 dark:bg-slate-900/70 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
                  🎉 Nghỉ cả ngày — Không có lịch học.
                </div>
              ) : (
                <div className="space-y-2">
                  {tomorrowSummary.items.map((item) => {
                    const st = evaluateItemStatusOnDate(item, tomorrowSummary.dateISO);
                    const accent = THEME_ACCENTS[item.colorTheme];
                    return (
                      <div
                        key={item.id}
                        onClick={() => openNoteModalForItem(item)}
                        className={`p-2.5 rounded-xl bg-white dark:bg-slate-900 border ${accent.border} cursor-pointer flex items-center justify-between gap-2`}
                      >
                        <div>
                          <div className="text-[11px] font-bold tabular-nums flex flex-wrap items-center gap-1">
                            <span
                              className={
                                item.session === 'SÁNG'
                                  ? 'text-amber-700 dark:text-amber-400'
                                  : 'text-blue-700 dark:text-blue-400'
                              }
                            >
                              {item.session}
                            </span>
                            <span>·</span>
                            <span className={accent.groupText}>{item.groupBadge}</span>
                            <span>·</span>
                            <span className={`font-mono px-1.5 py-0.2 rounded text-[10px] ${accent.roomChip}`}>
                              {item.room}
                            </span>
                          </div>
                          <div className={`font-extrabold text-xs sm:text-sm mt-0.5 ${accent.title}`}>
                            {item.subject}
                          </div>
                        </div>
                        <div className={`text-[11px] font-bold tabular-nums shrink-0 ${st.textClass}`}>
                          {st.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 2. COMPACT FILTER CONTROLS BAR (Thời khóa biểu cả tuần) */}
        <section
          id="bang-lich"
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xs border border-slate-200 dark:border-slate-800 p-3 sm:p-4 no-print space-y-3"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
            {/* 1. Group Segmented Control */}
            <div className="lg:col-span-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  1. Chọn Nhóm
                </span>
                <button
                  type="button"
                  onClick={() => openStudentModal(groupFilter)}
                  className="text-[11px] font-bold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
                >
                  Tìm tên / Mã SV
                </button>
              </div>
              <div className="grid grid-cols-3 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                {(
                  [
                    { key: 'all', label: 'Cả lớp (27)', activeClass: 'bg-blue-600 text-white shadow-2xs' },
                    { key: 'nhom5', label: 'Nhóm 5 (14)', activeClass: 'bg-indigo-600 text-white shadow-2xs' },
                    { key: 'nhom6', label: 'Nhóm 6 (13)', activeClass: 'bg-teal-600 text-white shadow-2xs' }
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setGroupFilter(tab.key)}
                    className={`min-h-[38px] px-2 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
                      groupFilter === tab.key
                        ? tab.activeClass
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Week Selector */}
            <div className="lg:col-span-5">
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="week-selector"
                  className="text-[11px] font-bold text-slate-500 dark:text-slate-400"
                >
                  2. Chọn Tuần Học
                </label>
                <button
                  type="button"
                  onClick={jumpToCurrentWeek}
                  className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Về tuần hiện tại
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => stepWeek(-1)}
                  title="Tuần trước"
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 shrink-0 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <select
                  id="week-selector"
                  value={weekFilter}
                  onChange={(e) => setWeekFilter(e.target.value)}
                  className="min-h-[40px] w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {WEEKS_DATA.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => stepWeek(1)}
                  title="Tuần kế tiếp"
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 shrink-0 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 3. View Mode Toggle */}
            <div className="lg:col-span-3">
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                3. Định Dạng Xem
              </div>
              <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setViewMode('card')}
                  className={`min-h-[38px] px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 whitespace-nowrap shrink-0 cursor-pointer ${
                    viewMode === 'card'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Thẻ ĐT</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`min-h-[38px] px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 whitespace-nowrap shrink-0 cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Bảng Gọn</span>
                </button>
              </div>
            </div>
          </div>

          {/* Compact Color Legend + Week Status */}
          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {(
                ['blue', 'amber', 'purple', 'emerald', 'indigo', 'rose', 'cyan'] as const
              ).map((key) => {
                const item = THEME_ACCENTS[key];
                return (
                  <div
                    key={key}
                    className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300"
                  >
                    <span className={`w-2.5 h-2.5 rounded-xs ${item.dotColor}`} />
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>

            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none shrink-0 font-semibold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={hideInactive}
                onChange={(e) => setHideInactive(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
              />
              <span>Ẩn môn chưa học / đã kết thúc</span>
            </label>
          </div>
        </section>

        {/* PRINT-ONLY OFFICIAL HEADER FOR A4 LANDSCAPE (100% WIDTH) */}
        <div id="print-official-header" className="hidden print-only mb-2 border-b-2 border-slate-900 pb-1.5">
          <div className="grid grid-cols-2 text-center text-[9px] leading-tight pb-1 border-b border-slate-300">
            <div>
              <div className="font-semibold uppercase tracking-wider text-slate-700">
                TRƯỜNG ĐẠI HỌC KINH DOANH VÀ CÔNG NGHỆ HÀ NỘI
              </div>
              <div className="font-black uppercase tracking-wider text-blue-950 text-[10.5px] mt-0.5">
                KHOA RĂNG HÀM MẶT
              </div>
            </div>
            <div>
              <div className="font-bold uppercase tracking-wider text-slate-800">
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </div>
              <div className="font-semibold italic text-slate-700 text-[9.5px] mt-0.5">
                Độc lập – Tự do – Hạnh phúc
              </div>
            </div>
          </div>

          <div className="text-center mt-1.5">
            <h1 className="text-sm font-black uppercase tracking-wide text-blue-950">
              THỜI KHÓA BIỂU HỌC KỲ I (NĂM HỌC 2026 – 2027)
            </h1>
            <div className="text-[10px] font-extrabold text-slate-800 mt-0.5">
              LỚP: RM31.03 &bull; CHUYÊN NGÀNH: BÁC SĨ RĂNG HÀM MẶT (CHÍNH KHÓA)
            </div>
            <div className="flex items-center justify-center gap-3 text-[9px] text-slate-600 mt-0.5 tabular-nums font-medium">
              <span>📅 Thời gian: 12/10/2026 – 19/12/2026 (10 tuần thực học)</span>
              <span>&bull;</span>
              <span className="font-bold text-blue-900">
                Chế độ xem: {groupFilter === 'all'
                  ? 'Cả lớp RM31.03 (27 Sinh viên)'
                  : groupFilter === 'nhom5'
                  ? 'Nhóm 5 (14 Sinh viên)'
                  : 'Nhóm 6 (13 Sinh viên)'}
              </span>
              <span>&bull;</span>
              <span className="font-semibold text-slate-700">
                {weekFilter === 'all'
                  ? 'Toàn bộ học kỳ'
                  : `${currentWeekObj.name} (${currentWeekObj.rangeText})`}
              </span>
            </div>
          </div>
        </div>

        {/* 2A. MOBILE-OPTIMIZED CARD VIEW (WITH QUICK DAY FILTER STRIP) */}
        <section
          id="card-view-container"
          className={`${viewMode === 'card' ? 'block' : 'hidden'} space-y-3 no-print`}
        >
          {/* Horizontal Day Scroller for 1-Thumb Phone Filtering */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
            <button
              type="button"
              onClick={() => setMobileDayFilter('all')}
              className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                mobileDayFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              Cả tuần (T2–T7)
            </button>
            {tableDays.map((d) => {
              const colDateObj = getDateForDayInSelectedWeek(d.offsetFromMonday);
              const colDateISO = colDateObj ? formatDateISO(colDateObj) : null;
              const isTodayBtn =
                (weekFilter === 'all' && d.dayOfWeek === todayVNDay) || colDateISO === todayISO;
              const isSelected = mobileDayFilter === d.dayOfWeek;

              return (
                <button
                  key={d.dayOfWeek}
                  type="button"
                  onClick={() => setMobileDayFilter(d.dayOfWeek)}
                  className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer tabular-nums ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : isTodayBtn
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 border border-teal-400'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <span>{d.shortLabel}</span>
                  {colDateObj && <span className="ml-1 opacity-80">({formatDDMM(colDateObj)})</span>}
                  {isTodayBtn && <span className="ml-1 text-[10px] underline">Hôm nay</span>}
                </button>
              );
            })}
          </div>

          {/* Compact Day Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {tableDays
              .filter((d) => mobileDayFilter === 'all' || d.dayOfWeek === mobileDayFilter)
              .map((d) => {
                const colDateObj = getDateForDayInSelectedWeek(d.offsetFromMonday);
                const colDateISO = colDateObj ? formatDateISO(colDateObj) : null;
                const isTodayCard =
                  (weekFilter === 'all' && d.dayOfWeek === todayVNDay) || colDateISO === todayISO;

                const morningCards = SCHEDULE_ITEMS.filter((item) => {
                  if (item.dayOfWeek !== d.dayOfWeek || item.session !== 'SÁNG') return false;
                  return groupFilter === 'all' || item.groups.includes(groupFilter);
                })
                  .map((it) => renderCourseCellCard(it, colDateObj))
                  .filter(Boolean);

                const afternoonCards = SCHEDULE_ITEMS.filter((item) => {
                  if (item.dayOfWeek !== d.dayOfWeek || item.session !== 'CHIỀU') return false;
                  return groupFilter === 'all' || item.groups.includes(groupFilter);
                })
                  .map((it) => renderCourseCellCard(it, colDateObj))
                  .filter(Boolean);

                const hasAnyClass = morningCards.length > 0 || afternoonCards.length > 0;

                return (
                  <div
                    key={d.dayOfWeek}
                    className={`rounded-2xl bg-white dark:bg-slate-900 border ${
                      isTodayCard
                        ? 'border-blue-600 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800'
                    } overflow-hidden shadow-2xs flex flex-col`}
                  >
                    <div
                      className={`px-3.5 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between tabular-nums ${
                        isTodayCard
                          ? 'bg-gradient-to-r from-blue-700 to-teal-600 text-white'
                          : 'bg-gradient-to-r from-slate-100 to-blue-50/60 dark:from-slate-800 dark:to-slate-800 text-slate-900 dark:text-white'
                      }`}
                    >
                      <span className="font-extrabold text-xs sm:text-sm">
                        {d.label} {colDateObj ? `(${formatDDMM(colDateObj)}/2026)` : ''}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {!hasAnyClass && (
                          <span className="text-[11px] opacity-80 font-medium">Nghỉ cả ngày</span>
                        )}
                        {isTodayCard && (
                          <span className="px-2 py-0.5 rounded bg-white text-blue-700 text-[10px] font-extrabold uppercase">
                            Hôm nay
                          </span>
                        )}
                      </div>
                    </div>

                    {hasAnyClass ? (
                      <div className="p-3 space-y-2.5 flex-1">
                        {/* Buổi Sáng */}
                        <div>
                          <div className="text-[11px] font-extrabold text-amber-700 dark:text-amber-400 mb-1.5 flex items-center gap-1">
                            <Sun className="w-3.5 h-3.5" />
                            <span>SÁNG</span>
                          </div>
                          {morningCards.length > 0 ? (
                            <div className="space-y-2">{morningCards}</div>
                          ) : (
                            <div className="py-1.5 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-[11px] text-slate-400 italic">
                              Nghỉ buổi sáng
                            </div>
                          )}
                        </div>

                        {/* Buổi Chiều */}
                        <div>
                          <div className="text-[11px] font-extrabold text-blue-700 dark:text-blue-400 mb-1.5 flex items-center gap-1">
                            <Sunset className="w-3.5 h-3.5" />
                            <span>CHIỀU</span>
                          </div>
                          {afternoonCards.length > 0 ? (
                            <div className="space-y-2">{afternoonCards}</div>
                          ) : (
                            <div className="py-1.5 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-[11px] text-slate-400 italic">
                              Nghỉ buổi chiều
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 text-xs text-slate-400 dark:text-slate-500 italic text-center">
                        Không có lịch học
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </section>

        {/* 2B. COMPACT TIMETABLE GRID VIEW (TABLE VIEW) */}
        <section
          id="table-view-container"
          className={`${
            viewMode === 'table' ? 'block' : 'hidden'
          } bg-white dark:bg-slate-900 rounded-2xl shadow-2xs border border-slate-200 dark:border-slate-800 overflow-hidden`}
        >
          <div className="custom-scrollbar overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[680px]">
              <thead>
                <tr className="bg-gradient-to-r from-slate-100 via-blue-50/60 to-teal-50/60 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 text-slate-800 dark:text-slate-100 text-xs font-extrabold border-b border-slate-200 dark:border-slate-700">
                  <th className="p-2 sm:p-3 border-r border-slate-200 dark:border-slate-700 w-16 sm:w-20 text-center uppercase">
                    Buổi
                  </th>
                  {tableDays.map((d) => {
                    const colDateObj = getDateForDayInSelectedWeek(d.offsetFromMonday);
                    const colDateISO = colDateObj ? formatDateISO(colDateObj) : null;
                    const isTodayCol =
                      (weekFilter === 'all' && d.dayOfWeek === todayVNDay) || colDateISO === todayISO;

                    return (
                      <th
                        key={d.dayOfWeek}
                        className={`p-2 sm:p-3 border-r last:border-r-0 border-slate-200 dark:border-slate-700 text-center w-[15.5%] ${
                          isTodayCol
                            ? 'bg-blue-600/15 dark:bg-blue-500/25 text-blue-900 dark:text-blue-200 border-t-4 border-t-blue-600'
                            : ''
                        }`}
                      >
                        <div className="flex flex-col items-center tabular-nums">
                          <span className="text-xs sm:text-sm font-extrabold">{d.label}</span>
                          {colDateObj && (
                            <span className="text-[10px] sm:text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                              {formatDDMM(colDateObj)}
                            </span>
                          )}
                          {isTodayCol && (
                            <span className="mt-0.5 px-1.5 py-0.2 rounded bg-blue-600 text-white text-[9px] font-extrabold uppercase">
                              Hôm nay
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs sm:text-sm">
                {(['SÁNG', 'CHIỀU'] as const).map((sessionKey) => (
                  <tr key={sessionKey} className="divide-x divide-slate-200 dark:divide-slate-800">
                    <td
                      className={`p-1.5 sm:p-2 text-center align-middle font-extrabold text-[11px] ${
                        sessionKey === 'SÁNG'
                          ? 'bg-amber-50/70 dark:bg-amber-950/25 text-amber-900 dark:text-amber-300'
                          : 'bg-blue-50/70 dark:bg-blue-950/25 text-blue-900 dark:text-blue-300'
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center gap-0.5 text-center leading-tight">
                        {sessionKey === 'SÁNG' ? (
                          <Sun className="w-4 h-4 text-amber-500 no-print" />
                        ) : (
                          <Sunset className="w-4 h-4 text-blue-500 no-print" />
                        )}
                        <span className="font-black text-xs uppercase tracking-wide">{sessionKey}</span>
                        <span className="font-mono text-[9px] font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {sessionKey === 'SÁNG' ? '07:00 – 10:45' : '13:00 – 16:45'}
                        </span>
                        <span className="text-[8.5px] font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {sessionKey === 'SÁNG' ? '(Tiết 1 – 4)' : '(Tiết 7 – 10)'}
                        </span>
                      </div>
                    </td>
                    {tableDays.map((d) => {
                      const colDateObj = getDateForDayInSelectedWeek(d.offsetFromMonday);
                      const colDateISO = colDateObj ? formatDateISO(colDateObj) : null;
                      const isTodayCol =
                        (weekFilter === 'all' && d.dayOfWeek === todayVNDay) ||
                        colDateISO === todayISO;

                      const matchingItems = SCHEDULE_ITEMS.filter((item) => {
                        if (item.dayOfWeek !== d.dayOfWeek || item.session !== sessionKey)
                          return false;
                        if (groupFilter === 'all') return true;
                        return item.groups.includes(groupFilter);
                      });

                      const renderedCards = matchingItems
                        .map((item) => renderCourseCellCard(item, colDateObj))
                        .filter(Boolean);

                      return (
                        <td
                          key={d.dayOfWeek}
                          className={`p-1.5 sm:p-2 align-top ${
                            isTodayCol ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                          }`}
                        >
                          {renderedCards.length > 0 ? (
                            <div className="space-y-2">{renderedCards}</div>
                          ) : (
                            <div className="h-full min-h-[64px] flex items-center justify-center text-[11px] text-slate-400 dark:text-slate-600 italic select-none">
                              Nghỉ
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PRINT-ONLY FOOTER SUMMARY: GỌN GÀNG VỪA KHÍT TRONG 1 TRANG A4 */}
          <div className="hidden print-only print-footer-summary p-1.5 bg-slate-50 border-t-2 border-slate-900 text-[8.5px] leading-tight">
            <div className="grid grid-cols-3 gap-2">
              <div className="border border-slate-300 rounded p-1 bg-white">
                <div className="font-black text-blue-950 uppercase mb-0.5">
                  📍 ĐỊA ĐIỂM &amp; PHÒNG HỌC
                </div>
                <div>&bull; <strong>TH Hóa học:</strong> Phòng C606 (N5: Chiều T4 | N6: Sáng T5)</div>
                <div>&bull; <strong>TH Giải phẫu:</strong> Phòng C402 (N5: Sáng T5 | N6: Chiều T4)</div>
                <div>&bull; <strong>LT Giải phẫu:</strong> Phòng D112 | <strong>LT Hóa:</strong> Phòng C208</div>
                <div>&bull; <strong>TNRHM:</strong> D210 &amp; D206 | <strong>HAT:</strong> C222 | <strong>TINT:</strong> D314</div>
              </div>

              <div className="border border-slate-300 rounded p-1 bg-white">
                <div className="font-black text-teal-950 uppercase mb-0.5">
                  👥 PHÂN NHÓM THỰC HÀNH (27 SV)
                </div>
                <div>&bull; <strong>Nhóm 5 (14 SV):</strong> STT 01 &rarr; 14 (Lê Phan An &rarr; Trương Hoàng Hiệp)</div>
                <div>&bull; <strong>Nhóm 6 (13 SV):</strong> STT 01 &rarr; 13 (Lê Văn Hòe &rarr; Phạm Đường Vũ)</div>
                <div className="text-amber-800 font-semibold italic mt-0.5">* Lưu ý: 2 buổi TNRHM (Sáng T4 &amp; Chiều T6) dự kiến chuyển sang Sáng &amp; Chiều Chủ Nhật.</div>
              </div>

              <div className="border border-slate-300 rounded p-1 bg-white flex flex-col justify-between">
                <div>
                  <div className="font-black text-slate-900 uppercase mb-0.5">
                    ⏰ KHUNG GIỜ HỌC
                  </div>
                  <div>&bull; <strong>Sáng:</strong> Tiết 1 &ndash; 4 (07:00 &ndash; 10:45)</div>
                  <div>&bull; <strong>Chiều:</strong> Tiết 7 &ndash; 10 (13:00 &ndash; 16:45)</div>
                </div>
                <div className="text-[8px] text-slate-500 pt-0.5 border-t border-slate-200 flex items-center justify-between">
                  <span>RM31.03 Khoa RHM - HUBT</span>
                  <span className="font-bold text-slate-700">Trang 1/1</span>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* 4. COMPACT COURSE REGULATIONS & PERSONAL NOTES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-5 no-print">
          {/* Course Implementation Details */}
          <section
            id="quy-dinh"
            className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xs border border-slate-200 dark:border-slate-800 p-3.5 sm:p-5 space-y-3.5 no-print"
          >
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  Quy Định Học Phần &amp; Phân Nhóm
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                  Khoa Răng Hàm Mặt HUBT · Mã HP Hóa TH: 191393024
                </p>
              </div>
              <button
                type="button"
                onClick={() => openStudentModal('all')}
                className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-xs font-bold text-teal-800 dark:text-teal-300 whitespace-nowrap shrink-0 cursor-pointer no-print"
              >
                DS 27 SV
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs tabular-nums">
              <div className="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/35 border border-blue-200 dark:border-blue-800/70 space-y-1">
                <div className="flex items-center justify-between font-extrabold text-blue-950 dark:text-blue-200">
                  <span>Lý thuyết Giải phẫu (P. D112)</span>
                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-blue-600 text-white">
                    4 tiết
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300">
                  • <strong>8 tuần</strong> (12/10 – 05/12/2026) · <strong>Chiều Thứ Hai</strong>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/85 dark:bg-amber-950/35 border border-amber-200 dark:border-amber-800/70 space-y-1">
                <div className="flex items-center justify-between font-extrabold text-amber-950 dark:text-amber-200">
                  <span>Thực hành Giải phẫu (P. C402)</span>
                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-amber-600 text-white">
                    5 tiết
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300">
                  • <strong>6 tuần</strong> (26/10 – 05/12) ·{' '}
                  <button
                    type="button"
                    onClick={() => openStudentModal('nhom5')}
                    className="underline font-bold text-amber-900 dark:text-amber-300 cursor-pointer"
                  >
                    N5: Sáng T5
                  </button>{' '}
                  |{' '}
                  <button
                    type="button"
                    onClick={() => openStudentModal('nhom6')}
                    className="underline font-bold text-amber-900 dark:text-amber-300 cursor-pointer"
                  >
                    N6: Chiều T4
                  </button>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/35 border border-emerald-200 dark:border-emerald-800/70 space-y-1">
                <div className="flex items-center justify-between font-extrabold text-emerald-950 dark:text-emerald-200">
                  <span>Lý thuyết Hóa học (P. C208)</span>
                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                    4 tiết
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300">
                  • <strong>8 tuần</strong> (12/10 – 05/12/2026) · <strong>Chiều Thứ Bảy</strong>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-purple-50/80 dark:bg-purple-950/35 border border-purple-200 dark:border-purple-800/70 space-y-1">
                <div className="flex items-center justify-between font-extrabold text-purple-950 dark:text-purple-200">
                  <span>Thực hành Hóa học (P. C606)</span>
                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-purple-600 text-white">
                    4 tiết
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300">
                  • <strong>8 tuần</strong> (26/10 – 19/12) ·{' '}
                  <button
                    type="button"
                    onClick={() => openStudentModal('nhom5')}
                    className="underline font-bold text-purple-900 dark:text-purple-300 cursor-pointer"
                  >
                    N5: Chiều T4
                  </button>{' '}
                  |{' '}
                  <button
                    type="button"
                    onClick={() => openStudentModal('nhom6')}
                    className="underline font-bold text-purple-900 dark:text-purple-300 cursor-pointer"
                  >
                    N6: Sáng T5
                  </button>
                </p>
              </div>
            </div>
          </section>

          {/* Personal Notes Panel */}
          <section
            id="ghi-chu"
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xs border border-slate-200 dark:border-slate-800 p-3.5 sm:p-5 flex flex-col justify-between no-print"
          >
            <div>
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                    Sổ Tay Ghi Chú
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Chạm vào môn học bất kỳ để thêm lời nhắc
                  </p>
                </div>
                {noteKeys.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllNotes}
                    className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                  >
                    Xóa hết
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                {noteKeys.length === 0 ? (
                  <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-slate-800/40 border border-dashed border-amber-300 dark:border-slate-700 text-center text-xs text-slate-600 dark:text-slate-400">
                    Chưa có ghi chú nào. Chạm vào môn học để lưu lời nhắc (áo blouse, giáo trình, lịch kiểm tra).
                  </div>
                ) : (
                  noteKeys.map((itemId) => {
                    const item = SCHEDULE_ITEMS.find((i) => i.id === itemId);
                    if (!item) return null;
                    const dayInfo = DAYS_INFO.find((d) => d.dayOfWeek === item.dayOfWeek);
                    const accent = THEME_ACCENTS[item.colorTheme];
                    return (
                      <div
                        key={itemId}
                        onClick={() => openNoteModalForItem(item)}
                        className={`p-2.5 rounded-xl ${accent.surface} border ${accent.border} cursor-pointer text-xs`}
                      >
                        <div className={`flex items-center justify-between font-extrabold ${accent.title}`}>
                          <span>{item.subject}</span>
                          <span className="font-mono text-[10px]">
                            {dayInfo?.shortLabel} · {item.session}
                          </span>
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 font-medium mt-0.5 break-words">
                          📌 {notes[itemId]}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 py-5 text-xs mt-4 no-print">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-center sm:text-left">
          <p className="font-semibold text-white">
            Lớp RM31.03 · Khoa Răng Hàm Mặt · Đại học Kinh doanh và Công nghệ Hà Nội (HUBT)
          </p>
          <p className="tabular-nums text-teal-300 font-medium">
            Học kỳ I (2026–2027) · Nhóm 5 (14 SV) &amp; Nhóm 6 (13 SV)
          </p>
        </div>
      </footer>

      {/* =====================================================================
          MODAL 1: MOBILE-FRIENDLY STUDENT DIRECTORY (27 SINH VIÊN)
         ===================================================================== */}
      {studentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 no-print">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Modal Header */}
            <div className="px-4 py-3.5 bg-gradient-to-r from-blue-900 via-blue-800 to-teal-700 text-white flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold">
                  Danh Sách Lớp RM31.03 (Nhóm 5 &amp; Nhóm 6)
                </h3>
                <p className="text-[11px] text-blue-100 tabular-nums">
                  Khoa Răng Hàm Mặt HUBT · Mã HP Hóa TH: 191393024
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStudentModalOpen(false)}
                className="min-h-[38px] min-w-[38px] rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Toolbar */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="grid grid-cols-3 p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800">
                  {(
                    [
                      { key: 'all', label: 'Tất cả (27)' },
                      { key: 'nhom5', label: 'Nhóm 5 (14)' },
                      { key: 'nhom6', label: 'Nhóm 6 (13)' }
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setStudentModalTab(t.key)}
                      className={`min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer tabular-nums ${
                        studentModalTab === t.key
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 flex-1 sm:max-w-xs">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder="Tìm tên hoặc Mã SV..."
                      className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    {studentSearch && (
                      <button
                        type="button"
                        onClick={() => setStudentSearch('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={copyCurrentStudentList}
                    className="min-h-[34px] px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Student List: Compact Mobile Cards on phones (<640px), Table on larger screens */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
              {filteredStudents.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  Không tìm thấy sinh viên nào khớp với từ khóa.
                </div>
              ) : (
                <>
                  {/* Phone View: Zero horizontal scroll tap rows */}
                  <div className="sm:hidden space-y-2">
                    {filteredStudents.map((st) => {
                      const isSelected = myStudentId === st.id;
                      return (
                        <div
                          key={st.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-teal-50/90 dark:bg-teal-950/40 border-teal-400'
                              : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className="font-mono text-[11px] text-slate-400">
                                #{st.stt}
                              </span>
                              <span className="font-bold text-slate-900 dark:text-white truncate">
                                {st.lastName} {st.firstName}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                  st.group === 'nhom5'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200'
                                    : 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200'
                                }`}
                              >
                                {st.groupLabel}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                                MSV: {st.id}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  copyTextToClipboard(st.id);
                                  showToast(`Đã chép MSV: ${st.id}`, 'success');
                                }}
                                className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold"
                              >
                                Copy
                              </button>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {isSelected ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-bold">
                                <Check className="w-3.5 h-3.5" />
                                <span>Đang chọn</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => selectPersonalStudent(st.id)}
                                className="min-h-[36px] px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold cursor-pointer"
                              >
                                Chọn lịch
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop/Tablet View: Table */}
                  <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm tabular-nums">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-extrabold border-b border-slate-200 dark:border-slate-700">
                          <th className="py-2 px-3 text-center w-12">STT</th>
                          <th className="py-2 px-3">Mã SV</th>
                          <th className="py-2 px-3">Họ và đệm</th>
                          <th className="py-2 px-3">Tên</th>
                          <th className="py-2 px-3 text-center">Nhóm</th>
                          <th className="py-2 px-3 text-right">Cá nhân hóa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {filteredStudents.map((st) => {
                          const isSelected = myStudentId === st.id;
                          return (
                            <tr
                              key={st.id}
                              className={`${
                                isSelected
                                  ? 'bg-teal-50/90 dark:bg-teal-950/40'
                                  : 'hover:bg-blue-50/40 dark:hover:bg-slate-800/50'
                              }`}
                            >
                              <td className="py-2 px-3 text-center font-mono text-xs text-slate-500">
                                {st.stt}
                              </td>
                              <td className="py-2 px-3 font-mono text-xs font-bold">
                                <div className="flex items-center gap-1.5">
                                  <span>{st.id}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      copyTextToClipboard(st.id);
                                      showToast(`Đã sao chép Mã SV: ${st.id}`, 'success');
                                    }}
                                    className="text-slate-400 hover:text-blue-600 cursor-pointer"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                              <td className="py-2 px-3">{st.lastName}</td>
                              <td className="py-2 px-3 font-extrabold">{st.firstName}</td>
                              <td className="py-2 px-3 text-center font-bold text-xs">
                                <span
                                  className={
                                    st.group === 'nhom5'
                                      ? 'text-blue-700 dark:text-blue-400'
                                      : 'text-teal-700 dark:text-teal-400'
                                  }
                                >
                                  {st.groupLabel}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-right">
                                {isSelected ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-600 text-white text-xs font-bold">
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Đang chọn</span>
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => selectPersonalStudent(st.id)}
                                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-xs font-bold cursor-pointer"
                                  >
                                    Chọn làm lịch của tôi
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: COURSE NOTE EDITOR
         ===================================================================== */}
      {activeNoteItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 no-print">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl max-w-md w-full p-4 sm:p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                {renderSubjectIcon(activeNoteItem.colorTheme)}
                <span>{activeNoteItem.subject}</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveNoteItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 space-y-2.5">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 tabular-nums">
                {DAYS_INFO.find((d) => d.dayOfWeek === activeNoteItem.dayOfWeek)?.label} (Buổi{' '}
                {activeNoteItem.session}) · {activeNoteItem.room} · {activeNoteItem.groupBadge}
              </p>

              <textarea
                rows={3}
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="Nhập ghi chú (VD: Mang áo blouse trắng, giáo trình, lịch kiểm tra...)"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />

              <div className="flex flex-wrap gap-1.5">
                {QUICK_NOTE_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl}
                    type="button"
                    onClick={() =>
                      setNoteDraft((prev) => (prev.trim() ? `${prev.trim()}; ${tpl}` : tpl))
                    }
                    className="text-[11px] font-semibold px-2 py-1 rounded-lg border border-blue-200 dark:border-slate-700 bg-blue-50/70 dark:bg-slate-800 text-blue-800 dark:text-slate-300 cursor-pointer"
                  >
                    + {tpl}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-slate-200 dark:border-slate-800">
              {notes[activeNoteItem.id] && (
                <button
                  type="button"
                  onClick={deleteNote}
                  className="px-3 py-2 rounded-lg text-xs font-bold text-rose-600 mr-auto flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveNoteItem(null)}
                className="px-3.5 py-2 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={saveNote}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              >
                Lưu ghi chú
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 3: EXPORT CALENDAR (.ICS)
         ===================================================================== */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 no-print">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl max-w-md w-full p-4 sm:p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  Xuất Lịch Học (.ICS)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setExportModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3.5 space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <p>
                Tải file <strong>.ics</strong> để thêm tự động lịch học HK1 (12/10 – 19/12/2026) vào <strong>Lịch iPhone (Apple Calendar)</strong> hoặc <strong>Google Calendar</strong>.
              </p>

              <div className="p-3 rounded-xl bg-teal-50/70 dark:bg-slate-800 border border-teal-200 dark:border-slate-700 space-y-1.5">
                <label
                  htmlFor="ics-group-select"
                  className="block font-bold text-xs text-teal-950 dark:text-slate-200"
                >
                  Chọn nhóm muốn xuất lịch:
                </label>
                <select
                  id="ics-group-select"
                  value={icsGroupSelect}
                  onChange={(e) => setIcsGroupSelect(e.target.value as GroupFilter)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold text-xs text-slate-900 dark:text-slate-100"
                >
                  <option value="nhom5">Lịch Nhóm 5 (14 SV) - Lớp RM31.03</option>
                  <option value="nhom6">Lịch Nhóm 6 (13 SV) - Lớp RM31.03</option>
                  <option value="all">Toàn bộ Lớp RM31.03 (Gồm cả N5 &amp; N6)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setExportModalOpen(false)}
                className="px-3.5 py-2 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={downloadICSFile}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải file .ICS</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 4: CONCISE PHONE-OPTIMIZED TIMETABLE (TẢI TKB DẠNG BẢNG RÚT GỌN ĐT)
         ===================================================================== */}
      {phoneModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 no-print">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Modal Header */}
            <div className="px-4 py-3.5 bg-gradient-to-r from-blue-900 via-blue-800 to-teal-700 text-white flex items-center justify-between gap-3 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-amber-300" />
                  <h3 className="text-sm sm:text-base font-extrabold">
                    Bảng Thời Khóa Biểu Rút Gọn (Dành Cho Điện Thoại)
                  </h3>
                </div>
                <p className="text-[11px] text-blue-100 tabular-nums mt-0.5">
                  Lớp RM31.03 · Khoa Răng Hàm Mặt HUBT · Học Kỳ I (2026–2027)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPhoneModalOpen(false)}
                className="min-h-[38px] min-w-[38px] rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Toolbar: Group Selector + Download Actions */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
              {/* Group Tabs */}
              <div className="grid grid-cols-3 p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800 shrink-0">
                {(
                  [
                    { key: 'nhom5', label: 'Nhóm 5 (14 SV)' },
                    { key: 'nhom6', label: 'Nhóm 6 (13 SV)' },
                    { key: 'all', label: 'Cả lớp (Tổng hợp)' }
                  ] as const
                ).map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setPhoneModalGroup(t.key)}
                    className={`min-h-[34px] px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      phoneModalGroup === t.key
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => exportPhoneScheduleImage(phoneModalGroup)}
                  className="flex-1 sm:flex-none min-h-[36px] px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải Ảnh PNG (Lưu máy)</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="min-h-[36px] px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-600" />
                  <span>In A4</span>
                </button>
              </div>
            </div>

            {/* Modal Body: The concise table mimicking Image 1 with exact rooms */}
            <div className="p-3 sm:p-5 overflow-y-auto custom-scrollbar flex-1 space-y-3.5">
              {/* Institution / Class Banner */}
              <div className="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <div>
                  <div className="font-extrabold text-blue-950 dark:text-blue-100 uppercase tracking-wide">
                    LỚP: RM31.03 – KHÓA: 31 – NGÀNH: BÁC SĨ RĂNG HÀM MẶT
                  </div>
                  <div className="text-[11px] text-blue-800 dark:text-blue-300 font-semibold mt-0.5">
                    Học kỳ I (12/10 – 19/12/2026) ·{' '}
                    <span className="text-amber-800 dark:text-amber-300 font-bold">
                      {phoneModalGroup === 'all'
                        ? 'Tổng hợp cả lớp (27 SV)'
                        : phoneModalGroup === 'nhom5'
                        ? 'Thời khóa biểu Nhóm 5 (14 Sinh viên)'
                        : 'Thời khóa biểu Nhóm 6 (13 Sinh viên)'}
                    </span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  Mã HP TH Hóa: 191393024
                </div>
              </div>

              {/* Concise Table Container */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto w-full custom-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[540px]">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-black uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                        <th className="py-2.5 px-3 text-center w-14 border-r border-slate-200 dark:border-slate-700">
                          Thứ
                        </th>
                        <th className="py-2.5 px-3 text-center w-28 border-r border-slate-200 dark:border-slate-700">
                          Buổi
                        </th>
                        <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700">
                          Môn học
                        </th>
                        <th className="py-2.5 px-3 text-center w-24 border-r border-slate-200 dark:border-slate-700">
                          Phòng
                        </th>
                        <th className="py-2.5 px-3 text-center w-36">
                          Ngày áp dụng
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs tabular-nums">
                      {SCHEDULE_ITEMS.filter((it) => {
                        if (phoneModalGroup === 'all') return true;
                        return it.groups.includes(phoneModalGroup);
                      }).map((item, idx) => {
                        const isMorning = item.session === 'SÁNG';
                        const roomClean = item.room.replace('Phòng ', '');
                        const dayObj = DAYS_INFO.find((d) => d.dayOfWeek === item.dayOfWeek);

                        return (
                          <tr
                            key={item.id}
                            className={`hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors ${
                              idx % 2 === 0
                                ? 'bg-white dark:bg-slate-900'
                                : 'bg-slate-50/70 dark:bg-slate-800/30'
                            }`}
                          >
                            {/* Thứ */}
                            <td className="py-2.5 px-2 text-center font-black text-sm text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800">
                              <div>{item.dayOfWeek}</div>
                              <div className="text-[10px] text-slate-400 font-normal">
                                {dayObj?.shortLabel}
                              </div>
                            </td>

                            {/* Buổi */}
                            <td className="py-2.5 px-2 text-center border-r border-slate-200 dark:border-slate-800">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                  isMorning
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                                }`}
                              >
                                {item.session}
                              </span>
                              <div className="font-mono text-[9.5px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                                {isMorning ? '07:00 – 10:45' : '13:00 – 16:45'}
                              </div>
                            </td>

                            {/* Môn học */}
                            <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-800">
                              <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                                {item.subject}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <span>{item.periods}</span>
                                <span>·</span>
                                <span className="font-semibold text-teal-700 dark:text-teal-400">
                                  {item.groupBadge}
                                </span>
                              </div>
                            </td>

                            {/* Phòng */}
                            <td className="py-2.5 px-2 text-center border-r border-slate-200 dark:border-slate-800">
                              <span
                                className={`inline-block px-2 py-1 rounded-lg font-mono font-black text-xs shadow-2xs ${
                                  roomClean.startsWith('C606')
                                    ? 'bg-purple-100 text-purple-900 dark:bg-purple-900/60 dark:text-purple-200 border border-purple-300 dark:border-purple-700'
                                    : roomClean.startsWith('C402')
                                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
                                    : roomClean.startsWith('D112')
                                    ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/60 dark:text-blue-200 border border-blue-300 dark:border-blue-700'
                                    : roomClean.startsWith('C208')
                                    ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700'
                                    : 'bg-sky-100 text-sky-900 dark:bg-sky-900/60 dark:text-sky-200 border border-sky-300 dark:border-sky-700'
                                }`}
                              >
                                {roomClean}
                              </span>
                            </td>

                            {/* Ngày áp dụng */}
                            <td className="py-2.5 px-3 text-center text-slate-700 dark:text-slate-300">
                              <div className="font-bold">
                                {item.startDate === '2026-10-12' ? 'Từ 12/10/2026' : 'Từ 26/10/2026'}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {item.totalWeeks ? `(${item.totalWeeks} tuần thực học)` : '(Học cả kỳ)'}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Important Notices Box matching user instructions */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs space-y-1 text-amber-950 dark:text-amber-200">
                <div className="font-extrabold flex items-center gap-1.5 text-amber-900 dark:text-amber-300">
                  <span>📌 LƯU Ý PHÂN PHÒNG HỌC &amp; THỰC HÀNH LỚP RM31.03:</span>
                </div>
                <div className="text-[11px] leading-relaxed">
                  • <strong>Thực hành Hóa học (P. C606):</strong> Nhóm 5 học Chiều Thứ 4 (13:00 - 16:45) | Nhóm 6 học Sáng Thứ 5 (07:00 - 10:45) (Đã điều chỉnh lịch Nhóm 6 sang Thứ 5).
                </div>
                <div className="text-[11px] leading-relaxed">
                  • <strong>Thực hành Giải phẫu (P. C402):</strong> Nhóm 5 học Sáng Thứ 5 | Nhóm 6 học Chiều Thứ 4 (6 tuần từ 26/10 đến 05/12/2026).
                </div>
                <div className="text-[11px] leading-relaxed">
                  • <strong>Danh mục phòng lý thuyết:</strong> LT Giải phẫu (P. D112), Thuật ngữ A-V RHM (P. D210 &amp; D206), Tiếng Anh 1 HAT (P. C222), Tin học 1 TINT (P. D314), LT Hóa học (P. C208).
                </div>
                <div className="text-[11px] leading-relaxed text-rose-700 dark:text-amber-300 font-semibold">
                  • <strong>Lưu ý môn TNRHM:</strong> 2 buổi Sáng Thứ 4 &amp; Chiều Thứ 6 giữ theo lịch trường, dự kiến chuyển sang học Sáng &amp; Chiều Chủ Nhật (theo lịch giảng viên).
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Nhấn "Tải Ảnh PNG" để lưu ảnh TKB về máy xem offline bất cứ lúc nào.
              </span>
              <button
                type="button"
                onClick={() => setPhoneModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-100 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
