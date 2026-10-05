import React, { useMemo } from 'react';

interface DnaRingLogoProps {
  className?: string;
  animate?: boolean;
  galaxy?: boolean;
  openAnimation?: boolean;
  glow?: boolean;
}

export const DnaRingLogo: React.FC<DnaRingLogoProps> = ({
  className = 'w-7 h-7',
  animate = false,
  glow = true,
}) => {
  const strandAId = 'omniDnaStrandA';
  const strandBId = 'omniDnaStrandB';
  const rungGradId = 'omniDnaRungGrad';
  const coreGlowId = 'omniDnaCoreGlow';

  const { pathA, pathB, rungs } = useMemo(() => {
    const cx = 60;
    const cy = 60;
    const R0 = 37;
    const A = 9.5;
    const waves = 4; 
    const steps = 120;
    const totalRungs = 20;

    let pA = '';
    let pB = '';

    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI * 2;
      const sinW = Math.sin(waves * t);
      const rA = R0 + A * sinW;
      const rB = R0 - A * sinW;

      const xA = (cx + rA * Math.cos(t)).toFixed(2);
      const yA = (cy + rA * Math.sin(t)).toFixed(2);
      const xB = (cx + rB * Math.cos(t)).toFixed(2);
      const yB = (cy + rB * Math.sin(t)).toFixed(2);

      pA += (i === 0 ? 'M ' : ' L ') + `${xA} ${yA}`;
      pB += (i === 0 ? 'M ' : ' L ') + `${xB} ${yB}`;
    }
    pA += ' Z';
    pB += ' Z';

    const rungLines: { x1: string; y1: string; x2: string; y2: string; z: number }[] = [];

    for (let i = 0; i < totalRungs; i++) {
      const t = (i / totalRungs) * Math.PI * 2;
      const sinW = Math.sin(waves * t);
      const cosW = Math.cos(waves * t); 
      const rA = R0 + A * sinW;
      const rB = R0 - A * sinW;

      const xA = (cx + rA * Math.cos(t)).toFixed(2);
      const yA = (cy + rA * Math.sin(t)).toFixed(2);
      const xB = (cx + rB * Math.cos(t)).toFixed(2);
      const yB = (cy + rB * Math.sin(t)).toFixed(2);

      rungLines.push({
        x1: xA,
        y1: yA,
        x2: xB,
        y2: yB,
        z: cosW,
      });
    }

    return { pathA: pA, pathB: pB, rungs: rungLines };
  }, []);

  return (
    <svg
      className={`${className} shrink-0 select-none overflow-visible block`}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: glow ? 'drop-shadow(0 0 6px rgba(129, 140, 248, 0.45)) drop-shadow(0 0 12px rgba(56, 189, 248, 0.25))' : undefined
      }}
    >
      <defs>

        <linearGradient id={strandAId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="35%" stopColor="#818cf8" />
          <stop offset="70%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>

        <linearGradient id={strandBId} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="35%" stopColor="#fb923c" />
          <stop offset="70%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>

        <linearGradient id={rungGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.75" />
          <stop offset="50%" stopColor="#c084fc" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.75" />
        </linearGradient>

        <radialGradient id={coreGlowId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.2" />
          <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="60" cy="60" r="32" fill={`url(#${coreGlowId})`} />

      <g
        className={animate ? 'animate-spin-slow' : ''}
        style={{
          transformOrigin: '60px 60px',
          animation: animate ? 'spinSlow 32s linear infinite' : undefined,
        }}
      >

        <g stroke={`url(#${rungGradId})`} strokeWidth="1.4" strokeLinecap="round">
          {rungs.map((rung, i) => (
            <line
              key={i}
              x1={rung.x1}
              y1={rung.y1}
              x2={rung.x2}
              y2={rung.y2}
              opacity={rung.z < -0.3 ? 0.35 : 0.85}
            />
          ))}
        </g>

        <path
          d={pathB}
          stroke={`url(#${strandBId})`}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        <path
          d={pathA}
          stroke={`url(#${strandAId})`}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    </svg>
  );
};
