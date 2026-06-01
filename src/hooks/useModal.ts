import { useState } from 'react';

export function useModal<T = string>() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | null>(null);

  const open = (value: T) => {
    setData(value);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setTimeout(() => setData(null), 200);
  };

  return { isOpen, data, open, close };
}
