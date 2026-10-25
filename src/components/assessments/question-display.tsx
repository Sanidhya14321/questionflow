"use client";

import { useEffect, useRef } from "react";
import type { Question } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

interface QuestionDisplayProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  onAnswerSelect: (answer: string) => void;
}

export function QuestionDisplay({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
}: QuestionDisplayProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); }, [question.id]);
  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="p-6 bg-card rounded-lg shadow-lg"
    >
      <p className="text-sm text-primary mb-2 font-medium">
        Question {questionNumber} of {totalQuestions}
      </p>
      <h2 ref={headingRef} tabIndex={-1} id={`question-${question.id}`} className="text-2xl font-headline font-semibold mb-6">{question.questionText}</h2>
      
      <RadioGroup
        aria-labelledby={`question-${question.id}`}
        value={selectedAnswer || ""}
        onValueChange={onAnswerSelect}
        className="space-y-4"
      >
        {question.options.map((option, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.04 }}
          >
            <Label
              htmlFor={`${question.id}-option-${index}`}
              className={`flex items-center p-4 border rounded-md cursor-pointer transition-all duration-150 ease-in-out
                ${selectedAnswer === option 
                  ? 'bg-primary/10 border-primary ring-2 ring-primary' 
                  : 'hover:bg-accent/10 hover:border-accent'
                }`}
            >
              <RadioGroupItem value={option} id={`${question.id}-option-${index}`} className="mr-3" />
              <span className="text-base">{option}</span>
            </Label>
          </motion.div>
        ))}
      </RadioGroup>
    </motion.div>
  );
}
