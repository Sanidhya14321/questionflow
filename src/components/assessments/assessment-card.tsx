
"use client";

import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AssessmentSummary } from "@/lib/types";
import { ArrowUpRight, Brain, Code, Database, Shield, Cloud, Clock, ThumbsUp, ThumbsDown } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

interface AssessmentCardProps {
  assessment: AssessmentSummary;
}

const categoryIcons: { [key: string]: React.ElementType } = {
  'AI/ML': Brain,
  'Web Development': Code,
  'Data Structures': Database,
  'Cybersecurity': Shield,
  'Cloud Computing': Cloud,
};

export function AssessmentCard({ assessment }: AssessmentCardProps) {
  const reduced = useReducedMotion();
  const { toast } = useToast();
  const [isVoting, setIsVoting] = useState(false);
  const IconComponent = categoryIcons[assessment.category] || Code;
  const [upvotes, setUpvotes] = useState(assessment.upvotes);
  const [downvotes, setDownvotes] = useState(assessment.downvotes);

  const submitVote = async (voteType: "up" | "down") => {
    if (isVoting) return;
    setIsVoting(true);
    try {
      const response = await fetch(`/api/assessments/${assessment.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message || "Unable to save vote. Please try again.");
      }
      const payload: { upvotes: number; downvotes: number } = await response.json();
      setUpvotes(payload.upvotes);
      setDownvotes(payload.downvotes);
    } catch (error) {
      toast({ title: "Vote not saved", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    } finally {
      setIsVoting(false);
    }
  };

  const handleUpvote = (e: React.MouseEvent) => {
    e.preventDefault();
    submitVote("up");
  };

  const handleDownvote = (e: React.MouseEvent) => {
    e.preventDefault();
    submitVote("down");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : 0.35 }}
      whileHover={reduced ? undefined : { y: -5 }}
      className="h-full"
    >
      <Card className="assessment-tile group flex flex-col h-full overflow-hidden bg-card">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="assessment-icon"><IconComponent className="w-6 h-6" /></div>
            <span className="micro-label text-muted-foreground">{assessment.isPredefined ? "CURATED" : assessment.isAIGenerated ? "AI ASSISTED" : "COMMUNITY"}</span>
          </div>
          <p className="micro-label text-primary mb-2">{assessment.category}</p>
          <CardTitle className="assessment-title">{assessment.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow pb-6">
          <CardDescription className="text-muted-foreground text-sm leading-relaxed line-clamp-3">{assessment.description}</CardDescription>
        </CardContent>
        <CardFooter className="tile-footer flex flex-wrap gap-3 justify-between items-center border-t">
          {assessment.isPredefined ? (
            <span className="flex items-center gap-2 text-xs text-muted-foreground"><Clock size={14} />{assessment.durationMinutes ? `${assessment.durationMinutes} MIN` : "SELF PACED"}</span>
          ) : (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" disabled={isVoting} aria-label={`Upvote ${assessment.title}: ${upvotes} votes`} onClick={handleUpvote} className="px-2 text-muted-foreground"><ThumbsUp size={14} /> {upvotes}</Button>
              <Button variant="ghost" size="sm" disabled={isVoting} aria-label={`Downvote ${assessment.title}: ${downvotes} votes`} onClick={handleDownvote} className="px-2 text-muted-foreground"><ThumbsDown size={14} /> {downvotes}</Button>
            </div>
          )}
          <Link href={`/assessments/${assessment.id}`} aria-label={`Start ${assessment.title}`} className="tile-start">LET’S GO <ArrowUpRight size={18} /></Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
