'use client';

import { usePathname } from 'next/navigation';
import { Footer } from '@/app/sections/footer';

export const ConditionalFooter = () => {
  const pathname = usePathname();
  
  // Ne pas afficher le footer sur la page /noor
  if (pathname?.includes('/noor')) {
    return null;
  }
  
  return <Footer />;
};









