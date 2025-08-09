"use client";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

export default function DatePicker({ value, onChange, placeholder = "Select date", className = "", label }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  // Parse the value prop (YYYY-MM-DD format)
  useEffect(() => {
    if (value) {
      const date = new Date(value + "T00:00:00");
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
        setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
      }
    }
  }, [value]);

  // Update position when opened
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [isOpen]);

  // Close on outside click or escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!buttonRef.current?.contains(target)) {
        // Check if click is inside the portal content
        const portalContent = document.getElementById('date-picker-portal');
        if (portalContent && !portalContent.contains(target)) {
          setIsOpen(false);
        }
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    // Add small delay to prevent immediate close on open
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }, 10);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
    onChange(formatDate(newDate));
    setIsOpen(false);
  };

  const handleMonthChange = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentMonth(new Date(parseInt(e.target.value), currentMonth.getMonth(), 1));
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selectedDate && 
        selectedDate.getFullYear() === currentMonth.getFullYear() &&
        selectedDate.getMonth() === currentMonth.getMonth() &&
        selectedDate.getDate() === day;

      const isToday = new Date().toDateString() === 
        new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateSelect(day)}
          className={`
            h-8 rounded-lg text-sm font-medium transition-all cursor-pointer
            ${isSelected 
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_0_20px_rgba(0,212,255,0.3)]' 
              : isToday
              ? 'border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20'
              : 'hover:bg-white/10 text-white/70 hover:text-white'
            }
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  // Generate year options (100 years back from current year)
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= currentYear - 100; year--) {
    years.push(year);
  }

  return (
    <div className="relative">
      {label && (
        <label className="text-xs text-[var(--muted)] block mb-1">{label}</label>
      )}
      
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm
          outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(0,212,255,0.2)]
          transition-all flex items-center justify-between text-left
          ${className}
        `}
      >
        <span className={selectedDate ? 'text-white' : 'text-white/50'}>
          {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
        </span>
        <Calendar size={16} className="text-cyan-400" />
      </button>

      {isOpen && typeof window !== 'undefined' && createPortal(
        <div
          id="date-picker-portal"
          className="fixed p-4 bg-[#0a1628] border border-cyan-500/30 rounded-xl shadow-2xl shadow-black/50"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            width: `${Math.max(position.width, 320)}px`,
            zIndex: 2147483647, // Maximum z-index value
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Month/Year Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => handleMonthChange(-1)}
              className="p-1 rounded-lg hover:bg-white/10 text-cyan-400 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">
                {months[currentMonth.getMonth()]}
              </span>
              <select
                value={currentMonth.getFullYear()}
                onChange={handleYearChange}
                className="bg-[#0a1628] border border-white/10 rounded px-2 py-1 text-sm text-white outline-none focus:border-cyan-400 cursor-pointer"
              >
                {years.map(year => (
                  <option key={year} value={year} className="bg-[#0a1628]">
                    {year}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              type="button"
              onClick={() => handleMonthChange(1)}
              className="p-1 rounded-lg hover:bg-white/10 text-cyan-400 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="h-8 flex items-center justify-center text-xs text-white/50 font-medium">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>

          {/* Today Button */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                setSelectedDate(today);
                setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                onChange(formatDate(today));
                setIsOpen(false);
              }}
              className="w-full py-2 px-3 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors text-sm font-medium"
            >
              Today
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}