
"use client";

import { useState, useEffect, useRef } from "react";
import type { Assessment, AssessmentResult } from "@/lib/types";
import { QuestionDisplay } from "./question-display";
import { AssessmentResults } from "./assessment-results";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckSquare, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

async function saveAssessmentResult(result: AssessmentResult, submissionId: string): Promise<AssessmentResult> {
  const response = await fetch("/api/results", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assessmentId: result.assessmentId, answers: result.answers, submissionId }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.message || "Failed to save result");
  }
  return response.json();
}


interface InteractiveAssessmentProps {
  assessment: Assessment;
}

export function InteractiveAssessment({ assessment }: InteractiveAssessmentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>(
    new Array(assessment.questions.length).fill(null)
  );
  const submissionId = useRef<string | null>(null);
  const submissionLock = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const { toast } = useToast();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      if (!response.ok) {
        setCurrentUserId("guestUser");
        return;
      }
      const session: { userId: string } = await response.json();
      setCurrentUserId(session.userId);
    };

    void loadSession().catch(() => setCurrentUserId("guestUser"));
  }, []);

  const currentQuestion = assessment.questions[currentQuestionIndex];
  const answeredCount = userAnswers.filter(answer => answer !== null).length;
  const progressPercentage = (answeredCount / assessment.questions.length) * 100;

  const handleAnswerSelect = (answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (userAnswers[currentQuestionIndex] === null) {
      toast({
        title: "No Answer Selected",
        description: "Please select an answer before proceeding.",
        variant: "destructive",
      });
      return;
    }
    if (currentQuestionIndex < assessment.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitAssessment = async () => {
    if (submissionLock.current || currentUserId === null) return;
    if (userAnswers.some(ans => ans === null)) {
         toast({
            title: "Incomplete Assessment",
            description: "Please answer all questions before submitting.",
            variant: "destructive",
        });
        return;
    }

    let correctAnswersCount = 0;
    const mappedAnswers = assessment.questions.map((q, index) => {
      if (userAnswers[index] === q.correctAnswer) {
        correctAnswersCount++;
      }
      return { questionId: q.id, selectedAnswer: userAnswers[index]! };
    });

    const scorePercentage = Math.round((correctAnswersCount / assessment.questions.length) * 100);

    const result: AssessmentResult = {
      assessmentId: assessment.id,
      assessmentTitle: assessment.title,
      category: assessment.category,
      userId: currentUserId,
      scorePercentage,
      answers: mappedAnswers,
      completedAt: new Date().toISOString(),
    };

    submissionLock.current = true;
    setIsSubmitting(true);
    try {
      // Guests can practice; only authenticated results are persisted.
      submissionId.current ??= crypto.randomUUID();
      const savedResult = currentUserId !== "guestUser" ? await saveAssessmentResult(result, submissionId.current) : result;
      setAssessmentResult(savedResult);
      setIsCompleted(true);
      toast({
        title: "Assessment Submitted!",
        description: `You scored ${savedResult.scorePercentage}%.`,
      });
    } catch (error) {
      toast({
        title: "Error Submitting",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      submissionLock.current = false;
      setIsSubmitting(false);
    }
  };

  const handleRetakeAssessment = () => {
    submissionId.current = null;
    setCurrentQuestionIndex(0);
    setUserAnswers(new Array(assessment.questions.length).fill(null));
    setIsCompleted(false);
    setAssessmentResult(null);
  };

  if (isCompleted && assessmentResult) {
    return (
      <AssessmentResults
        assessment={assessment}
        result={assessmentResult}
        onRetake={handleRetakeAssessment}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="assessment-workspace max-w-3xl mx-auto space-y-8"
    >
      <header className="text-left">

        <h1 className="text-3xl sm:text-4xl font-headline tracking-tight text-primary mb-3">{assessment.title}</h1>
        <p className="text-muted-foreground">{assessment.description}</p>
      </header>

      <div className="space-y-2">
        <Progress aria-label="Questions answered" value={progressPercentage} className="w-full h-2.5" />
        <p className="text-sm text-muted-foreground text-right">
          {answeredCount} of {assessment.questions.length} answered · Question {currentQuestionIndex + 1}
        </p>
      </div>

      <nav aria-label="Question navigator" className="flex flex-wrap gap-2">
        {assessment.questions.map((question, index) => (
          <Button key={question.id} size="sm" variant={index === currentQuestionIndex ? "default" : "outline"}
            disabled={isSubmitting} aria-current={index === currentQuestionIndex ? "step" : undefined}
            aria-label={`Question ${index + 1}, ${userAnswers[index] === null ? "unanswered" : "answered"}`}
            onClick={() => setCurrentQuestionIndex(index)}>
            {index + 1}{userAnswers[index] !== null ? " ✓" : ""}
          </Button>
        ))}
      </nav>
      <AnimatePresence mode="wait" initial={false}>
        <QuestionDisplay
          key={currentQuestion.id}
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={assessment.questions.length}
          selectedAnswer={userAnswers[currentQuestionIndex]}
          onAnswerSelect={handleAnswerSelect}
        />
      </AnimatePresence>

      {currentUserId === "guestUser" && <p className="text-sm text-muted-foreground">Practice mode: sign in before starting to save results to your profile.</p>}
      <div className="flex flex-wrap gap-4 justify-between items-center pt-6 border-t">
        <Button
          variant="outline"
          onClick={handlePreviousQuestion}
          disabled={isSubmitting || currentQuestionIndex === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Previous
        </Button>

        {currentQuestionIndex === assessment.questions.length - 1 ? (
          <Button
            onClick={handleSubmitAssessment}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={isSubmitting || currentUserId === null || userAnswers[currentQuestionIndex] === null}
          >
            {isSubmitting ? <>Saving… <Loader2 className="w-4 h-4 animate-spin" /></> : <>Submit Assessment <CheckSquare className="w-4 h-4 ml-2" /></>}
          </Button>
        ) : (
          <Button
            onClick={handleNextQuestion}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={isSubmitting || currentUserId === null || userAnswers[currentQuestionIndex] === null}
          >
            Next <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}
