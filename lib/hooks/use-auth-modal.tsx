"use client";

import { createContext, useContext, useState, useCallback } from "react";

type AuthAction = "apply" | "save" | "bookmark";

type AuthModalContextType = {
  isOpen: boolean;
  action: AuthAction;
  returnUrl: string;
  open: (action: AuthAction, returnUrl?: string) => void;
  close: () => void;
};

const AuthModalContext = createContext<AuthModalContextType | null>(null);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [action, setAction] = useState<AuthAction>("apply");
  const [returnUrl, setReturnUrl] = useState("");

  const open = useCallback((act: AuthAction, url?: string) => {
    setAction(act);
    setReturnUrl(url ?? window.location.pathname);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <AuthModalContext.Provider value={{ isOpen, action, returnUrl, open, close }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
}
