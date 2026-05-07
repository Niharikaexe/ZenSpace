"use client";

import React from "react";

/**
 * ZenSpace Owl Mascot
 *
 * Drop-in React component. Renders a 280×310 SVG owl with:
 *  - Slow blink every ~5s
 *  - Gentle head tilt (9s cycle)
 *  - Wing flutter + chest breathe (3.5s cycle)
 *
 * Usage:
 *   import OwlMascot from "@/components/home/OwlMascot";
 *   <OwlMascot className="w-full h-full" />
 */

interface OwlMascotProps {
  className?: string;
  style?: React.CSSProperties;
}

const OwlMascot: React.FC<OwlMascotProps> = ({ className, style }) => (
  <svg
    viewBox="0 0 280 310"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <defs>
      <style>{`
        .owl-blink-l, .owl-blink-r {
          transform-box: fill-box;
          transform-origin: top;
          animation: owlBlink 5s ease-in-out infinite;
        }
        .owl-blink-r { animation-delay: 0.06s; }
        .owl-head-g {
          transform-box: fill-box;
          transform-origin: 140px 195px;
          animation: owlTilt 9s ease-in-out infinite;
        }
        .owl-chest-g {
          transform-box: fill-box;
          transform-origin: 140px 218px;
          animation: owlBreathe 3.5s ease-in-out infinite;
        }
        .owl-wing-l {
          transform-box: fill-box;
          transform-origin: 84px 200px;
          animation: owlWingL 3.5s ease-in-out infinite;
        }
        .owl-wing-r {
          transform-box: fill-box;
          transform-origin: 196px 200px;
          animation: owlWingR 3.5s ease-in-out infinite;
        }
        @keyframes owlBlink {
          0%, 78%, 100% { transform: scaleY(0); }
          82%, 88%      { transform: scaleY(1); }
        }
        @keyframes owlTilt {
          0%, 100% { transform: rotate(0deg); }
          28%      { transform: rotate(-5deg); }
          72%      { transform: rotate(4deg); }
        }
        @keyframes owlBreathe {
          0%, 100% { transform: scaleY(1); }
          50%      { transform: scaleY(1.04); }
        }
        @keyframes owlWingL {
          0%, 100% { transform: rotate(0deg); }
          50%      { transform: rotate(4deg); }
        }
        @keyframes owlWingR {
          0%, 100% { transform: rotate(0deg); }
          50%      { transform: rotate(-4deg); }
        }
      `}</style>
    </defs>

    {/* ── Soft glow ── */}
    <circle cx="140" cy="175" r="95" fill="rgba(126,192,183,0.08)" />

    {/* ── Tropical leaves – back ── */}
    <path d="M30,285 C8,215 20,130 74,100 C62,148 44,215 30,285 Z" fill="#2A6B63" />
    <path d="M30,285 C50,218 62,158 74,100" stroke="#1E5048" strokeWidth="1.5" fill="none" />
    <path d="M250,272 C272,200 260,116 206,90 C218,138 236,202 250,272 Z" fill="#2A6B63" />
    <path d="M250,272 C234,204 220,148 206,90" stroke="#1E5048" strokeWidth="1.5" fill="none" />
    <path d="M66,108 C44,76 54,34 86,26 C80,52 72,82 66,108 Z" fill="#3D8A80" />
    <path d="M214,100 C236,68 226,26 194,20 C200,46 210,76 214,100 Z" fill="#3D8A80" />

    {/* ── Branch ── */}
    <path d="M55,252 Q140,238 225,252" stroke="#2A6B63" strokeWidth="14" strokeLinecap="round" fill="none" />
    <path d="M55,252 Q140,238 225,252" stroke="#3D8A80" strokeWidth="6" strokeLinecap="round" fill="none" />
    <ellipse cx="72" cy="248" rx="9" ry="5" fill="#3D8A80" transform="rotate(-25 72 248)" />
    <ellipse cx="208" cy="248" rx="9" ry="5" fill="#3D8A80" transform="rotate(25 208 248)" />

    {/* ── Tail feathers ── */}
    <path d="M115,248 Q108,272 102,282 Q118,275 125,260 Z" fill="#5EA9A0" />
    <path d="M140,250 Q138,276 138,286 Q146,276 142,250 Z" fill="#5EA9A0" />
    <path d="M165,248 Q172,272 178,282 Q162,275 155,260 Z" fill="#5EA9A0" />

    {/* ── Feet ── */}
    <path d="M112,248 Q105,254 100,258" stroke="#C97B3A" strokeWidth="5" strokeLinecap="round" fill="none" />
    <path d="M112,248 Q108,256 106,262" stroke="#C97B3A" strokeWidth="5" strokeLinecap="round" fill="none" />
    <path d="M112,248 Q114,256 114,263" stroke="#C97B3A" strokeWidth="5" strokeLinecap="round" fill="none" />
    <path d="M168,248 Q175,254 180,258" stroke="#C97B3A" strokeWidth="5" strokeLinecap="round" fill="none" />
    <path d="M168,248 Q172,256 174,262" stroke="#C97B3A" strokeWidth="5" strokeLinecap="round" fill="none" />
    <path d="M168,248 Q166,256 166,263" stroke="#C97B3A" strokeWidth="5" strokeLinecap="round" fill="none" />

    {/* ── Body ── */}
    <ellipse cx="140" cy="210" rx="66" ry="72" fill="#7EC0B7" />
    <ellipse cx="140" cy="225" rx="60" ry="55" fill="#6BB3AA" />

    {/* ── Wings (animated) ── */}
    <path className="owl-wing-l" d="M74,190 Q52,210 58,248 Q74,238 84,218 Q86,200 74,190 Z" fill="#5EA9A0" />
    <path className="owl-wing-l" d="M74,200 Q64,218 66,236" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path className="owl-wing-r" d="M206,190 Q228,210 222,248 Q206,238 196,218 Q194,200 206,190 Z" fill="#5EA9A0" />
    <path className="owl-wing-r" d="M206,200 Q216,218 214,236" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" fill="none" strokeLinecap="round" />

    {/* ── Chest (animated breathe) ── */}
    <g className="owl-chest-g">
      <ellipse cx="140" cy="218" rx="44" ry="56" fill="#F0EDE6" />
      {/* Feather scallops */}
      <path d="M99,182 Q106,173 113,182" fill="rgba(180,170,155,0.20)" />
      <path d="M113,182 Q120,173 127,182" fill="rgba(180,170,155,0.20)" />
      <path d="M127,182 Q134,173 141,182" fill="rgba(180,170,155,0.20)" />
      <path d="M106,198 Q113,189 120,198" fill="rgba(180,170,155,0.20)" />
      <path d="M120,198 Q127,189 134,198" fill="rgba(180,170,155,0.20)" />
      <path d="M134,198 Q141,189 148,198" fill="rgba(180,170,155,0.20)" />
      <path d="M113,214 Q120,205 127,214" fill="rgba(180,170,155,0.20)" />
      <path d="M127,214 Q134,205 141,214" fill="rgba(180,170,155,0.20)" />
      <ellipse cx="133" cy="205" rx="10" ry="14" fill="rgba(255,255,255,0.30)" />
      {/* Tiny teal heart */}
      <path
        d="M129,212 Q129,205 135,205 Q140,205 140,210 Q140,205 145,205 Q151,205 151,212 Q151,218 140,224 Q129,218 129,212 Z"
        fill="#5EA9A0"
        fillOpacity="0.65"
      />
    </g>

    {/* ── Head (animated tilt) ── */}
    <g className="owl-head-g">
      <circle cx="140" cy="140" r="58" fill="#7EC0B7" />

      {/* Ear tufts */}
      <path d="M106,90 Q112,68 122,82 Q115,86 106,90 Z" fill="#5EA9A0" />
      <path d="M174,90 Q168,68 158,82 Q165,86 174,90 Z" fill="#5EA9A0" />
      <path d="M109,90 Q113,76 119,84 Q114,87 109,90 Z" fill="#6BADA4" />
      <path d="M171,90 Q167,76 161,84 Q166,87 171,90 Z" fill="#6BADA4" />

      {/* Facial disc */}
      <ellipse cx="140" cy="143" rx="44" ry="47" fill="#96CECA" />
      <ellipse cx="140" cy="143" rx="36" ry="39" fill="none" stroke="rgba(255,255,255,0.20)" strokeWidth="1.5" />

      {/* Eye rings */}
      <circle cx="118" cy="139" r="15" fill="rgba(255,255,255,0.18)" />
      <circle cx="162" cy="139" r="15" fill="rgba(255,255,255,0.18)" />
      {/* Eye whites */}
      <circle cx="118" cy="139" r="12" fill="white" />
      <circle cx="162" cy="139" r="12" fill="white" />
      {/* Iris */}
      <circle cx="118" cy="139" r="9" fill="#C8863C" />
      <circle cx="162" cy="139" r="9" fill="#C8863C" />
      <circle cx="118" cy="139" r="9" fill="none" stroke="#A86E2A" strokeWidth="1.2" />
      <circle cx="162" cy="139" r="9" fill="none" stroke="#A86E2A" strokeWidth="1.2" />
      {/* Pupil */}
      <circle cx="118" cy="139" r="4.5" fill="#1A0E06" />
      <circle cx="162" cy="139" r="4.5" fill="#1A0E06" />
      {/* Highlights */}
      <circle cx="114" cy="135" r="2.5" fill="white" />
      <circle cx="158" cy="135" r="2.5" fill="white" />
      <circle cx="122" cy="143" r="1.3" fill="rgba(255,255,255,0.60)" />
      <circle cx="166" cy="143" r="1.3" fill="rgba(255,255,255,0.60)" />

      {/* Lashes — two light strokes at outer corners only */}
      <path d="M107,132 Q104,125 108,129" stroke="#3A2010" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeOpacity="0.6" />
      <path d="M111,128 Q109,121 113,126" stroke="#3A2010" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeOpacity="0.6" />
      <path d="M169,132 Q172,125 168,129" stroke="#3A2010" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeOpacity="0.6" />
      <path d="M165,128 Q167,121 163,126" stroke="#3A2010" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeOpacity="0.6" />

      {/* Beak */}
      <path d="M133,158 L140,170 L147,158 Q140,163 133,158 Z" fill="#E8B870" />
      <path d="M133,158 Q140,163 147,158" stroke="#C8963A" strokeWidth="1.2" fill="none" />

      {/* Cheek blush */}
      <ellipse cx="100" cy="152" rx="11" ry="6" fill="#F4826A" fillOpacity="0.20" />
      <ellipse cx="180" cy="152" rx="11" ry="6" fill="#F4826A" fillOpacity="0.20" />

      {/* Blink overlays */}
      <ellipse className="owl-blink-l" cx="118" cy="139" rx="12" ry="12" fill="#96CECA" />
      <ellipse className="owl-blink-r" cx="162" cy="139" rx="12" ry="12" fill="#96CECA" />
      <path className="owl-blink-l" d="M107,132 Q104,125 108,129" stroke="#3A2010" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeOpacity="0.6" />
      <path className="owl-blink-l" d="M111,128 Q109,121 113,126" stroke="#3A2010" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeOpacity="0.6" />
      <path className="owl-blink-r" d="M169,132 Q172,125 168,129" stroke="#3A2010" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeOpacity="0.6" />
      <path className="owl-blink-r" d="M165,128 Q167,121 163,126" stroke="#3A2010" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeOpacity="0.6" />
    </g>
  </svg>
);

export default OwlMascot;
