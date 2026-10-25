
"use client";

import { useState, useEffect } from "react";
import { UserInfo } from "@/components/profile/user-info";
import { AssessmentHistory } from "@/components/profile/assessment-history";
import { RecommendedAssessments } from "@/components/profile/recommended-assessments";
import type { User, AssessmentResult, Assessment } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LogIn, UserCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PerfectScoreBadges } from "@/components/profile/perfect-score-badges";

async function getUserData(userId: string): Promise<User | null> {
  const [sessionResponse, historyResponse] = await Promise.all([
    fetch("/api/auth/me", { cache: "no-store" }),
    fetch(`/api/results?userId=${encodeURIComponent(userId)}`, { cache: "no-store" }),
  ]);

  if (!sessionResponse.ok) return null;
  const session = (await sessionResponse.json()) as { userId: string; name: string; email: string; role: "user" | "admin" };
  const history: AssessmentResult[] = historyResponse.ok ? await historyResponse.json() : [];

  return {
    id: session.userId,
    name: session.name,
    email: session.email,
    role: session.role,
    assessmentHistory: history,
    interests: session.role === "admin" ? ["Site Management", "Assessment Quality"] : ["Learning New Technologies", "Problem Solving"],
  };
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  useEffect(() => {
    const loadSession = async () => {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      if (!response.ok) {
        setCurrentUserId(null);
        return;
      }
      const session: { userId: string } = await response.json();
      setCurrentUserId(session.userId);
    };

    loadSession();
  }, []);

  useEffect(() => {
    const loadAssessments = async () => {
      try {
        const response = await fetch("/api/assessments", { cache: "no-store" });
        if (!response.ok) throw new Error();
        const data: Assessment[] = await response.json();
        setAssessments(data);
      } catch {
        setAssessments([]);
      }
    };

    loadAssessments();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUserId) {
        setIsLoading(true);
        const data = await getUserData(currentUserId);
        setUser(data);
        setIsLoading(false);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    };
    
    // Only fetch if currentUserId has been determined (either null or a string)
    if (currentUserId !== undefined) {
        fetchUserData();
    }

  }, [currentUserId]);

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
