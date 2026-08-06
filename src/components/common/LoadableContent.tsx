import type { ReactNode } from 'react';
import { Classes } from '@blueprintjs/core';

export type LoadableContentProps = {
  children?: ReactNode;

  /**
   * If true, render a skeleton. Otherwise render the child content passed to this component.
   */
  loading: boolean;

  /**
   * If true, show a skeleton of random width (25-75% of the container width) when rendering the
   * loading state.
   *
   * @default false
   */
  variableLength?: boolean;
};

/**
 * Renders a skeleton placeholder while `loading` is true, otherwise renders the children.
 */
export function LoadableContent({
  loading,
  variableLength = false,
  children,
}: LoadableContentProps) {
  if (loading) {
    const skeletonLength = variableLength ? 75 - Math.floor(Math.random() * 11) * 5 : 100;
    return <div className={Classes.SKELETON} style={{ width: `${skeletonLength}%` }} />;
  }

  return <>{children}</>;
}
