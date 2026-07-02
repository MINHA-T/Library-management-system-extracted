'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const TitleContext = createContext(null);

export function TitleProvider({ children }) {
  const [title, setTitle] = useState('Library Management System');
  return <TitleContext.Provider value={{ title, setTitle }}>{children}</TitleContext.Provider>;
}

export function useTitleContext() {
  const ctx = useContext(TitleContext);
  if (!ctx) throw new Error('useTitleContext must be used within a TitleProvider');
  return ctx;
}

/**
 * usePageTitle(title)
 * Call at the top of a page component to set the Topbar's page title,
 * mirroring the $pageTitle variable each PHP page used to set.
 */
export function usePageTitle(title) {
  const { setTitle } = useTitleContext();
  useEffect(() => {
    setTitle(title);
    if (typeof document !== 'undefined') {
      document.title = `${title} | LibraryMS`;
    }
  }, [title, setTitle]);
}
