import Link from "next/link";
import { ArrowUpRight, Asterisk } from "lucide-react";

export function Footer() {
  return (
    <footer className="site-footer bg-card border-t-[3px] border-black mt-auto">
      <div className="footer-inner mx-auto px-5 sm:px-8 lg:px-12">
        <div className="footer-top"><Link href="/" className="footer-wordmark">QuestionFlow<Asterisk aria-hidden="true" /></Link><p>A little curiosity.<br />A whole lot of possibility.</p></div>
        <div className="footer-middle"><span className="micro-label">DESIGN. DELIVER. ANALYZE.</span><div className="flex flex-wrap gap-x-8 gap-y-4"><Link href="/assessments">Explore <ArrowUpRight size={14} /></Link><Link href="/assessments/create">Create <ArrowUpRight size={14} /></Link><Link href="/profile">Your progress <ArrowUpRight size={14} /></Link></div><Asterisk className="text-primary" size={28} aria-hidden="true" /></div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} QUESTIONFLOW</span><span>BUILT FOR THE NEXT AHA.</span><span>STAY CURIOUS. KEEP GOING. ↗</span></div>
      </div>
    </footer>
  );
}
