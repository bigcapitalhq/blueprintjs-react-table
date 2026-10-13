import { useLayoutEffect, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import { DEFAULT_COLUMN_HEADER_HEIGHT } from '../components/common/dimensions.ts';

export type ColumnHeaderHeightOptions = {
  /** Minimum height for the column-header area (the `columnHeaderHeight` prop). */
  minHeight: number;
  /** Number of header rows, used for the pre-measurement estimate. */
  headerRowCount: number;
};

export type ColumnHeaderHeightResult = {
  /** Attach to the rendered column-header area to measure its height. */
  ref: MutableRefObject<HTMLDivElement | null>;
  /** Effective height of the column-header area. */
  height: number;
};

/**
 * Resolves the effective height of the column-header area.
 *
 * Column headers can be taller than a single row (grouped columns render
 * additional header rows, and custom header content can grow a row), so the
 * rendered height is measured with a `ResizeObserver` and used as the source of
 * truth for layout. Until the first measurement, an estimate of
 * `headerRowCount * DEFAULT_COLUMN_HEADER_HEIGHT` keeps the layout stable, and
 * the `minHeight` prop continues to act as a floor.
 */
export function useColumnHeaderHeight({
  minHeight,
  headerRowCount,
}: ColumnHeaderHeightOptions): ColumnHeaderHeightResult {
  const ref = useRef<HTMLDivElement | null>(null);
  const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (element == null) {
      return;
    }
    const measure = () => {
      const height = element.getBoundingClientRect().height;
      if (height > 0) {
        setMeasuredHeight((previous) => (previous === height ? previous : height));
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const estimatedHeight = Math.max(0, headerRowCount) * DEFAULT_COLUMN_HEADER_HEIGHT;
  return {
    ref,
    height: Math.max(minHeight, estimatedHeight, measuredHeight ?? 0),
  };
}
