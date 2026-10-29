"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main role="alert" className="max-w-xl mx-auto px-6 py-24 text-center space-y-6">
    <h1 className="font-headline text-3xl">Something interrupted your flow</h1>
    <p className="text-muted-foreground">We could not load this page. Please try again in a moment.</p>
    <div className="flex flex-wrap justify-center gap-4"><Button onClick={reset}>Try again</Button><Button asChild variant="outline"><Link href="/">Back home</Link></Button></div>
  </main>;
}
