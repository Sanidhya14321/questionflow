"use client";

import { useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { Asterisk, ArrowUpRight, ArrowRight, Check, RotateCcw, Sparkles, X } from "lucide-react";

const questions = [
  { category: "WEB DEVELOPMENT", question: "What does CSS stand for?", options: ["Creative Style System", "Cascading Style Sheets", "Computer Style Syntax"], answer: 1, explanation: "CSS controls how a webpage looks. The cascade decides which styles take priority." },
  { category: "DATA STRUCTURES", question: "Which structure follows last in, first out?", options: ["A queue", "A linked list", "A stack"], answer: 2, explanation: "A stack works like a pile of books: the last thing you add is the first thing you remove." },
  { category: "CLOUD COMPUTING", question: "What does SaaS stand for?", options: ["Software as a Service", "Storage as a System", "Security as a Service"], answer: 0, explanation: "SaaS delivers software over the internet, without a local installation to manage." },
];

export function QuizPlayground() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [complete, setComplete] = useState(false);
  const reduced = useReducedMotion();
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(tiltX, { stiffness: 100, damping: 25 });
  const rotateY = useSpring(tiltY, { stiffness: 100, damping: 25 });
  const question = questions[index];

  function select(answer: number) {
    if (selected !== null) return;
    setSelected(answer);
    if (answer === question.answer) setScore(value => value + 1);
  }
  function next() {
    if (index === questions.length - 1) { setComplete(true); return; }
    setIndex(value => value + 1); setSelected(null);
  }

  return (
    <motion.div className="playground-wrap" style={{ rotateX: reduced ? 0 : rotateX, rotateY: reduced ? 0 : rotateY, transformPerspective: 1000 }} onPointerMove={event => {
      if (reduced || event.pointerType !== "mouse") return;
      const bounds = event.currentTarget.getBoundingClientRect();
      tiltY.set(((event.clientX - bounds.left) / bounds.width - .5) * 5);
      tiltX.set(-((event.clientY - bounds.top) / bounds.height - .5) * 5);
    }} onPointerLeave={() => { tiltX.set(0); tiltY.set(0); }}>
      <div className="playground-sticker" aria-hidden="true"><Sparkles size={18} /> LESS SCROLL.<br />MORE AHA.</div>
      <div className="playground-window">
        <div className="playground-toolbar"><div className="flex gap-1.5" aria-hidden="true"><i /><i /><i /></div><span>THE QUESTION LAB</span><ArrowUpRight size={14} /></div>
        <div className="playground-body">
          <p className="sr-only" aria-live="polite">{complete ? "Preview complete. Score: " + score + " out of 3." : "Preview question " + (index + 1) + ": " + question.question}</p>
          <div className="flex items-center justify-between gap-3 mb-7"><span className="micro-label text-muted-foreground">INTERACTIVE PREVIEW</span><span className="micro-label">{complete ? "COMPLETE" : `0${index + 1} / 03`}</span></div>
          <AnimatePresence mode="wait" initial={false}>
            {complete ? (
              <motion.div key="complete" initial={{ opacity: 0, y: reduced ? 0 : 16 }} animate={{ opacity: 1, y: 0 }} className="min-h-[310px] flex flex-col items-center justify-center text-center gap-5">
                <span className="demo-score">{score}<span>/3</span></span>
                <h3 className="text-2xl">That’s your first aha.</h3>
                <p className="text-muted-foreground text-sm max-w-xs">A little curiosity goes a long way. Your next challenge is waiting.</p>
                <button className="demo-next" onClick={() => { setIndex(0); setSelected(null); setScore(0); setComplete(false); }}><RotateCcw size={16} /> Play again</button>
              </motion.div>
            ) : (
              <motion.div key={question.question} initial={{ opacity: 0, x: reduced ? 0 : 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: reduced ? 0 : -14 }} transition={{ duration: reduced ? 0 : 0.2 }}>
                <p className="micro-label text-primary mb-3">{question.category}</p>
                <h3 className="demo-question">{question.question}</h3>
                <div className="space-y-2.5 mt-6" role="group" aria-label={question.question}>
                  {question.options.map((option, i) => (
                    <button key={option} aria-pressed={selected === i} disabled={selected !== null} onClick={() => select(i)} className={`demo-option ${selected !== null && i === question.answer ? "is-correct" : ""} ${selected === i && i !== question.answer ? "is-wrong" : ""}`}>
                      <span className="demo-option-letter">{String.fromCharCode(65 + i)}</span><span>{option}</span>
                      {selected !== null && i === question.answer ? <Check className="ml-auto shrink-0" size={17} /> : selected === i ? <X className="ml-auto shrink-0" size={17} /> : null}
                    </button>
                  ))}
                </div>
                <div className="demo-feedback" aria-live="polite">
                  {selected !== null ? <><p>{question.explanation}</p><button className="demo-next" onClick={next}>{index === 2 ? "See my score" : "Next question"}<ArrowRight size={16} /></button></> : <p className="text-muted-foreground">Go on. Pick an answer.</p>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="playground-bottom"><span className="status-dot" /> NO TIMER. NO PRESSURE. JUST CURIOSITY.</div>
      </div>
      <Asterisk className="playground-orbit" aria-hidden="true" />
    </motion.div>
  );
}
