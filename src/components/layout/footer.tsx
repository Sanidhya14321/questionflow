import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-card border-t-[3px] border-black mt-auto shadow-[0_-3px_0_0_#000]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <h3 className="text-xl font-headline font-black text-primary">QuestionFlow</h3>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mt-1">Design. Deliver. Analyze.</p>
            <p className="text-sm text-muted-foreground mt-3">Run assessments, discover skill gaps, and scale learning outcomes.</p>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide mb-2">Quick Links</p>
            <div className="space-y-2 text-sm">
              <Link href="/assessments" className="block hover:text-primary">Assessments</Link>
              <Link href="/assessments/create" className="block hover:text-primary">Host Assessment</Link>
              <Link href="/admin" className="block hover:text-primary">Admin Dashboard</Link>
            </div>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide mb-2">Upcoming</p>
            <p className="text-sm text-muted-foreground">Terminal-based coding assessment mode with automated analysis is coming soon.</p>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t-[2px] border-black/20 text-xs font-semibold uppercase tracking-wide text-muted-foreground text-center">
          &copy; {new Date().getFullYear()} QuestionFlow. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
