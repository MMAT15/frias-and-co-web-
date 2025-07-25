'use client';
import { useEffect, useState } from 'react';

export default function DarkModeToggle() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setEnabled(localStorage.theme === 'dark' || mq.matches);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', enabled);
    localStorage.theme = enabled ? 'dark' : 'light';
  }, [enabled]);
  return (
    <button onClick={() => setEnabled(!enabled)} aria-label="Toggle dark mode" className="text-sm">
      {enabled ? '🌙' : '☀️'}
    </button>
  );
}
