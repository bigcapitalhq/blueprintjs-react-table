import { useState } from 'react';

export type UseUncontrolledInput<T> = {
  /** Value for controlled state. */
  value?: T;
  /** Initial value for uncontrolled state. */
  initialValue?: T;
  /** Final value for uncontrolled state when value and initialValue are not provided. */
  finalValue?: T;
  /** Controlled state onChange handler. */
  onChange?: (value: T) => void;
};

/**
 * Owns a piece of state that can be driven either by the caller (controlled) or
 * by the component itself (uncontrolled), mirroring the common React
 * controlled/uncontrolled convention.
 *
 * Returns the resolved value, a setter that notifies `onChange` in both modes,
 * and whether the state is currently controlled (`value` was provided).
 */
export function useUncontrolled<T>({
  value,
  initialValue,
  finalValue,
  onChange = () => {},
}: UseUncontrolledInput<T>): [T, (value: T) => void, boolean] {
  const [uncontrolledValue, setUncontrolledValue] = useState<T>(
    initialValue !== undefined ? initialValue : (finalValue as T),
  );

  const handleUncontrolledChange = (next: T) => {
    setUncontrolledValue(next);
    onChange?.(next);
  };

  if (value !== undefined) {
    return [value, onChange, true];
  }
  return [uncontrolledValue, handleUncontrolledChange, false];
}
