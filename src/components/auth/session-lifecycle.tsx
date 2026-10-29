"use client";

import { useEffect } from "react";
import { AUTH_CHANGE_KEY } from "@/lib/auth/client";

export function SessionLifecycle() {
  useEffect(() => {
    // Back/Forward may restore a complete document without making a server request.
    const restore = (event: PageTransitionEvent) => { if (event.persisted) window.location.reload(); };
    const sync = (event: StorageEvent) => { if (event.key === AUTH_CHANGE_KEY) window.location.reload(); };
    window.addEventListener("pageshow", restore);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener("pageshow", restore); window.removeEventListener("storage", sync); };
  }, []);
  return null;
}
