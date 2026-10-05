import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string | React.ReactNode;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  className?: string;
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'bottom',
  align = 'center',
  className = '',
  delay = 100,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  if (!content) return children;

  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  let positionClasses = '';
  if (position === 'bottom') {
    if (align === 'start') {
      positionClasses = 'top-full left-0 mt-2';
    } else if (align === 'end') {
      positionClasses = 'top-full right-0 mt-2';
    } else {
      positionClasses = 'top-full left-1/2 -translate-x-1/2 mt-2';
    }
  } else if (position === 'top') {
    if (align === 'start') {
      positionClasses = 'bottom-full left-0 mb-2';
    } else if (align === 'end') {
      positionClasses = 'bottom-full right-0 mb-2';
    } else {
      positionClasses = 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    }
  } else if (position === 'left') {
    if (align === 'start') {
      positionClasses = 'right-full top-0 mr-2';
    } else if (align === 'end') {
      positionClasses = 'right-full bottom-0 mr-2';
    } else {
      positionClasses = 'right-full top-1/2 -translate-y-1/2 mr-2';
    }
  } else if (position === 'right') {
    if (align === 'start') {
      positionClasses = 'left-full top-0 ml-2';
    } else if (align === 'end') {
      positionClasses = 'left-full bottom-0 ml-2';
    } else {
      positionClasses = 'left-full top-1/2 -translate-y-1/2 ml-2';
    }
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={`absolute ${positionClasses} z-[100] pointer-events-none select-none whitespace-nowrap px-3 py-1.5 rounded-full bg-[#1e1f20]/95 backdrop-blur-md border border-[#3c4043] text-[#e3e3e3] text-[11.5px] font-medium shadow-[0_8px_24px_rgba(0,0,0,0.6)] tracking-normal animate-in fade-in zoom-in-95 duration-150`}
        >
          {content}
        </div>
      )}
    </div>
  );
};
