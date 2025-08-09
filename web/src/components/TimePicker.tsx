"use client";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Clock, ChevronUp, ChevronDown } from "lucide-react";

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

export default function TimePicker({ value, onChange, placeholder = "Select time", className = "", label }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hour, setHour] = useState<number>(12);
  const [minute, setMinute] = useState<number>(0);
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  // Parse the value prop (HH:MM format)
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':').map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
        setHour(displayHour);
        setMinute(m);
        setPeriod(h >= 12 ? 'PM' : 'AM');
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
        const portalContent = document.getElementById('time-picker-portal');
        if (portalContent && !portalContent.contains(target)) {
          setIsOpen(false);
        }
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }, 10);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const formatTime = (h: number, m: number, p: 'AM' | 'PM') => {
    let hour24 = h;
    if (p === 'PM' && h !== 12) hour24 = h + 12;
    if (p === 'AM' && h === 12) hour24 = 0;
    
    return `${String(hour24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const formatDisplayTime = (h: number, m: number, p: 'AM' | 'PM') => {
    return `${h}:${String(m).padStart(2, '0')} ${p}`;
  };

  const handleTimeChange = () => {
    const newTime = formatTime(hour, minute, period);
    onChange(newTime);
    setIsOpen(false);
  };

  const incrementHour = () => {
    setHour(h => h === 12 ? 1 : h + 1);
  };

  const decrementHour = () => {
    setHour(h => h === 1 ? 12 : h - 1);
  };

  const incrementMinute = () => {
    setMinute(m => m === 59 ? 0 : m + 1);
  };

  const decrementMinute = () => {
    setMinute(m => m === 0 ? 59 : m - 1);
  };

  const displayValue = value ? formatDisplayTime(hour, minute, period) : placeholder;

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
        <span className={value ? 'text-white' : 'text-white/50'}>
          {displayValue}
        </span>
        <Clock size={16} className="text-cyan-400" />
      </button>

      {isOpen && typeof window !== 'undefined' && createPortal(
        <div
          id="time-picker-portal"
          className="fixed p-4 bg-[#0a1628] border border-cyan-500/30 rounded-xl shadow-2xl shadow-black/50"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            width: `${Math.max(position.width, 280)}px`,
            zIndex: 2147483647,
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-center gap-4 justify-center">
            {/* Hour */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={incrementHour}
                className="p-1 rounded hover:bg-white/10 text-cyan-400 transition-colors"
              >
                <ChevronUp size={16} />
              </button>
              <div className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-lg border border-white/10 text-lg font-bold text-white">
                {String(hour).padStart(2, '0')}
              </div>
              <button
                type="button"
                onClick={decrementHour}
                className="p-1 rounded hover:bg-white/10 text-cyan-400 transition-colors"
              >
                <ChevronDown size={16} />
              </button>
            </div>

            <div className="text-2xl font-bold text-white/50">:</div>

            {/* Minute */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={incrementMinute}
                className="p-1 rounded hover:bg-white/10 text-cyan-400 transition-colors"
              >
                <ChevronUp size={16} />
              </button>
              <div className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-lg border border-white/10 text-lg font-bold text-white">
                {String(minute).padStart(2, '0')}
              </div>
              <button
                type="button"
                onClick={decrementMinute}
                className="p-1 rounded hover:bg-white/10 text-cyan-400 transition-colors"
              >
                <ChevronDown size={16} />
              </button>
            </div>

            {/* AM/PM */}
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => setPeriod('AM')}
                className={`
                  px-3 py-1 rounded-lg text-sm font-medium transition-all
                  ${period === 'AM' 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_0_20px_rgba(0,212,255,0.3)]' 
                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => setPeriod('PM')}
                className={`
                  px-3 py-1 rounded-lg text-sm font-medium transition-all
                  ${period === 'PM' 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_0_20px_rgba(0,212,255,0.3)]' 
                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                PM
              </button>
            </div>
          </div>

          {/* Set Time Button */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={handleTimeChange}
              className="w-full py-2 px-3 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors text-sm font-medium"
            >
              Set Time
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}