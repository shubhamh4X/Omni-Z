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
  galaxy = false,
  openAnimation = false,
  glow = true,
}) => {
  // Pre-calculate toroidal DNA ring geometry
  const { pathA, pathB, rungs, nodes } = useMemo(() => {
    const cx = 60;
    const cy = 60;
    const R0 = 37;
    const A = 9.5;
    const waves = 4; // 4 full double-helix twists around the circle
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
    const nodeDots: { x: string; y: string; color: string; r: number }[] = [];

    for (let i = 0; i < totalRungs; i++) {
      const t = (i / totalRungs) * Math.PI * 2;
      const sinW = Math.sin(waves * t);
      const cosW = Math.cos(waves * t); // represents 3D depth
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

      // Nucleotide base nodes (cyan and magenta/coral)
      nodeDots.push({
        x: xA,
        y: yA,
        color: cosW > 0 ? '#38bdf8' : '#818cf8',
        r: cosW > 0 ? 1.8 : 1.3,
      });
      nodeDots.push({
        x: xB,
        y: yB,
        color: cosW < 0 ? '#f43f5e' : '#c084fc',
        r: cosW < 0 ? 1.8 : 1.3,
      });
    }

    return { pathA: pA, pathB: pB, rungs: rungLines, nodes: nodeDots };
  }, []);

  const animClass = animate ? 'animate-spin-slow' : '';

  return (
    <svg
      className={`${className} ${animClass} shrink-0 select-none overflow-visible`}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Strand A Cyber Gradient */}
        <linearGradient id="dnaStrandA" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="35%" stopColor="#818cf8" />
          <stop offset="70%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>

        {/* Strand B Complementary Gradient */}
        <linearGradient id="dnaStrandB" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="35%" stopColor="#fb923c" />
          <stop offset="70%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>

        {/* Base Pair Rung Gradient */}
        <linearGradient id="dnaRungGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#c084fc" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.8" />
        </linearGradient>

        {/* Soft Radial Core Glow */}
        <radialGradient id="dnaCoreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.15" />
          <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        {glow && (
          <filter id="dnaGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      {/* Subtle Central Core Ambient Glow */}
      <circle cx="60" cy="60" r="32" fill="url(#dnaCoreGlow)" />

      {/* DNA Hydrogen Bond Rungs (Base Pairs) */}
      <g stroke="url(#dnaRungGrad)" strokeWidth="1.4" strokeLinecap="round" opacity="0.85">
        {rungs.map((rung, i) => (
          <line
            key={i}
            x1={rung.x1}
            y1={rung.y1}
            x2={rung.x2}
            y2={rung.y2}
            strokeDasharray={rung.z < -0.4 ? '1.5 2' : 'none'}
            opacity={rung.z < -0.3 ? 0.45 : 0.9}
          />
        ))}
      </g>

      {/* Strand B (Inner/Outer intertwined helical backbone) */}
      <path
        d={pathB}
        stroke="url(#dnaStrandB)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        filter={glow ? 'url(#dnaGlowFilter)' : undefined}
      />

      {/* Strand A (Complementary helical backbone) */}
      <path
        d={pathA}
        stroke="url(#dnaStrandA)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        filter={glow ? 'url(#dnaGlowFilter)' : undefined}
      />

      {/* Nucleotide Nodes at Junctions */}
      <g>
        {nodes.map((node, i) => (
          <circle
            key={i}
            cx={node.x}
            cy={node.y}
            r={node.r}
            fill={node.color}
            opacity="0.95"
          />
        ))}
      </g>
    </svg>
  );
};
