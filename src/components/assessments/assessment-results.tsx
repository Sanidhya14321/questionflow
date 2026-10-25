"use client";

import { useEffect, useRef } from "react";
import type { Assessment, AssessmentResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, RotateCcw, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface AssessmentResultsProps {
  assessment: Assessment;
  result: AssessmentResult;
  onRetake: () => void;
}

export function AssessmentResults({ assessment, result, onRetake }: AssessmentResultsProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    headingRef.current?.scrollIntoView({ block: "start" });
  }, []);
  const correctAnswersCount = assessment.questions.filter(
    (q, index) => result.answers[index]?.selectedAnswer === q.correctAnswer
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-2xl mx-auto shadow-2xl">
        <CardHeader className="text-center">
          <h1 ref={headingRef} tabIndex={-1} className="text-3xl sm:text-4xl font-headline text-primary scroll-mt-24">Assessment Completed!</h1>
          <CardDescription className="text-lg text-muted-foreground">
            You scored {result.scorePercentage}% on &quot;{assessment.title}&quot;
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  className="text-border"
                  stroke="currentColor"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeWidth="3"
                />
                <path
                  className="text-primary"
                  stroke="currentColor"
                  strokeDasharray={`${result.scorePercentage}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold">{result.scorePercentage}%</span>
              </div>
            </div>
            <p className="mt-4 text-xl">
              You answered {correctAnswersCount} out of {assessment.questions.length} questions correctly.
            </p>
          </div>

          <Progress value={result.scorePercentage} className="w-full h-3" />

          <div>
            <h3 className="text-xl font-semibold mb-3">Review Your Answers:</h3>
            <div className="max-h-60 overflow-y-auto space-y-3 pr-2 rounded-md border p-4 bg-background">
              {assessment.questions.map((question, index) => {
                const userAnswer = result.answers.find(a => a.questionId === question.id)?.selectedAnswer;
                const isCorrect = userAnswer === question.correctAnswer;
                return (
                  <div key={question.id} className="p-3 border rounded-md bg-card/50">
                    <p className="font-medium text-sm mb-1">{index + 1}. {question.questionText}</p>
                    <div className="flex items-center text-xs">
                      {isCorrect ? (
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-2 text-red-500" />
                      )}
                      <span className={isCorrect ? 'text-green-500' : 'text-red-500'}>
                        Your answer: {userAnswer || "Not answered"}
                      </span>
                    </div>
                    {!isCorrect && (
                      <p className="text-xs text-muted-foreground mt-1">Correct answer: {question.correctAnswer}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
            <Button onClick={onRetake} variant="outline" className="flex-1">
              <RotateCcw className="w-4 h-4 mr-2" /> Retake Assessment
            </Button>
            <Link href="/assessments" className="flex-1">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Explore Other Assessments <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
