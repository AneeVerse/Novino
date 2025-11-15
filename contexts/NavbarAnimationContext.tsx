"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface NavbarAnimationContextType {
  logoTargetRef: HTMLDivElement | null;
  setLogoTargetRef: (ref: HTMLDivElement | null) => void;
  isScrolled: boolean;
  setIsScrolled: (scrolled: boolean) => void;
}

const NavbarAnimationContext = createContext<NavbarAnimationContextType>({
  logoTargetRef: null,
  setLogoTargetRef: () => {},
  isScrolled: false,
  setIsScrolled: () => {},
});

export const useNavbarAnimation = () => useContext(NavbarAnimationContext);

export function NavbarAnimationProvider({ children }: { children: ReactNode }) {
  const [logoTargetRef, setLogoTargetRef] = useState<HTMLDivElement | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  return (
    <NavbarAnimationContext.Provider value={{ logoTargetRef, setLogoTargetRef, isScrolled, setIsScrolled }}>
      {children}
    </NavbarAnimationContext.Provider>
  );
}









