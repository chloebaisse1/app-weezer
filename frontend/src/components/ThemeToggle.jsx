import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {

  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
   
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-all shadow-lg active:scale-95 flex items-center justify-center"
    >
      {isDark ? (
        <Sun size={18} className="animate-in fade-in zoom-in duration-300" />
      ) : (
        <Moon size={18} className="animate-in fade-in zoom-in duration-300" />
      )}
    </button>
  );
}