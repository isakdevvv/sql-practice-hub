import { useEffect, useSyncExternalStore } from "react";

export type AppMode = "ovning" | "eksamen";

const STORAGE_KEY = "sql-practice-app-mode";
const EVENT = "sql-practice-app-mode-change";

function read(): AppMode {
  if (typeof window === "undefined") return "ovning";
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "eksamen" ? "eksamen" : "ovning";
}

export function setAppMode(mode: AppMode) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, mode);
  window.dispatchEvent(new CustomEvent(EVENT));
}

function subscribe(cb: () => void) {
  const handler = () => cb();
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function useAppMode(): AppMode {
  const mode = useSyncExternalStore(
    subscribe,
    read,
    () => "ovning" as AppMode,
  );
  // Touch to silence eslint when the var would otherwise look unused in some setups
  useEffect(() => {}, [mode]);
  return mode;
}
