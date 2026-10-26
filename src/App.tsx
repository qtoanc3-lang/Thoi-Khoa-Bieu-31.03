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
  Laptop,
  Languages,
  LayoutGrid,
  MapPin,
  Moon,
  Printer,
  Search,
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
    label: 'HAT - Ngoại ngữ (A00)'
  },
  cyan: {
    surface: 'bg-cyan-50/95 dark:bg-cyan-950/45',
    border: 'border-cyan-300 dark:border-cyan-800',
    hoverBorder: 'hover:border-cyan-500 dark:hover:border-cyan-500',
    title: 'text-cyan-950 dark:text-cyan-100',
    roomChip: 'bg-cyan-600 text-white',
    groupText: 'text-cyan-900 dark:text-cyan-300',
    dotColor: 'bg-cyan-600',
    label: 'TINT - Tin học (A00)'
  }
};

function renderSubjectIcon(colorTheme: ScheduleItem['colorTheme']) {
  switch (colorTheme) {
    case 'blue':
      return <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />;
    case 'amber':
      return <Stethoscope className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />;
    case 'purple':
    case 'emerald':
      return <FlaskConical className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />;
    case 'rose':
      return <Languages className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />;
    case 'cyan':
      return <Laptop className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />;
    default:
      return <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />;
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

  const [viewMode, setViewMode] = useState<'table' | 'card'>(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768 ? 'card' : 'table';
  });

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
    }, 2800);
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
    showToast('Đã sao chép lịch học vào bộ nhớ tạm!', 'success');
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
    showToast(`Đã cài đặt lịch cá nhân của ${st.lastName} ${st.firstName} (${st.groupLabel})!`, 'success');
  };

  const clearPersonalStudent = () => {
    setMyStudentIdState(null);
    localStorage.removeItem('rm3103_my_student');
    showToast('Đã tắt chế độ cá nhân hóa sinh viên.', 'info');
  };

  const copyCurrentStudentList = () => {
    if (filteredStudents.length === 0) {
      showToast('Không có sinh viên nào trong danh sách để sao chép.', 'info');
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
    showToast(`Đã sao chép danh sách ${filteredStudents.length} sinh viên!`, 'success');
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
      showToast('Đã lưu ghi chú môn học!', 'success');
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
    showToast('Đã xóa ghi chú môn học.', 'info');
  };

  const clearAllNotes = () => {
    setNotes({});
    localStorage.removeItem('rm3103_notes');
    showToast('Đã xóa toàn bộ ghi chú cá nhân.', 'info');
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
      'PRODID:-//HUBT Khoa Y//Lich Hoc RM31.03//VI',
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

      const startTimeStr = item.session === 'SÁNG' ? '073000' : '130000';
      const endTimeStr = item.session === 'SÁNG' ? '113000' : '170000';

      while (cursor <= endObj) {
        const y = cursor.getFullYear();
        const m = String(cursor.getMonth() + 1).padStart(2, '0');
        const d = String(cursor.getDate()).padStart(2, '0');
        const datePart = `${y}${m}${d}`;

        const summary = `[${item.shortCode}] ${item.subject} - ${item.room} (${item.groupBadge})`;
        const noteText = notes[item.id] ? ` | Ghi chú: ${notes[item.id]}` : '';
        const desc = `Lớp RM31.03 - Khoa Y HUBT | Thời lượng: ${item.periods} | ${item.durationText}${noteText}`;

        icsLines.push(
          'BEGIN:VEVENT',
          `UID:${item.id}-${datePart}@rm3103.hubt.edu.vn`,
          `DTSTAMP:${datePart}T000000Z`,
          `DTSTART;TZID=Asia/Ho_Chi_Minh:${datePart}T${startTimeStr}`,
          `DTEND;TZID=Asia/Ho_Chi_Minh:${datePart}T${endTimeStr}`,
          `SUMMARY:${summary}`,
          `LOCATION:${item.room} - Khoa Y HUBT`,
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
    showToast('Đã tải file lịch .ICS thành công!', 'success');
  };

  // Render a single course card inside the timetable grid or mobile agenda card
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
        className={`group rounded-xl p-3 border ${accent.surface} ${accent.border} ${accent.hoverBorder} ${inactiveStyle} hover:shadow-sm transition-all cursor-pointer text-left`}
      >
        {/* Top Row: Clickable Group Roster Link + Highlighted Room Tag */}
        <div className="flex items-center justify-between gap-2 text-xs mb-2">
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
              <Users className="w-3.5 h-3.5 opacity-80" />
              <span>{item.groupBadge}</span>
            </button>
          ) : (
            <span className={`font-bold ${accent.groupText} whitespace-nowrap shrink-0`}>
              {item.groupBadge}
            </span>
          )}
          <span
            className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded-md shadow-2xs tabular-nums whitespace-nowrap shrink-0 ${accent.roomChip}`}
          >
            {item.room}
          </span>
        </div>

        {/* Course Subject Title */}
        <div className={`font-extrabold text-sm ${accent.title} ${strikeStyle} flex items-center gap-1.5`}>
          {renderSubjectIcon(item.colorTheme)}
          <span>{item.subject}</span>
        </div>

        {/* Metadata line */}
        <div className="mt-2 text-[11px] text-slate-700 dark:text-slate-300 tabular-nums space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 opacity-70 shrink-0" />
            <span>{item.periods}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 opacity-70 shrink-0" />
            <span>{item.durationText}</span>
          </div>
        </div>

        {/* Week-specific status line */}
        {statusInfo && (
          <div
            className={`mt-2 pt-1.5 border-t border-black/10 dark:border-white/10 text-[11px] font-bold tabular-nums ${statusInfo.textClass}`}
          >
            {statusInfo.label}
          </div>
        )}

        {/* User note if present */}
        {userNote ? (
          <div className="mt-2 p-2 rounded-lg bg-yellow-100/95 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-700 text-[11px] text-yellow-950 dark:text-yellow-100 font-semibold break-words">
            📌 {userNote}
          </div>
        ) : (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 no-print">
            + Nhấn để ghi chú
          </div>
        )}
      </div>
    );
  };

  const tableDays = DAYS_INFO.slice(0, 6); // Thứ Hai -> Thứ Bảy
  const noteKeys = Object.keys(notes);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Toast Notification Stack */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none no-print">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto px-4 py-2.5 rounded-xl shadow-lg border text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
              t.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-blue-900 dark:bg-slate-800 text-white border-blue-700'
            }`}
          >
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* TOP BAR CONTRACT: Strictly 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-2xs no-print">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            className="text-base sm:text-lg font-extrabold tracking-tight text-blue-900 dark:text-teal-300 whitespace-nowrap shrink-0"
          >
            RM31.03 · Khoa Y HUBT
          </a>

          {/* Zone 2: 4–5 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-300">
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
              className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-700 to-teal-600 hover:from-blue-800 hover:to-teal-700 rounded-lg shadow-xs transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              Xuất Lịch .ICS
            </button>
          </div>
        </div>
      </header>

      {/* MAIN WORKSPACE CONTAINER */}
      <main id="top" className="flex-grow max-w-[1360px] w-full mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* COLORFUL MEDICAL HERO BANNER & UTILITY BAR */}
        <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-teal-700 dark:from-slate-900 dark:via-blue-950 dark:to-teal-950 text-white rounded-2xl shadow-md border border-blue-700/40 p-5 sm:p-6 no-print">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-teal-200 tabular-nums">
                <span>Khoa Y / Răng Hàm Mặt · Đại học Kinh doanh và Công nghệ Hà Nội</span>
                <span className="mx-2" aria-hidden="true">·</span>
                <span>Học kỳ I (2026–2027)</span>
                <span className="mx-2" aria-hidden="true">·</span>
                <span className="text-amber-300 font-bold">{liveDateLabel}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Thời Khóa Biểu Lớp RM31.03
              </h1>
              <p className="text-sm text-blue-100">
                Ngành Răng – Hàm – Mặt (Khóa 31) · Phân nhóm thực hành:{' '}
                <button
                  type="button"
                  onClick={() => openStudentModal('nhom5')}
                  className="font-bold text-amber-300 underline decoration-amber-300/70 underline-offset-4 hover:text-white cursor-pointer"
                >
                  Nhóm 5 (14 SV)
                </button>{' '}
                &amp;{' '}
                <button
                  type="button"
                  onClick={() => openStudentModal('nhom6')}
                  className="font-bold text-teal-200 underline decoration-teal-200/70 underline-offset-4 hover:text-white cursor-pointer"
                >
                  Nhóm 6 (13 SV)
                </button>
              </p>
            </div>

            {/* Secondary Workspace Utility Controls */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => openStudentModal('all')}
                className="px-3.5 py-2 rounded-xl bg-teal-500/30 hover:bg-teal-500/45 border border-teal-300/40 text-xs sm:text-sm font-bold text-white flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Users className="w-4 h-4 text-teal-200" />
                <span>Danh sách 27 SV</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch('./assets/aistudio/Paste_October_26__2026_-_12_23PM_1512a169');
                    if (res.ok) {
                      const htmlText = await res.text();
                      const blob = new Blob([htmlText], { type: 'text/html;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'index.html';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      showToast('Đã tải file index.html độc lập cho GitHub Pages!', 'success');
                      return;
                    }
                  } catch {
                    // fallback
                  }
                  showToast('Repo đã tích hợp sẵn bộ chạy trực tiếp cho GitHub Pages!', 'info');
                }}
                title="Tải file index.html độc lập để tải trực tiếp lên GitHub Pages"
                className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-xs sm:text-sm font-semibold text-white flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>Tải index.html (GitHub)</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-xs sm:text-sm font-semibold text-white flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-blue-200" />
                <span>In chuẩn A4</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDark((prev) => !prev)}
                aria-label="Đổi giao diện Sáng / Tối"
                className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-xs sm:text-sm font-semibold text-white flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {isDark ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-300" />
                    <span>Sáng</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-blue-100" />
                    <span>Tối</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* PERSONALIZED STUDENT BAR (Shown when student selects their profile) */}
          {myStudent && (
            <div className="mt-4 pt-4 border-t border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400/25 border border-amber-300/40 flex items-center justify-center text-amber-200 shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm text-white tabular-nums">
                    <span className="font-medium text-teal-200">Chế độ cá nhân: </span>
                    <strong className="font-extrabold text-amber-300">
                      {myStudent.lastName} {myStudent.firstName}
                    </strong>
                    <span className="mx-1.5" aria-hidden="true">·</span>
                    <span className="font-mono text-xs text-blue-100">MSV {myStudent.id}</span>
                    <span className="mx-1.5" aria-hidden="true">·</span>
                    <span className="font-bold text-teal-200">{myStudent.groupLabel}</span>
                  </div>
                  <p className="text-xs text-blue-100 mt-0.5">
                    {myStudent.group === 'nhom5'
                      ? 'Lịch thực hành của bạn: TH Hóa học Chiều Thứ Tư (P. C606) · TH Giải phẫu Sáng Thứ Năm (P. C402)'
                      : 'Lịch thực hành của bạn: TH Hóa học Chiều Thứ Ba (P. C606) · TH Giải phẫu Chiều Thứ Tư (P. C402)'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => openStudentModal('all')}
                  className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-semibold text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Đổi sinh viên
                </button>
                <button
                  type="button"
                  onClick={clearPersonalStudent}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-500/30 hover:bg-rose-500/50 border border-rose-300/30 text-xs font-semibold text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Thoát
                </button>
              </div>
            </div>
          )}
        </section>

        {/* 1. TODAY & TOMORROW SCHEDULE LOOKUP WIDGET */}
        <section
          id="hom-nay"
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 p-5 sm:p-6 no-print"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                Lịch Học Nhanh: Hôm Nay &amp; Ngày Mai
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Đang hiển thị lịch của:{' '}
                <strong className="font-bold text-blue-700 dark:text-teal-400">
                  {groupFilter === 'all'
                    ? 'Cả lớp RM31.03 (27 SV)'
                    : groupFilter === 'nhom5'
                    ? 'Nhóm 5 (14 SV)'
                    : 'Nhóm 6 (13 SV)'}
                </strong>
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 tabular-nums">
              <label htmlFor="custom-date-picker" className="font-semibold whitespace-nowrap shrink-0">
                Chọn ngày:
              </label>
              <input
                id="custom-date-picker"
                type="date"
                value={referenceDateStr}
                onChange={(e) => setReferenceDateStr(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="button"
                onClick={() => {
                  setReferenceDateStr(todayISO);
                  showToast('Đã đặt lại ngày tra cứu về hôm nay.', 'info');
                }}
                className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 font-bold text-blue-700 dark:text-blue-300 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Hôm nay
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Hôm nay - Tông Xanh Dương nổi bật */}
            <div className="rounded-xl bg-gradient-to-br from-blue-50/90 via-blue-50/50 to-indigo-50/60 dark:from-blue-950/30 dark:to-slate-900 p-4 border border-blue-200 dark:border-blue-800/70">
              <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-blue-200/70 dark:border-blue-800/60">
                <div className="flex items-center gap-2 tabular-nums">
                  <span className="px-2.5 py-1 rounded-md bg-blue-600 text-white text-xs font-extrabold uppercase tracking-wider">
                    Hôm nay
                  </span>
                  <span className="text-sm font-extrabold text-blue-950 dark:text-blue-100">
                    {todaySummary.dayInfo.label}, {formatDDMMYYYY(todaySummary.dateISO)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyDaySchedule('today')}
                  className="text-xs font-bold text-blue-700 dark:text-blue-300 hover:underline flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép</span>
                </button>
              </div>

              {todaySummary.items.length === 0 ? (
                <div className="py-5 px-3 rounded-lg bg-white/80 dark:bg-slate-900/70 text-center text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                  🎉 Nghỉ cả ngày — Không có lịch học cố định.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {todaySummary.items.map((item) => {
                    const st = evaluateItemStatusOnDate(item, todaySummary.dateISO);
                    const accent = THEME_ACCENTS[item.colorTheme];
                    return (
                      <div
                        key={item.id}
                        onClick={() => openNoteModalForItem(item)}
                        className={`p-3 rounded-xl bg-white dark:bg-slate-900 border ${accent.border} hover:shadow-xs transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2`}
                      >
                        <div>
                          <div className="text-xs font-bold tabular-nums flex flex-wrap items-center gap-1.5">
                            <span
                              className={
                                item.session === 'SÁNG'
                                  ? 'text-amber-700 dark:text-amber-400'
                                  : 'text-blue-700 dark:text-blue-400'
                              }
                            >
                              Buổi {item.session}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className={accent.groupText}>{item.groupBadge}</span>
                            <span aria-hidden="true">·</span>
                            <span className={`font-mono px-1.5 py-0.5 rounded text-[11px] ${accent.roomChip}`}>
                              {item.room}
                            </span>
                          </div>
                          <div className={`font-extrabold text-sm mt-1 ${accent.title}`}>
                            {item.subject}
                          </div>
                        </div>
                        <div className={`text-xs font-bold tabular-nums shrink-0 ${st.textClass}`}>
                          {st.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Ngày mai - Tông Xanh Ngọc (Teal/Emerald) tươi mát */}
            <div className="rounded-xl bg-gradient-to-br from-teal-50/90 via-teal-50/50 to-emerald-50/60 dark:from-teal-950/30 dark:to-slate-900 p-4 border border-teal-200 dark:border-teal-800/70">
              <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-teal-200/70 dark:border-teal-800/60">
                <div className="flex items-center gap-2 tabular-nums">
                  <span className="px-2.5 py-1 rounded-md bg-teal-600 text-white text-xs font-extrabold uppercase tracking-wider">
                    Ngày mai
                  </span>
                  <span className="text-sm font-extrabold text-teal-950 dark:text-teal-100">
                    {tomorrowSummary.dayInfo.label}, {formatDDMMYYYY(tomorrowSummary.dateISO)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyDaySchedule('tomorrow')}
                  className="text-xs font-bold text-teal-700 dark:text-teal-300 hover:underline flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép</span>
                </button>
              </div>

              {tomorrowSummary.items.length === 0 ? (
                <div className="py-5 px-3 rounded-lg bg-white/80 dark:bg-slate-900/70 text-center text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                  🎉 Nghỉ cả ngày — Không có lịch học cố định.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {tomorrowSummary.items.map((item) => {
                    const st = evaluateItemStatusOnDate(item, tomorrowSummary.dateISO);
                    const accent = THEME_ACCENTS[item.colorTheme];
                    return (
                      <div
                        key={item.id}
                        onClick={() => openNoteModalForItem(item)}
                        className={`p-3 rounded-xl bg-white dark:bg-slate-900 border ${accent.border} hover:shadow-xs transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2`}
                      >
                        <div>
                          <div className="text-xs font-bold tabular-nums flex flex-wrap items-center gap-1.5">
                            <span
                              className={
                                item.session === 'SÁNG'
                                  ? 'text-amber-700 dark:text-amber-400'
                                  : 'text-blue-700 dark:text-blue-400'
                              }
                            >
                              Buổi {item.session}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className={accent.groupText}>{item.groupBadge}</span>
                            <span aria-hidden="true">·</span>
                            <span className={`font-mono px-1.5 py-0.5 rounded text-[11px] ${accent.roomChip}`}>
                              {item.room}
                            </span>
                          </div>
                          <div className={`font-extrabold text-sm mt-1 ${accent.title}`}>
                            {item.subject}
                          </div>
                        </div>
                        <div className={`text-xs font-bold tabular-nums shrink-0 ${st.textClass}`}>
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

        {/* 2. FILTER CONTROLS BAR (GROUP, WEEK, VIEW MODE & COLOR LEGEND) */}
        <section
          id="bang-lich"
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 p-5 sm:p-6 no-print space-y-4"
        >
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            {/* Group Segmented Control */}
            <div>
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  1. Chọn Nhóm Sinh Viên
                </span>
                <button
                  type="button"
                  onClick={() => openStudentModal(groupFilter)}
                  className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Tìm tên / Xem DS nhóm
                </button>
              </div>
              <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
                {(
                  [
                    { key: 'all', label: 'Cả lớp (27)', activeClass: 'bg-blue-600 text-white shadow-xs' },
                    { key: 'nhom5', label: 'Nhóm 5 (14 SV)', activeClass: 'bg-indigo-600 text-white shadow-xs' },
                    { key: 'nhom6', label: 'Nhóm 6 (13 SV)', activeClass: 'bg-teal-600 text-white shadow-xs' }
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setGroupFilter(tab.key)}
                    className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
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

            {/* Week Selector */}
            <div className="flex-1 lg:max-w-md">
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="week-selector"
                  className="text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  2. Chọn Tuần Học (Kiểm tra môn bắt đầu / kết thúc)
                </label>
                <button
                  type="button"
                  onClick={jumpToCurrentWeek}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Về tuần hiện tại
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => stepWeek(-1)}
                  title="Tuần trước"
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shrink-0 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <select
                  id="week-selector"
                  value={weekFilter}
                  onChange={(e) => setWeekFilter(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shrink-0 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                3. Giao Diện Hiển Thị
              </div>
              <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <TableIcon className="w-4 h-4" />
                  <span>Dạng Bảng</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('card')}
                  className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                    viewMode === 'card'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span>Dạng Thẻ (Mobile)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Color Legend Bar for fast visual recognition */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            <span className="font-bold text-slate-500 dark:text-slate-400">Bảng màu môn học:</span>
            {(
              ['blue', 'amber', 'purple', 'emerald', 'indigo', 'rose', 'cyan'] as const
            ).map((key) => {
              const item = THEME_ACCENTS[key];
              return (
                <div key={key} className="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                  <span className={`w-3 h-3 rounded-sm ${item.dotColor}`} />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>

          {/* Week status summary & Hide inactive checkbox */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="text-slate-700 dark:text-slate-300 tabular-nums">
              <strong className="font-extrabold text-blue-800 dark:text-teal-300">
                {currentWeekObj.shortTitle} ({currentWeekObj.rangeText}):
              </strong>{' '}
              <span>{currentWeekObj.noteSummary}</span>
            </div>

            <label className="inline-flex items-center gap-2 cursor-pointer select-none shrink-0">
              <input
                type="checkbox"
                checked={hideInactive}
                onChange={(e) => setHideInactive(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span className="text-slate-700 dark:text-slate-300 font-semibold">
                Ẩn môn chưa bắt đầu / đã kết thúc trong tuần đang chọn
              </span>
            </label>
          </div>
        </section>

        {/* PRINT-ONLY HEADER FOR A4 LANDSCAPE */}
        <div className="hidden print-only mb-4 text-center border-b border-slate-400 pb-3">
          <h1 className="text-xl font-bold uppercase">
            TRƯỜNG ĐẠI HỌC KINH DOANH VÀ CÔNG NGHỆ HÀ NỘI - KHOA Y
          </h1>
          <h2 className="text-lg font-bold mt-1">
            THỜI KHÓA BIỂU LỚP RM31.03 (HỌC KỲ I NĂM HỌC 2026 - 2027)
          </h2>
          <p className="text-sm mt-1 tabular-nums">
            Đối tượng:{' '}
            {groupFilter === 'all'
              ? 'Cả lớp RM31.03 (27 SV)'
              : groupFilter === 'nhom5'
              ? 'Nhóm 5 (14 SV) - RM31.03'
              : 'Nhóm 6 (13 SV) - RM31.03'}{' '}
            | {currentWeekObj.name}
          </p>
        </div>

        {/* 3A. TIMETABLE GRID VIEW (TABLE VIEW) */}
        <section
          id="table-view-container"
          className={`${
            viewMode === 'table' ? 'block' : 'hidden'
          } bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden`}
        >
          <div className="custom-scrollbar overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[960px]">
              <thead>
                <tr className="bg-gradient-to-r from-slate-100 via-blue-50/60 to-teal-50/60 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 text-slate-800 dark:text-slate-100 text-xs font-extrabold border-b border-slate-200 dark:border-slate-700">
                  <th className="p-3.5 border-r border-slate-200 dark:border-slate-700 w-24 text-center uppercase tracking-wider">
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
                        className={`p-3.5 border-r last:border-r-0 border-slate-200 dark:border-slate-700 text-center w-[15%] ${
                          isTodayCol
                            ? 'bg-blue-600/15 dark:bg-blue-500/25 text-blue-900 dark:text-blue-200 border-t-4 border-t-blue-600'
                            : ''
                        }`}
                      >
                        <div className="flex flex-col items-center tabular-nums">
                          <span className="text-sm font-extrabold">
                            {d.label}
                          </span>
                          {colDateObj && (
                            <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                              {formatDDMM(colDateObj)}/2026
                            </span>
                          )}
                          {isTodayCol && (
                            <span className="mt-1 px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
                              Hôm nay
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                {(['SÁNG', 'CHIỀU'] as const).map((sessionKey) => (
                  <tr
                    key={sessionKey}
                    className="divide-x divide-slate-200 dark:divide-slate-800"
                  >
                    <td
                      className={`p-3 text-center align-middle font-extrabold text-xs tracking-wider ${
                        sessionKey === 'SÁNG'
                          ? 'bg-amber-50/70 dark:bg-amber-950/25 text-amber-900 dark:text-amber-300'
                          : 'bg-blue-50/70 dark:bg-blue-950/25 text-blue-900 dark:text-blue-300'
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        {sessionKey === 'SÁNG' ? (
                          <Sun className="w-5 h-5 text-amber-500" />
                        ) : (
                          <Sunset className="w-5 h-5 text-blue-500" />
                        )}
                        <span>{sessionKey}</span>
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
                          className={`p-2.5 align-top ${
                            isTodayCol ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                          }`}
                        >
                          {renderedCards.length > 0 ? (
                            <div className="space-y-2.5">{renderedCards}</div>
                          ) : (
                            <div className="h-full min-h-[84px] flex items-center justify-center text-xs text-slate-400 dark:text-slate-600 italic select-none">
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
        </section>

        {/* 3B. MOBILE / AGENDA CARD VIEW */}
        <section
          id="card-view-container"
          className={`${
            viewMode === 'card' ? 'grid' : 'hidden'
          } grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 no-print`}
        >
          {DAYS_INFO.map((d) => {
            const colDateObj = getDateForDayInSelectedWeek(d.offsetFromMonday);
            const colDateISO = colDateObj ? formatDateISO(colDateObj) : null;
            const isTodayCard =
              (weekFilter === 'all' && d.dayOfWeek === todayVNDay) || colDateISO === todayISO;

            if (d.dayOfWeek === 8) {
              return (
                <div
                  key={d.dayOfWeek}
                  className={`rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-900 border ${
                    isTodayCard
                      ? 'border-teal-600 dark:border-teal-500'
                      : 'border-emerald-200 dark:border-slate-800'
                  } p-4 flex items-center justify-between`}
                >
                  <div>
                    <h4 className="font-extrabold text-sm text-emerald-950 dark:text-white tabular-nums">
                      {d.label} {colDateObj ? `(${formatDDMM(colDateObj)}/2026)` : ''}
                    </h4>
                    <p className="text-xs text-emerald-700 dark:text-slate-400 mt-0.5 font-medium">
                      Nghỉ cả ngày · Cuối tuần
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-mono font-bold">
                    CN
                  </span>
                </div>
              );
            }

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

            return (
              <div
                key={d.dayOfWeek}
                className={`rounded-2xl bg-white dark:bg-slate-900 border ${
                  isTodayCard
                    ? 'border-blue-600 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800'
                } overflow-hidden shadow-xs flex flex-col`}
              >
                <div
                  className={`px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between tabular-nums ${
                    isTodayCard
                      ? 'bg-gradient-to-r from-blue-700 to-teal-600 text-white'
                      : 'bg-gradient-to-r from-slate-100 to-blue-50/60 dark:from-slate-800 dark:to-slate-800 text-slate-900 dark:text-white'
                  }`}
                >
                  <span className="font-extrabold text-sm">
                    {d.label} {colDateObj ? `(${formatDDMM(colDateObj)}/2026)` : ''}
                  </span>
                  {isTodayCard && (
                    <span className="px-2 py-0.5 rounded bg-white text-blue-700 text-[10px] font-extrabold uppercase">
                      Hôm nay
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-4 flex-1">
                  <div>
                    <div className="text-xs font-extrabold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5" />
                      <span>Buổi Sáng</span>
                    </div>
                    {morningCards.length > 0 ? (
                      <div className="space-y-2">{morningCards}</div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-400 text-center italic">
                        Nghỉ buổi sáng
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-xs font-extrabold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-1.5">
                      <Sunset className="w-3.5 h-3.5" />
                      <span>Buổi Chiều</span>
                    </div>
                    {afternoonCards.length > 0 ? (
                      <div className="space-y-2">{afternoonCards}</div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-400 text-center italic">
                        Nghỉ buổi chiều
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* 4. COURSE REGULATIONS, GROUP ROSTER SUMMARY & PERSONAL NOTES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Course Implementation Details with matching color-coded cards */}
          <section
            id="quy-dinh"
            className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  Quy Định &amp; Thời Gian Triển Khai Học Phần
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                  Dữ liệu chuẩn theo lịch Khoa Y &amp; Sổ điểm danh Thực hành Hóa học (Mã HP: 191393024)
                </p>
              </div>
              <button
                type="button"
                onClick={() => openStudentModal('all')}
                className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 text-xs font-bold text-teal-800 dark:text-teal-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer no-print"
              >
                Xem danh sách 27 SV
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm tabular-nums">
              {/* LT Giải phẫu - Blue */}
              <div className="p-4 rounded-xl bg-blue-50/80 dark:bg-blue-950/35 border border-blue-200 dark:border-blue-800/70 space-y-1.5">
                <div className="flex items-center justify-between font-extrabold text-blue-950 dark:text-blue-200">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>Lý thuyết Giải phẫu</span>
                  </span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-600 text-white">
                    4 tiết/buổi
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-xs">
                  • Thời gian: <strong>8 tuần</strong> (12/10/2026 – 05/12/2026)
                </p>
                <p className="text-slate-700 dark:text-slate-300 text-xs">
                  • Lịch học: <strong>Chiều Thứ Hai</strong> (Học chung Nhóm 5, 6, 7, 8)
                </p>
              </div>

              {/* TH Giải phẫu - Amber */}
              <div className="p-4 rounded-xl bg-amber-50/85 dark:bg-amber-950/35 border border-amber-200 dark:border-amber-800/70 space-y-1.5">
                <div className="flex items-center justify-between font-extrabold text-amber-950 dark:text-amber-200">
                  <span className="flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-amber-600" />
                    <span>Thực hành Giải phẫu (TH GP)</span>
                  </span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-600 text-white">
                    5 tiết/buổi
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-xs">
                  • Thời gian: <strong>6 tuần</strong> (26/10/2026 – 05/12/2026) tại <strong>P. C402</strong>
                </p>
                <p className="text-slate-700 dark:text-slate-300 text-xs">
                  •{' '}
                  <button
                    type="button"
                    onClick={() => openStudentModal('nhom5')}
                    className="underline font-bold text-amber-900 dark:text-amber-300 hover:text-blue-700 cursor-pointer"
                  >
                    Nhóm 5 (14 SV):
                  </button>{' '}
                  Sáng T5 |{' '}
                  <button
                    type="button"
                    onClick={() => openStudentModal('nhom6')}
                    className="underline font-bold text-amber-900 dark:text-amber-300 hover:text-blue-700 cursor-pointer"
                  >
                    Nhóm 6 (13 SV):
                  </button>{' '}
                  Chiều T4
                </p>
              </div>

              {/* LT Hóa học - Emerald */}
              <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/35 border border-emerald-200 dark:border-emerald-800/70 space-y-1.5">
                <div className="flex items-center justify-between font-extrabold text-emerald-950 dark:text-emerald-200">
                  <span className="flex items-center gap-1.5">
                    <FlaskConical className="w-4 h-4 text-emerald-600" />
                    <span>Lý thuyết Hóa học</span>
                  </span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-600 text-white">
                    4 tiết/buổi
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-xs">
                  • Thời gian: <strong>8 tuần</strong> (12/10/2026 – 05/12/2026)
                </p>
                <p className="text-slate-700 dark:text-slate-300 text-xs">
                  • Lịch học: <strong>Chiều Thứ Bảy</strong> (Học chung Nhóm 5, 6, 7, 8)
                </p>
              </div>

              {/* TH Hóa học - Purple */}
              <div className="p-4 rounded-xl bg-purple-50/80 dark:bg-purple-950/35 border border-purple-200 dark:border-purple-800/70 space-y-1.5">
                <div className="flex items-center justify-between font-extrabold text-purple-950 dark:text-purple-200">
                  <span className="flex items-center gap-1.5">
                    <FlaskConical className="w-4 h-4 text-purple-600" />
                    <span>Thực hành Hóa học (TH HH)</span>
                  </span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-purple-600 text-white">
                    4 tiết/buổi
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-xs">
                  • Thời gian: <strong>8 tuần</strong> (26/10/2026 – 19/12/2026) tại <strong>P. C606</strong>
                </p>
                <p className="text-slate-700 dark:text-slate-300 text-xs">
                  •{' '}
                  <button
                    type="button"
                    onClick={() => openStudentModal('nhom5')}
                    className="underline font-bold text-purple-900 dark:text-purple-300 hover:text-blue-700 cursor-pointer"
                  >
                    Nhóm 5 (14 SV):
                  </button>{' '}
                  Chiều T4 |{' '}
                  <button
                    type="button"
                    onClick={() => openStudentModal('nhom6')}
                    className="underline font-bold text-purple-900 dark:text-purple-300 hover:text-blue-700 cursor-pointer"
                  >
                    Nhóm 6 (13 SV):
                  </button>{' '}
                  Chiều T3
                </p>
              </div>

              {/* Group Roster Split Summary */}
              <div className="sm:col-span-2 p-4 rounded-xl bg-gradient-to-r from-teal-50/90 via-blue-50/70 to-indigo-50/80 dark:from-slate-800/70 dark:to-slate-800/50 border border-teal-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-extrabold text-slate-900 dark:text-white">
                    Phân chia danh sách nhóm Lớp RM31.03 (Tổng 27 sinh viên):
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    <strong className="text-blue-800 dark:text-blue-300">Nhóm 5 (14 SV):</strong> Lê Phan An → Trương Hoàng Hiệp
                    <span className="mx-2" aria-hidden="true">|</span>
                    <strong className="text-teal-800 dark:text-teal-300">Nhóm 6 (13 SV):</strong> Lê Văn Hòe → Phạm Đường Vũ
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 no-print">
                  <button
                    type="button"
                    onClick={() => openStudentModal('nhom5')}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    DS Nhóm 5
                  </button>
                  <button
                    type="button"
                    onClick={() => openStudentModal('nhom6')}
                    className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    DS Nhóm 6
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Personal Notes Panel */}
          <section
            id="ghi-chu"
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 p-5 sm:p-6 flex flex-col justify-between no-print"
          >
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                    Sổ Tay Ghi Chú
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Nhấn vào bất kỳ môn học nào trên bảng để ghi chú
                  </p>
                </div>
                {noteKeys.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllNotes}
                    className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                {noteKeys.length === 0 ? (
                  <div className="p-5 rounded-xl bg-amber-50/50 dark:bg-slate-800/40 border border-dashed border-amber-300 dark:border-slate-700 text-center text-xs text-slate-600 dark:text-slate-400 space-y-2">
                    <FileText className="w-5 h-5 mx-auto text-amber-500" />
                    <p>
                      Chưa có ghi chú nào. Nhấn vào ô môn học bất kỳ để lưu lời nhắc (mang áo blouse trắng, lịch kiểm tra, tài liệu).
                    </p>
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
                        className={`p-3 rounded-xl ${accent.surface} border ${accent.border} cursor-pointer hover:shadow-xs transition-all text-xs`}
                      >
                        <div className={`flex items-center justify-between font-extrabold ${accent.title}`}>
                          <span>
                            {item.subject} ({item.groupBadge})
                          </span>
                          <span className="font-mono text-[11px]">
                            {dayInfo?.shortLabel} · {item.session}
                          </span>
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 font-medium mt-1 break-words">
                          📌 {notes[itemId]}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              Ghi chú và cài đặt sinh viên được lưu trực tiếp trên trình duyệt của bạn.
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 py-6 text-xs mt-8 no-print">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-semibold text-white">
            Lớp RM31.03 · Khoa Y / Khoa Răng Hàm Mặt · Trường Đại học Kinh doanh và Công nghệ Hà Nội (HUBT)
          </p>
          <p className="tabular-nums text-teal-300 font-medium">
            Học kỳ I (2026–2027) · Tổng số 27 sinh viên (Nhóm 5 &amp; Nhóm 6)
          </p>
        </div>
      </footer>

      {/* =====================================================================
          MODAL 1: STUDENT DIRECTORY (NHÓM 5 & NHÓM 6 - 27 SINH VIÊN)
         ===================================================================== */}
      {studentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Modal Header with Medical Gradient */}
            <div className="px-5 py-4 bg-gradient-to-r from-blue-900 via-blue-800 to-teal-700 text-white flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold">
                  Danh Sách Sinh Viên Lớp RM31.03 (Nhóm 5 &amp; Nhóm 6)
                </h3>
                <p className="text-xs text-blue-100 tabular-nums mt-0.5">
                  Học phần: Hoá học (Thực hành — 30 tiết) · Mã HP: 191393024 · Số TC: 3 · HK1 (2026–2027)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStudentModalOpen(false)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Toolbar: Segmented Group Tabs + Search + Copy List */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="inline-flex p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800 border border-slate-300/60 dark:border-slate-700">
                  {(
                    [
                      { key: 'all', label: 'Tất cả (27 SV)' },
                      { key: 'nhom5', label: 'Nhóm 5 (14 SV)' },
                      { key: 'nhom6', label: 'Nhóm 6 (13 SV)' }
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setStudentModalTab(t.key)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
                        studentModalTab === t.key
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 flex-1 sm:max-w-md">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder="Tìm theo tên (có/không dấu) hoặc Mã SV..."
                      className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    {studentSearch && (
                      <button
                        type="button"
                        onClick={() => setStudentSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={copyCurrentStudentList}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy DS</span>
                  </button>
                </div>
              </div>

              {/* Lab schedule quick summary for active tab */}
              <div className="text-xs text-slate-700 dark:text-slate-200 flex flex-wrap items-center justify-between gap-2 pt-1">
                {studentModalTab === 'nhom5' ? (
                  <div className="w-full p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex flex-wrap items-center justify-between gap-2">
                    <span>
                      <strong className="text-blue-800 dark:text-blue-300">Lịch thực hành Nhóm 5 (14 SV):</strong> TH Hóa học{' '}
                      <strong>Chiều Thứ Tư (P. C606)</strong> · TH Giải phẫu{' '}
                      <strong>Sáng Thứ Năm (P. C402)</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setGroupFilter('nhom5');
                        setStudentModalOpen(false);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 cursor-pointer"
                    >
                      Lọc lịch Nhóm 5
                    </button>
                  </div>
                ) : studentModalTab === 'nhom6' ? (
                  <div className="w-full p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 flex flex-wrap items-center justify-between gap-2">
                    <span>
                      <strong className="text-teal-800 dark:text-teal-300">Lịch thực hành Nhóm 6 (13 SV):</strong> TH Hóa học{' '}
                      <strong>Chiều Thứ Ba (P. C606)</strong> · TH Giải phẫu{' '}
                      <strong>Chiều Thứ Tư (P. C402)</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setGroupFilter('nhom6');
                        setStudentModalOpen(false);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 cursor-pointer"
                    >
                      Lọc lịch Nhóm 6
                    </button>
                  </div>
                ) : (
                  <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="p-2 rounded-xl bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                      <strong className="text-blue-800 dark:text-blue-300">Nhóm 5 (14 SV):</strong> TH Hóa <strong>Chiều T4 (C606)</strong> · TH Giải phẫu <strong>Sáng T5 (C402)</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-teal-50/90 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800">
                      <strong className="text-teal-800 dark:text-teal-300">Nhóm 6 (13 SV):</strong> TH Hóa <strong>Chiều T3 (C606)</strong> · TH Giải phẫu <strong>Chiều T4 (C402)</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Student Table */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left border-collapse text-xs sm:text-sm tabular-nums">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-extrabold border-b border-slate-200 dark:border-slate-700">
                      <th className="py-2.5 px-3 text-center w-14">STT</th>
                      <th className="py-2.5 px-3">Mã SV</th>
                      <th className="py-2.5 px-3">Họ và đệm</th>
                      <th className="py-2.5 px-3">Tên</th>
                      <th className="py-2.5 px-3 text-center">Nhóm</th>
                      <th className="py-2.5 px-3 text-right">Cá nhân hóa lịch</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-8 text-center text-slate-500 dark:text-slate-400"
                        >
                          Không tìm thấy sinh viên nào khớp với từ khóa tìm kiếm.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((st) => {
                        const isSelected = myStudentId === st.id;
                        return (
                          <tr
                            key={st.id}
                            className={`${
                              isSelected
                                ? 'bg-teal-50/90 dark:bg-teal-950/40'
                                : 'hover:bg-blue-50/40 dark:hover:bg-slate-800/50'
                            } transition-colors`}
                          >
                            <td className="py-2.5 px-3 text-center font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
                              {st.stt}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                              <div className="flex items-center gap-1.5">
                                <span>{st.id}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    copyTextToClipboard(st.id);
                                    showToast(`Đã sao chép Mã SV: ${st.id}`, 'success');
                                  }}
                                  title="Sao chép Mã SV"
                                  className="text-slate-400 hover:text-blue-600 dark:hover:text-teal-400 cursor-pointer"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-medium">
                              {st.lastName}
                            </td>
                            <td className="py-2.5 px-3 font-extrabold text-slate-900 dark:text-white">
                              {st.firstName}
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold text-xs">
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
                            <td className="py-2.5 px-3 text-right">
                              {isSelected ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-600 text-white text-xs font-bold whitespace-nowrap shrink-0">
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Đang chọn</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => selectPersonalStudent(st.id)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                                >
                                  Chọn làm lịch của tôi
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span>
                💡 Bấm <strong>"Chọn làm lịch của tôi"</strong> cạnh tên bạn để tự động lọc đúng lịch thực hành Nhóm 5 hoặc Nhóm 6.
              </span>
              <button
                type="button"
                onClick={() => setStudentModalOpen(false)}
                className="self-end sm:self-auto px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: COURSE NOTE EDITOR
         ===================================================================== */}
      {activeNoteItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                {renderSubjectIcon(activeNoteItem.colorTheme)}
                <span>{activeNoteItem.subject}</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveNoteItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 tabular-nums">
                {DAYS_INFO.find((d) => d.dayOfWeek === activeNoteItem.dayOfWeek)?.label} (Buổi{' '}
                {activeNoteItem.session}) · {activeNoteItem.room} · {activeNoteItem.groupBadge}
              </p>

              <textarea
                rows={4}
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="Nhập ghi chú (VD: Nhớ mang áo blouse trắng, mang giáo trình Giải phẫu, lịch kiểm tra...)"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />

              <div className="flex flex-wrap gap-1.5">
                {QUICK_NOTE_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl}
                    type="button"
                    onClick={() =>
                      setNoteDraft((prev) => (prev.trim() ? `${prev.trim()}; ${tpl}` : tpl))
                    }
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-blue-200 dark:border-slate-700 bg-blue-50/70 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-blue-800 dark:text-slate-300 cursor-pointer"
                  >
                    + {tpl}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              {notes[activeNoteItem.id] && (
                <button
                  type="button"
                  onClick={deleteNote}
                  className="px-3 py-2 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 mr-auto flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa ghi chú</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveNoteItem(null)}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 cursor-pointer"
              >
                Hủy
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
        <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Xuất Lịch Học (.ICS)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setExportModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <p>
                Tải file <strong>.ics</strong> chuẩn quốc tế để thêm tự động toàn bộ các buổi học trong Học kỳ I (từ 12/10/2026 đến 19/12/2026) vào <strong>Google Calendar</strong>, <strong>Apple Calendar (iPhone)</strong> hoặc <strong>Outlook</strong>.
              </p>

              <div className="p-3.5 rounded-xl bg-teal-50/70 dark:bg-slate-800 border border-teal-200 dark:border-slate-700 space-y-2">
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
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100"
                >
                  <option value="nhom5">Lịch Nhóm 5 (14 SV) - Lớp RM31.03</option>
                  <option value="nhom6">Lịch Nhóm 6 (13 SV) - Lớp RM31.03</option>
                  <option value="all">Toàn bộ Lớp RM31.03 (Gồm cả N5 &amp; N6)</option>
                </select>
              </div>

              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 list-disc list-inside tabular-nums">
                <li>Tự động khớp ngày bắt đầu Thực hành (từ 26/10/2026).</li>
                <li>Tự động dừng Lý thuyết &amp; TH Giải phẫu sau 05/12/2026.</li>
                <li>Tự động dừng Thực hành Hóa học sau 19/12/2026.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setExportModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={downloadICSFile}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải file .ICS ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
