
"use client";

import { useState, useEffect } from "react";
import { UserInfo } from "@/components/profile/user-info";
import { AssessmentHistory } from "@/components/profile/assessment-history";
import { RecommendedAssessments } from "@/components/profile/recommended-assessments";
import type { User, AssessmentSummary } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LogIn, UserCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PerfectScoreBadges } from "@/components/profile/perfect-score-badges";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [assessments, setAssessments] = useState<AssessmentSummary[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setIsLoading(true);
      setError(false);
      try {
        // Session, history and catalog requests are independent: one parallel round trip.
        const responses = await Promise.all(["/api/auth/me", "/api/results", "/api/assessments"].map(path => fetch(path, { cache: "no-store", signal: controller.signal })));
        if (responses[0].status === 401) { setUser(null); return; }
        if (responses.some(response => !response.ok)) throw new Error("Profile unavailable");
        const [session, history, catalog] = await Promise.all(responses.map(response => response.json()));
        setUser({ id: session.userId, name: session.name, email: session.email, role: session.role, assessmentHistory: history, interests: ["Computer Science"] });
        setAssessments(catalog);
      } catch {
        if (!controller.signal.aborted) setError(true);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [retry]);

  if (error) return <div role="alert" className="text-center py-16 space-y-4"><h1 className="text-2xl font-headline">Could not load your profile</h1><p>Your saved history is safe. Please try again.</p><Button onClick={() => setRetry(value => value + 1)}>Try again</Button></div>;

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <UserCircle2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading profile...</p>
        </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Alert variant="default" className="max-w-md bg-card">
          <LogIn className="h-6 w-6 inline-block mb-2 text-primary" />
          <AlertTitle className="text-2xl font-headline">Access Your Profile</AlertTitle>
          <AlertDescription className="text-base">
            Please log in or sign up to view your profile and track your progress.
          </AlertDescription>
        </Alert>
        <div className="mt-6 space-x-4">
            <Link href="/login">
                <Button>Login</Button>
            </Link>
            <Link href="/signup">
                <Button variant="outline">Sign Up</Button>
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-headline font-bold text-primary mb-2">
          {`${user.name}'s Profile`}
        </h1>
        <p className="text-lg text-muted-foreground">
          {'View your assessment history and discover new challenges.'}
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-label="Learning overview">
        {[
          ["Completed", (user.assessmentHistory || []).length],
          ["Average score", `${Math.round((user.assessmentHistory || []).reduce((sum, result) => sum + result.scorePercentage, 0) / Math.max(1, (user.assessmentHistory || []).length))}%`],
          ["Best score", `${Math.max(0, ...(user.assessmentHistory || []).map(result => result.scorePercentage))}%`],
        ].map(([label, value]) => <div key={label} className="border-[3px] border-black bg-card rounded-lg p-5 shadow-[4px_4px_0_0_#000]"><p className="text-sm text-muted-foreground">{label}</p><p className="text-3xl font-headline text-primary">{value}</p></div>)}
      </div>
      <UserInfo user={user} />
      <PerfectScoreBadges perfectScoreCount={(user.assessmentHistory || []).filter((entry) => entry.scorePercentage === 100).length} />
      <AssessmentHistory history={user.assessmentHistory || []} />
      <RecommendedAssessments user={user} assessments={assessments} />
      
      <div className="mt-12 text-center">
        <Button variant="outline" disabled>Edit Profile (Coming Soon)</Button>
      </div>
    </div>
  );
}
