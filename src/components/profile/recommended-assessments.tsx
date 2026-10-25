"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { User, AssessmentResult, AvailableAssessmentInfo, UserHistoryEntry, Assessment } from "@/lib/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Brain, Lightbulb } from "lucide-react";
import Image from "next/image";

interface RecommendedAssessmentsProps {
  user: User | null;
  assessments: Assessment[];
}

const findAssessmentByTitle = (assessments: Assessment[], title: string) => {
  return assessments.find((a) => a.title.toLowerCase() === title.toLowerCase());
};

export function RecommendedAssessments({ user, assessments }: RecommendedAssessmentsProps) {
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const userHistory = useMemo<UserHistoryEntry[]>(() => {
    if (!user) return [];

    const history = (user.assessmentHistory || []).map((result: AssessmentResult) => ({
      assessmentCategory: result.category,
      score: result.scorePercentage,
      interests: user.interests?.join(", ") || "General Computer Science",
    }));

    if (history.length === 0 && user.interests && user.interests.length > 0) {
      history.push({
        assessmentCategory: "AI/ML",
        score: 0,
        interests: user.interests.join(", "),
      });
    }

    return history;
  }, [user]);

  useEffect(() => {
    const loadRecommendations = async () => {
      if (!user || userHistory.length === 0 || assessments.length === 0) {
        setRecommendations([]);
        return;
      }

      const availableAssessments: AvailableAssessmentInfo[] = assessments.map((assessment) => ({
        assessmentCategory: assessment.category,
        assessmentTitle: assessment.title,
      }));

      try {
        const response = await fetch("/api/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userHistory, availableAssessments }),
        });

        if (!response.ok) throw new Error("Failed to fetch recommendations");
        const result: { recommendations: string[] } = await response.json();
        setRecommendations(result.recommendations || []);
      } catch (error) {
        console.error("Error fetching assessment recommendations:", error);
        setRecommendations([]);
      }
    };

    loadRecommendations();
  }, [user, userHistory, assessments]);

  if (!user) {
    return null;
  }

  if (userHistory.length === 0) {
    return (
      <Card className="shadow-xl bg-card mt-8">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center">
            <Lightbulb className="w-7 h-7 mr-3 text-primary" /> Assessment Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Take a few assessments or add interests to your profile to get personalized recommendations!
            In the meantime, here are some popular starting points:
          </p>
          <div className="space-y-3">
            {assessments.slice(0, 2).map((assessment) => (
              <Link href={`/assessments/${assessment.id}`} key={assessment.id} className="block p-3 border rounded-md hover:bg-accent/10 transition-colors">
                <h4 className="font-semibold text-foreground">{assessment.title}</h4>
                <p className="text-sm text-muted-foreground">{assessment.category}</p>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const detailedRecommendations = recommendations
    .map((title) => findAssessmentByTitle(assessments, title))
    .filter(Boolean);

  if (detailedRecommendations.length === 0) {
    return (
      <Card className="shadow-xl bg-card mt-8">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center">
            <Lightbulb className="w-7 h-7 mr-3 text-primary" /> Assessment Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            We could not find specific recommendations for you right now. Explore our diverse assessments.
          </p>
          <Link href="/assessments" className="mt-4 inline-block">
            <Button>Browse All Assessments</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl bg-card mt-8">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center">
          <Brain className="w-7 h-7 mr-3 text-primary" /> Recommended For You
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-6">
          Based on your performance and interests, we think you will find these assessments engaging:
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          {detailedRecommendations.map((assessment) =>
            assessment ? (
              <Link href={`/assessments/${assessment.id}`} key={assessment.id}>
                <div className="group p-4 border rounded-lg hover:shadow-lg hover:border-primary transition-all duration-200 h-full flex flex-col justify-between bg-background">
                  <div>
                    <div className="flex items-center mb-2">
                      <Image
                        src={`https://placehold.co/80x80.png?text=${assessment.category.substring(0, 3)}`}
                        alt={assessment.category}
                        width={40}
                        height={40}
                        className="rounded-md mr-3"
                        data-ai-hint={`${assessment.category} icon`}
                      />
                      <div>
                        <h4 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">{assessment.title}</h4>
                        <p className="text-sm text-muted-foreground">{assessment.category}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{assessment.description}</p>
                  </div>
                  <Button variant="link" className="p-0 h-auto text-sm text-primary self-start">
                    Start Assessment
                  </Button>
                </div>
              </Link>
            ) : null
          )}
        </div>
      </CardContent>
    </Card>
  );
}
