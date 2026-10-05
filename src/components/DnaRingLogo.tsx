import React, { useMemo, useId, useState } from 'react';

interface DnaRingLogoProps {
  className?: string;
  animate?: boolean;
  galaxy?: boolean;
  openAnimation?: boolean;
  glow?: boolean;
}

export const DnaRingLogo: React.FC<DnaRingLogoProps> = ({
  className = 'w-7 h-7',
  animate = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const reactId = useId();
  const uid = useMemo(() => reactId.replace(/[^a-zA-Z0-9_-]/g, '_'), [reactId]);
  const strand1Id = `dnaStrand1_${uid}`;
  const strand2Id = `dnaStrand2_${uid}`;
  const coreGlowId = `dnaCoreGlow_${uid}`;

  // Pre-calculate exact geometry from user's reference image
  const { path1, path2, rungs, nodes } = useMemo(() => {
    const cx = 60;
    const cy = 60;
    const R0 = 36;
    const A = 11.5;
    const waves = 4; // 4 waves = 8 alternating lobes
    const steps = 160;
    const offset = -Math.PI / 8; // Aligns lobe 0 directly at top (12:00)

    let p1 = '';
    let p2 = '';

    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI * 2;
      const sinW = Math.sin(waves * (t - offset));
      const r1 = R0 + A * sinW;
      const r2 = R0 - A * sinW;

      const x1 = (cx + r1 * Math.cos(t)).toFixed(2);
      const y1 = (cy + r1 * Math.sin(t)).toFixed(2);
      const x2 = (cx + r2 * Math.cos(t)).toFixed(2);
      const y2 = (cy + r2 * Math.sin(t)).toFixed(2);

      p1 += (i === 0 ? 'M ' : ' L ') + `${x1} ${y1}`;
      p2 += (i === 0 ? 'M ' : ' L ') + `${x2} ${y2}`;
    }
    p1 += ' Z';
    p2 += ' Z';

    // Rungs & Glowing Node Dots
    // 8 lobes around the circle, 2 rungs per lobe = 16 rungs total with 32 glowing node dots
    const rungLines: { x1: number; y1: number; x2: number; y2: number; color: string }[] = [];
    const nodeList: { x: number; y: number; color: string; glow: string; isOuter: boolean }[] = [];

    // Dot colors alternating between Neon Red/Coral and Neon Cyan exactly as in reference image
    const dotColors = [
      { outer: '#ff3366', inner: '#00e5ff' }, // Lobe 0 (12:00 Top Orange): Red outer, Cyan inner
      { outer: '#00e5ff', inner: '#ff3366' }, // Lobe 1 (1:30 Periwinkle): Cyan outer, Red inner
      { outer: '#ff3366', inner: '#00e5ff' }, // Lobe 2 (3:00 Coral): Red outer, Cyan inner
      { outer: '#00e5ff', inner: '#ff3366' }, // Lobe 3 (4:30 Pink): Cyan outer, Red inner
      { outer: '#ff3366', inner: '#00e5ff' }, // Lobe 4 (6:00 Purple): Red outer, Cyan inner
      { outer: '#ff3366', inner: '#00e5ff' }, // Lobe 5 (7:30 Indigo): Red outer, Cyan inner
      { outer: '#00e5ff', inner: '#ff3366' }, // Lobe 6 (9:00 Blue): Cyan outer, Red inner
      { outer: '#ff3366', inner: '#00e5ff' }, // Lobe 7 (10:30 Cyan): Red outer, Cyan inner
    ];

    const delta = Math.PI / 22; // Symmetric spacing of rungs on each lobe (~8.2 deg)

    for (let lobe = 0; lobe < 8; lobe++) {
      const centerAngle = -Math.PI / 2 + lobe * (Math.PI / 4);
      const angles = [centerAngle - delta, centerAngle + delta];
      const dots = dotColors[lobe];
      const isStrand1Outer = lobe % 2 === 0;

      for (const t of angles) {
        const sinW = Math.sin(waves * (t - offset));
        const r1 = R0 + A * sinW;
        const r2 = R0 - A * sinW;

        const x1 = +(cx + r1 * Math.cos(t)).toFixed(2);
        const y1 = +(cy + r1 * Math.sin(t)).toFixed(2);
        const x2 = +(cx + r2 * Math.cos(t)).toFixed(2);
        const y2 = +(cy + r2 * Math.sin(t)).toFixed(2);

        rungLines.push({
          x1,
          y1,
          x2,
          y2,
          color: '#a78bfa',
        });

        // Add node for Strand 1
        nodeList.push({
          x: x1,
          y: y1,
          color: isStrand1Outer ? dots.outer : dots.inner,
          glow: isStrand1Outer ? dots.outer : dots.inner,
          isOuter: isStrand1Outer,
        });

        // Add node for Strand 2
        nodeList.push({
          x: x2,
          y: y2,
          color: !isStrand1Outer ? dots.outer : dots.inner,
          glow: !isStrand1Outer ? dots.outer : dots.inner,
          isOuter: !isStrand1Outer,
        });
      }
    }

    return { path1: p1, path2: p2, rungs: rungLines, nodes: nodeList };
  }, []);

  return (
    <svg
      className={`${className} shrink-0 select-none overflow-visible block dna-ring-logo cursor-pointer`}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <defs>
        {/* Strand 1 Cyber Neon Gradient (Orange at top -> Coral -> Purple at bottom -> Blue at left) */}
        <linearGradient id={strand1Id} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="30%" stopColor="#fb7185" />
          <stop offset="60%" stopColor="#a855f7" />
          <stop offset="85%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>

        {/* Strand 2 Complementary Neon Gradient (Cyan at top-left -> Periwinkle at top-right -> Pink at right -> Indigo) */}
        <linearGradient id={strand2Id} x1="0%" y1="20%" x2="100%" y2="80%">
          <stop offset="0%" stopColor="#00e5ff" />
          <stop offset="25%" stopColor="#818cf8" />
          <stop offset="55%" stopColor="#f43f5e" />
          <stop offset="80%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>

        {/* Minimal Central Core Ambient Glow strictly inside the inner ring */}
        <radialGradient id={coreGlowId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#312e81" stopOpacity={isHovered ? 0.22 : 0.14} />
          <stop offset="65%" stopColor="#1e1b4b" stopOpacity={isHovered ? 0.1 : 0.06} />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Discrete Central Core Nebula (Confined inside the ring, zero outside bleed) */}
      <circle cx="60" cy="60" r="22" fill={`url(#${coreGlowId})`} />

      {/* Rotating Toroidal Helix Geometry */}
      <g
        className={animate ? 'animate-spin-slow' : ''}
        style={{
          transformOrigin: '60px 60px',
          animation: animate ? 'spinSlow 26s linear infinite' : undefined,
        }}
      >
        {/* Delicate Dotted Cross-Rungs */}
        <g strokeLinecap="round" strokeDasharray="1.6 2" opacity={isHovered ? 0.75 : 0.6}>
          {rungs.map((rung, i) => (
            <line
              key={i}
              x1={rung.x1}
              y1={rung.y1}
              x2={rung.x2}
              y2={rung.y2}
              stroke={rung.color}
              strokeWidth="1.15"
            />
          ))}
        </g>

        {/* Strand 2 - Subtle Highlight Underglow */}
        <path
          d={path2}
          stroke={`url(#${strand2Id})`}
          strokeWidth={isHovered ? '4.8' : '4.4'}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={isHovered ? 0.36 : 0.22}
          style={{ transition: 'opacity 0.25s ease, stroke-width 0.25s ease' }}
        />

        {/* Strand 1 - Subtle Highlight Underglow */}
        <path
          d={path1}
          stroke={`url(#${strand1Id})`}
          strokeWidth={isHovered ? '4.8' : '4.4'}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={isHovered ? 0.36 : 0.22}
          style={{ transition: 'opacity 0.25s ease, stroke-width 0.25s ease' }}
        />

        {/* Strand 2 - Crisp Core Ribbon */}
        <path
          d={path2}
          stroke={`url(#${strand2Id})`}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Strand 1 - Crisp Core Ribbon */}
        <path
          d={path1}
          stroke={`url(#${strand1Id})`}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Luminous Star Node Dots (Alternating Red/Cyan as in reference screenshot) */}
        <g>
          {nodes.map((node, i) => (
            <g key={i}>
              {/* Outer delicate luminous halo - gently highlighted on hover */}
              <circle
                cx={node.x}
                cy={node.y}
                r={isHovered ? (node.isOuter ? 2.8 : 2.4) : (node.isOuter ? 2.5 : 2.1)}
                fill={node.glow}
                opacity={isHovered ? 0.42 : 0.25}
                style={{ transition: 'r 0.25s ease, opacity 0.25s ease' }}
              />
              {/* Core crisp neon pinpoint bead */}
              <circle
                cx={node.x}
                cy={node.y}
                r={node.isOuter ? 1.9 : 1.6}
                fill={node.color}
                opacity={0.98}
              />
            </g>
          ))}
        </g>
      </g>
    </svg>
  );
};
