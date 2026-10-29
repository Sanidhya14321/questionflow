"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { Pause, Play, ArrowDown, ArrowRight, ArrowUpRight, Asterisk, Brain, Check, Code2, Database, ShieldCheck, Cloud, ScanLine, Sparkles, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { QuizPlayground } from "@/components/home/quiz-playground";

const disciplines = [
  { name: "Web development", note: "From your first tag to your next big idea.", icon: Code2, href: "/assessments/web-dev-fundamentals", className: "subject-blue", number: "01" },
  { name: "AI & machine learning", note: "Make sense of the intelligence behind it all.", icon: Brain, href: "/assessments/intro-to-aiml", className: "subject-pink", number: "02" },
  { name: "Data structures", note: "Build a better way to think through problems.", icon: Database, href: "/assessments/data-structures-advanced", className: "subject-green", number: "03" },
  { name: "Cybersecurity", note: "Get curious about keeping things secure.", icon: ShieldCheck, href: "/assessments/cybersecurity-essentials", className: "subject-blue", number: "04" },
  { name: "Cloud computing", note: "A whole new perspective. No altitude required.", icon: Cloud, href: "/assessments/cloud-computing-fundamentals", className: "subject-pink", number: "05" },
];

export default function HomePage() {
  const reduced = useReducedMotion();
  const marqueeRef = useRef<HTMLDivElement>(null);
  const marqueeVisible = useInView(marqueeRef);
  const [pageVisible, setPageVisible] = useState(true);
  useEffect(() => {
    const updateVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);
  const [motionPaused, setMotionPaused] = useState(false);
  return (
    <div className={`landing-page ${motionPaused ? "motion-paused" : ""}`}>
      <section className="hero-section" aria-labelledby="hero-title">

        <div className="hero-grid">
          <div className="hero-copy">
            <motion.h1 id="hero-title" className="hero-title" initial={{ opacity: 0, y: reduced ? 0 : 35 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}>
              SMALL<br />QUESTIONS.<br /><span className="hero-title-color">BIG <Asterisk className="hero-asterisk" aria-hidden="true" /></span><span className="hero-last-line">BREAKTHROUGHS.</span>
            </motion.h1>
            <Reveal delay={0.1}><p className="hero-description">Turn <span className="underline-marker">“I think I know”</span> into “I’ve got this.” Explore computer science, test your instincts, and find your next aha moment.</p></Reveal>
            <Reveal delay={0.2}><div className="hero-actions"><Button asChild size="lg" className="hero-primary"><Link href="/assessments">Find your challenge <ArrowUpRight /></Link></Button><Link href="/assessments/create" className="text-link">Create an assessment <ArrowRight size={17} /></Link></div></Reveal>
            <div className="hero-footnote"><span>BUILT FOR CURIOUS MINDS.</span><a href="#discover" aria-label="Discover the subjects" className="scroll-cue"><ArrowDown size={16} /></a></div>
          </div>
          <motion.div className="hero-lab" initial={{ opacity: 0, y: reduced ? 0 : 40, rotate: reduced ? 0 : 3 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: reduced ? 0 : 0.85, delay: reduced ? 0 : 0.15, ease: [0.22, 1, 0.36, 1] }}><QuizPlayground /></motion.div>
        </div>
      </section>

      <div ref={marqueeRef} style={{ animationPlayState: marqueeVisible && pageVisible && !motionPaused ? "running" : "paused" }} className="subject-marquee" aria-label="Explore web development, artificial intelligence, data structures, cybersecurity and cloud computing"><div className="marquee-track" aria-hidden="true">{[0, 1].map(copy => <div className="marquee-copy" key={copy}>{["STAY CURIOUS", "THINK BIGGER", "BUILD CONFIDENCE", "FIND YOUR FLOW"].map(item => <span key={item}>{item}<Asterisk /></span>)}</div>)}</div><button className="marquee-toggle" aria-label={motionPaused ? "Resume decorative animations" : "Pause decorative animations"} aria-pressed={motionPaused} onClick={() => setMotionPaused(value => !value)}>{motionPaused ? <Play size={15} /> : <Pause size={15} />}</button></div>

      <section id="discover" className="discovery-section" aria-labelledby="discover-title">
        <Reveal><div className="section-heading"><div><h2 id="discover-title" className="section-title">Pick a rabbit hole.</h2></div><p className="section-description">Five core disciplines.<br />Plenty of room to surprise yourself.</p></div></Reveal>
        <div className="subject-list">{disciplines.map(({ icon: Icon, ...subject }, index) => <Reveal key={subject.number} delay={index * 0.035}><Link href={subject.href} className={`subject-row ${subject.className}`}><span className="subject-number">{subject.number}</span><div className="subject-name"><Icon aria-hidden="true" /><h3>{subject.name}</h3></div><p>{subject.note}</p><span className="subject-arrow"><ArrowUpRight aria-hidden="true" /></span></Link></Reveal>)}</div>
        <Reveal><Link href="/assessments" className="text-link mt-7">Or explore the entire collection <ArrowRight size={18} /></Link></Reveal>
      </section>

      <section className="process-section" aria-labelledby="process-title">
        <Reveal><div className="section-heading"><div><h2 id="process-title" className="section-title">Less guessing.<br />More growing.</h2></div><p className="section-description">A good question changes how you think.<br />Here’s where it takes you.</p></div></Reveal>
        <div className="process-grid">
          <Reveal className="process-card process-card-first"><div className="process-card-top"><span className="micro-label">01 — DISCOVER</span><ScanLine size={22} /></div><div className="discovery-art" aria-hidden="true"><span className="art-tag">&lt;/&gt; WEB</span><span className="art-tag">✳ AI / ML</span><span className="art-tag">[ ] DATA</span><span className="art-selector">YOUR NEXT CHALLENGE <ArrowUpRight size={17} /></span></div><h3>Find your starting point.</h3><p>Follow an interest. Revisit a blind spot. Choose a challenge that meets you where you are.</p></Reveal>
          <Reveal className="process-card process-card-second" delay={0.08}><div className="process-card-top"><span className="micro-label">02 — CHALLENGE</span><Target size={22} /></div><div className="challenge-art" aria-hidden="true"><span className="art-check"><Check size={46} strokeWidth={3} /></span><span className="art-ring ring-one" /><span className="art-ring ring-two" /><span className="art-small-label">ONE QUESTION AT A TIME.</span></div><h3>Make your move.</h3><p>Think it through, pick your answer, and keep going. Your progress stays in sight.</p></Reveal>
          <Reveal className="process-card process-card-third" delay={0.16}><div className="process-card-top"><span className="micro-label">03 — GROW</span><TrendingUp size={22} /></div><div className="growth-art" aria-hidden="true">{[35, 55, 45, 75, 95].map((height, i) => <span key={i} style={{ height: `${height}%` }} />)}<ArrowUpRight className="art-growth-arrow" /></div><h3>Connect the dots.</h3><p>Review every answer, spot your strengths, and turn feedback into your next step.</p></Reveal>
        </div>
      </section>

      <section className="creator-section" aria-labelledby="creator-title">
        <Reveal className="creator-art" ><div className="creator-paper"><span className="micro-label">IDEA → ASSESSMENT</span><div className="paper-line" /><div className="paper-line short" /><div className="paper-answer"><Check size={19} /> A QUESTION WORTH ASKING</div><div className="paper-line" /><Asterisk className="paper-spark" aria-hidden="true" /></div><div className="creator-stamp"><Sparkles size={22} /><span>YOUR IDEAS.<br />TAKE FLIGHT.</span></div></Reveal>
        <Reveal className="creator-copy"><h2 id="creator-title" className="section-title">Great questions<br />start with you.</h2><p>Got something worth testing? Build an assessment for your community, or let AI help turn a topic into a fresh set of questions.</p><Button asChild size="lg"><Link href="/assessments/create">Make something challenging <ArrowUpRight /></Link></Button><span className="creator-note">Curated. Community-made. AI-assisted.</span></Reveal>
      </section>

      <Reveal><section className="final-cta" aria-labelledby="cta-title"><h2 id="cta-title">GET INTO<br /><span>YOUR FLOW.</span><Asterisk aria-hidden="true" className="cta-asterisk" /></h2><div className="cta-bottom"><p>Bring your curiosity.<br />We’ll bring the questions.</p><Button asChild size="lg" className="cta-button"><Link href="/assessments">Let’s do this <ArrowUpRight /></Link></Button></div></section></Reveal>
    </div>
  );
}
