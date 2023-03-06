import { useState } from 'react';

interface UseUncontrolledInput<T> {
  /** Value for controlled state */
  value?: T;

  /** Initial value for uncontrolled state */
  defaultValue?: T;

  /** Controlled state onChange handler */
  onChange?(value: T): void;
}

function useUncontrolled<T>({
  value,
  defaultValue,
  onChange = () => {},
}: UseUncontrolledInput<T>): [T, (value: T) => void, boolean] {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);

  const handleUncontrolledChange = (val: T) => {
    setUncontrolledValue(val);
    onChange?.(val);
  };

  if (value !== undefined) {
    return [value as T, onChange, true];
  }
  // state, setState, isUncontrolled
  return [uncontrolledValue as T, handleUncontrolledChange, false];
}

export default useUncontrolled;