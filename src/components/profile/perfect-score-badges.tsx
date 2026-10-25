"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface PerfectScoreBadgesProps {
  perfectScoreCount: number;
}

const TIERS = [1, 5, 10, 25, 50, 100] as const;

export function PerfectScoreBadges({ perfectScoreCount }: PerfectScoreBadgesProps) {
  const nextTier = TIERS.find((tier) => perfectScoreCount < tier) ?? null;

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center">
          <Award className="w-6 h-6 mr-2 text-primary" /> Perfect Score Badges
        </CardTitle>
        <CardDescription>
          Earn badges for scoring 100% on milestones like 5, 10, 25, and 50 assessments.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-[8px] border-[2px] border-black p-3 bg-card-foreground/5">
          <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Perfect Scores</span>
          <span className="text-2xl font-black text-primary">{perfectScoreCount}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {TIERS.map((tier) => {
            const unlocked = perfectScoreCount >= tier;
            return (
              <Badge
                key={tier}
                variant={unlocked ? "default" : "outline"}
                className={cn(
                  "text-xs",
                  unlocked ? "bg-primary text-primary-foreground" : "opacity-70"
                )}
              >
                {tier}x Perfect
              </Badge>
            );
          })}
        </div>

        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Target className="w-4 h-4" />
          {nextTier
            ? `Next badge at ${nextTier} perfect scores.`
            : "All listed badge tiers unlocked. Add custom tiers as needed."}
        </div>
      </CardContent>
    </Card>
  );
}
