"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Contrast, Monitor, Moon, Sun } from "lucide-react";

type Mode = "system" | "light" | "dark" | "contrast";
const STORAGE_KEY = "questionflow_mode";

function applyMode(mode: Mode) {
  const root = document.documentElement;
  root.classList.remove("dark", "contrast");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const effectiveMode = mode === "system" ? (prefersDark ? "dark" : "light") : mode;

  if (effectiveMode === "dark") root.classList.add("dark");
  if (mode === "contrast") root.classList.add("contrast");
}

function readMode(): Mode {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "contrast" ? stored : "system";
}

function subscribeMode(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("questionflow:mode", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("questionflow:mode", onChange);
  };
}

export function ModeSwitcher() {
  const mode = useSyncExternalStore(subscribeMode, readMode, () => "system" as Mode);

  useEffect(() => {
    applyMode(mode);
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => { if (mode === "system") applyMode(mode); };
    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, [mode]);

  const changeMode = (next: Mode) => {
    localStorage.setItem(STORAGE_KEY, next);
    window.dispatchEvent(new Event("questionflow:mode"));
  };

  const label =
    mode === "system"
      ? "System"
      : mode === "dark"
      ? "Dark"
      : mode === "contrast"
      ? "High Contrast"
      : "Light";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          Theme: {label}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 border-[2px] border-black">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => changeMode("system")} className="font-semibold">
          <Monitor className="h-4 w-4" />
          System
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeMode("light")} className="font-semibold">
          <Sun className="h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeMode("dark")} className="font-semibold">
          <Moon className="h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeMode("contrast")} className="font-semibold">
          <Contrast className="h-4 w-4" />
          High Contrast
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
