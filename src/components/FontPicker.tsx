import React, { useState, useEffect, useRef } from 'react';
import { Type, Check, ChevronDown } from 'lucide-react';

export interface FontOption {
  id: string;
  name: string;
  family: string;
  tag: string;
}

export const FONTS: FontOption[] = [
  {
    id: 'outfit',
    name: 'Outfit',
    family: "'Outfit', sans-serif",
    tag: 'Google Sans style',
  },
  {
    id: 'jakarta',
    name: 'Plus Jakarta',
    family: "'Plus Jakarta Sans', sans-serif",
    tag: 'Contemporary',
  },
  {
    id: 'inter',
    name: 'Inter',
    family: "'Inter', sans-serif",
    tag: 'Clean UI',
  },
  {
    id: 'space',
    name: 'Space Grotesk',
    family: "'Space Grotesk', sans-serif",
    tag: 'Futuristic',
  },
  {
    id: 'mono',
    name: 'JetBrains Mono',
    family: "'JetBrains Mono', monospace",
    tag: 'Code & Terminal',
  },
];

export const FontPicker: React.FC = () => {
  const [selectedFont, setSelectedFont] = useState<string>(() => {
    try {
      return localStorage.getItem('omniz_font') || 'outfit';
    } catch {
      return 'outfit';
    }
  });

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const applyFont = (fontId: string) => {
    const font = FONTS.find((f) => f.id === fontId) || FONTS[0];
    document.documentElement.style.setProperty('--font-family', font.family);
    setSelectedFont(font.id);
    try {
      localStorage.setItem('omniz_font', font.id);
    } catch {}
  };

  useEffect(() => {
    applyFont(selectedFont);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = FONTS.find((f) => f.id === selectedFont) || FONTS[0];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs text-[#c4c7c5] hover:text-white hover:bg-[#282a2c] border border-transparent hover:border-[#3c4043] transition-colors cursor-pointer"
        title="Change application typography font"
      >
        <Type className="w-3.5 h-3.5 text-[#8ab4f8]" />
        <span className="hidden md:inline font-medium">{current.name}</span>
        <ChevronDown className="w-3 h-3 text-[#80868b]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-9 z-50 w-52 py-1.5 bg-[#1e1f20] border border-[#3c4043] rounded-2xl shadow-2xl animate-in fade-in zoom-in-95">
          <div className="px-3 py-1.5 border-b border-[#2d2f33] text-[11px] font-semibold text-[#80868b] uppercase tracking-wider">
            Choose Typography
          </div>
          <div className="py-1">
            {FONTS.map((font) => {
              const isSelected = font.id === selectedFont;
              return (
                <button
                  key={font.id}
                  onClick={() => {
                    applyFont(font.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer text-left ${
                    isSelected
                      ? 'bg-[#282a2c] text-[#8ab4f8] font-semibold'
                      : 'text-[#e3e3e3] hover:bg-[#282a2c]/60 hover:text-white'
                  }`}
                  style={{ fontFamily: font.family }}
                >
                  <div className="flex flex-col">
                    <span className="text-sm">{font.name}</span>
                    <span className="text-[10px] text-[#80868b] font-normal">{font.tag}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#8ab4f8] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
