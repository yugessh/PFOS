"use client";

import React, { useMemo } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive as any);

export interface GridItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  static?: boolean;
}

export interface ResponsiveGridProps {
  layout: GridItem[];
  cols?: { lg: number; md: number; sm: number; xs: number; xxs: number };
  rowHeight?: number;
  onLayoutChange?: (layout: GridItem[]) => void;
  children: React.ReactNode[] | React.ReactNode;
}

export default function ResponsiveGrid({ layout, cols, rowHeight = 80, onLayoutChange, children }: ResponsiveGridProps) {
  const defaultCols = cols || { lg: 12, md: 6, sm: 4, xs: 2, xxs: 1 };

  const layouts = useMemo(() => ({ lg: layout }), [layout]);

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      breakpoints={{ lg: 1200, md: 768, sm: 640, xs: 480, xxs: 0 }}
      cols={defaultCols as any}
      rowHeight={rowHeight}
      onLayoutChange={(l: any) => onLayoutChange?.(l)}
      measureBeforeMount={false}
      useCSSTransforms={true}
      draggableHandle=".drag-handle"
      isBounded
      compactType="vertical"
    >
      {React.Children.map(children, (child, idx) => (
        <div key={(child as any)?.key ?? String(idx)} data-grid={layout[idx] || { x: 0, y: idx, w: 6, h: 2 }}>
          {child}
        </div>
      ))}
    </ResponsiveGridLayout>
  );
}
