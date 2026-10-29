
"use client";

import Link from "next/link";
import { finishAuthTransition } from "@/lib/auth/client";
import { AnimatePresence, motion, useScroll, useSpring, useReducedMotion } from "framer-motion";
import { Menu, X, Home, BookOpenCheck, UserCircle, ShieldCheck, LogIn, UserPlus, LogOut, PlusSquare, Sparkles } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { NAV_LINKS } from "@/lib/constants";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ModeSwitcher } from "@/components/layout/mode-switcher";

type AuthRole = 'user' | 'admin' | null;

const useAuth = (refreshKey: string) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [authRole, setAuthRole] = useState<AuthRole>(null);

  useEffect(() => {
    const controller = new AbortController();
    const updateAuthState = async () => {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store", signal: controller.signal });
        if (controller.signal.aborted) return;
        if (response.status === 401) {
          setCurrentUserId(null);
          setAuthRole(null);
          return;
        }

        if (!response.ok) return;
        const session: { userId: string; role: "user" | "admin" } = await response.json();
        if (controller.signal.aborted) return;
        setCurrentUserId(session.userId);
        setAuthRole(session.role);
      } catch {
        // A temporary network failure is not proof that the session ended.
      }
    };

    void updateAuthState();
    window.addEventListener("questionflow:auth", updateAuthState);
    return () => { controller.abort(); window.removeEventListener("questionflow:auth", updateAuthState); };
  }, [refreshKey]);


  return { isAuthenticated: !!currentUserId, role: authRole, userId: currentUserId };
};


const iconMap: { [key: string]: React.ElementType } = {
  Home,
  BookOpenCheck,
  UserCircle,
  ShieldCheck,
  PlusSquare,
};

export function Navbar() {
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 180, damping: 30 });
  const reduced = useReducedMotion();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, role } = useAuth(pathname);
  const { toast } = useToast();


  const handleLogout = async () => {
    const response = await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    if (!response?.ok) {
      toast({ title: "Logout failed", description: "Please try again.", variant: "destructive" });
      return;
    }
    window.dispatchEvent(new Event("questionflow:auth"));
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    // Clear all client route caches so Back cannot restore an authenticated test.
    finishAuthTransition("/");
    if (isMobileMenuOpen) closeMobileMenu();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  }

  const filteredNavLinks = NAV_LINKS.filter(link => {
    if (role === 'admin' && link.href === '/') {
      return false;
    }
    if (link.adminOnly) {
      return isAuthenticated && role === 'admin';
    }
    if (link.href === '/assessments/create') {
      return isAuthenticated;
    }
    if (link.href === '/profile') {
      return isAuthenticated && role !== 'admin';
    }
    return true;
  });

  const activeHref = filteredNavLinks.filter(link => pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href + "/"))).sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <nav aria-label="Main navigation" onKeyDown={event => { if (event.key === "Escape") { closeMobileMenu(); menuTrigger.current?.focus(); } }} className="site-nav bg-card border-b-[3px] border-black sticky top-0 z-50">
      <div className="site-nav-inner mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between gap-5 h-20">
          <div className="flex-shrink-0">
            <Link href="/" className="text-[23px] sm:text-[26px] font-headline tracking-[-0.04em] text-primary">
              QuestionFlow
            </Link>
            <p className="hidden 2xl:flex items-center text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground mt-1">
              <Sparkles className="w-3 h-3 mr-1" /> Design. Deliver. Analyze.
            </p>
          </div>

          <div className="hidden xl:flex items-center gap-1">
            {filteredNavLinks.map((link) => {
              const IconComponent = iconMap[link.icon];
              const isActive = activeHref === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "nav-item relative inline-flex items-center px-3 py-2.5 rounded-[5px] text-[11px] font-bold uppercase tracking-wide transition-colors border-[2px] border-transparent",
                    isActive
                      ? "bg-primary text-primary-foreground border-black shadow-[3px_3px_0_0_#000]"
                      : "text-foreground hover:bg-secondary hover:border-black"
                  )}
                >
                  {IconComponent && <IconComponent className="w-4 h-4 mr-2" />}
                  {link.label}
                </Link>
              );
            })}
          </div>
          
          <div className="hidden xl:flex items-center gap-2">
            <ModeSwitcher />
            {isAuthenticated ? (
              <>
                 {role === 'user' && (
                  <Link href="/profile">
                    <Button variant="outline" className="text-sm">
                      <UserCircle className="w-5 h-5 mr-2" />
                      My Profile
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" className="text-sm" onClick={handleLogout}>
                  <LogOut className="w-5 h-5 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-sm">
                    <LogIn className="w-5 h-5 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="default" className="text-sm bg-primary hover:bg-primary/90 text-primary-foreground">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="xl:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              ref={menuTrigger}
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
              className="text-foreground/80 hover:text-primary"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
      {isMobileMenuOpen && (
        <motion.div id="mobile-navigation" initial={{ opacity: 0, y: reduced ? 0 : -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : -10 }} transition={{ duration: reduced ? 0 : 0.2 }} className="mobile-nav xl:hidden absolute top-20 left-0 right-0 bg-card border-b-[3px] border-black z-40 pb-4">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {filteredNavLinks.map((link) => {
              const IconComponent = iconMap[link.icon];
              const isActive = activeHref === link.href;
              return (
              <Link
                key={link.label}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                onClick={closeMobileMenu}
                className={cn(
                  "flex items-center px-3 py-3 rounded-[6px] text-base font-bold uppercase tracking-wide transition-colors duration-150 ease-in-out border-[2px] border-transparent",
                  isActive
                    ? "bg-primary text-primary-foreground border-black shadow-[3px_3px_0_0_#000]"
                    : "text-foreground hover:bg-secondary hover:border-black"
                )}
              >
                {IconComponent && <IconComponent className="w-5 h-5 mr-3" />}
                {link.label}
              </Link>
            );
            })}
          </div>
          <div className="pt-4 pb-3 border-t border-border/50">
             <div className="px-5 mb-3">
              <ModeSwitcher />
             </div>
             {isAuthenticated ? (
               <>
                {role !== 'admin' && (
                  <Link href="/profile" onClick={closeMobileMenu} className="flex items-center px-5 py-2 text-base font-medium text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-md">
                    <UserCircle className="w-5 h-5 mr-3" /> My Profile
                  </Link>
                )}
                <Button variant="ghost" className="w-full justify-start text-base font-medium px-5 py-3 text-foreground/80 hover:text-primary hover:bg-primary/5" onClick={handleLogout}>
                    <LogOut className="w-5 h-5 mr-3" /> Logout
                </Button>
               </>
             ) : (
               <div className="space-y-1 px-2">
                 <Link href="/login" onClick={closeMobileMenu}>
                    <Button variant="outline" className="w-full justify-start text-base py-3">
                        <LogIn className="w-5 h-5 mr-3" /> Login
                    </Button>
                 </Link>
                  <Link href="/signup" onClick={closeMobileMenu}>
                    <Button variant="default" className="w-full justify-start text-base py-3 bg-primary hover:bg-primary/90 text-primary-foreground">
                        <UserPlus className="w-5 h-5 mr-3" /> Sign Up
                    </Button>
                 </Link>
               </div>
             )}
          </div>
        </motion.div>
      )}
      </AnimatePresence>
      <motion.div aria-hidden="true" className="scroll-progress" style={{ scaleX: reduced ? scrollYProgress : progress }} />
    </nav>
  );
}
