"use client";

import React from 'react';

export default function ProgressRing({ size = 96, stroke = 10, progress = 0 }: { size?: number; stroke?: number; progress?: number }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id="mintGrad" x1="0%" x2="100%">
          <stop offset="0%" stopColor="#7EE7C7" />
          <stop offset="100%" stopColor="#4EE9A3" />
        </linearGradient>
      </defs>
      <g transform={`translate(${size / 2}, ${size / 2})`}>
        <circle r={radius} fill="none" stroke="#0f1418" strokeWidth={stroke} />
        <circle
          r={radius}
          fill="none"
          stroke="url(#mintGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          transform="rotate(-90)"
        />
      </g>
    </svg>
  );
}
