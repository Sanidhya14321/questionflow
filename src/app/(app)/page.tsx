"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Brain, Lightbulb, UserCheck, ShieldCheck, TerminalSquare } from "lucide-react";
import Image from "next/image";

const FeatureCard = ({ icon: Icon, title, description, delay }: { icon: React.ElementType, title: string, description: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.4, delay: delay * 0.25 }}
  >
    <Card className="h-full hover:shadow-primary/20 hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Icon className="w-10 h-10 text-primary" />
        <CardTitle className="font-headline text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  </motion.div>
);

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center py-16 md:py-24 bg-gradient-to-b from-background to-card rounded-xl shadow-xl"
      >
        <div className="container mx-auto px-4">
          <motion.h1 
            className="text-3xl sm:text-5xl md:text-7xl break-words font-headline font-extrabold mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Welcome to <span className="text-primary">QuestionFlow</span>
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Design. Deliver. Analyze. Host assessments, run skill checks, and review deep performance insights.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link href="/assessments">
              <Button size="lg" className="text-sm sm:text-lg px-4 sm:px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground">
                Explore Assessments <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/assessments/create">
              <Button size="lg" variant="outline" className="text-sm sm:text-lg px-4 sm:px-8 py-6">
                Host An Assessment
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      <section className="py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <TerminalSquare className="w-6 h-6" /> Upcoming Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Terminal-based coding test and analysis is planned and will be integrated as a future release.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <h2 className="text-4xl font-headline font-bold text-center mb-12">
          Why Choose <span className="text-primary">QuestionFlow</span>?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={Lightbulb}
            title="Diverse Assessments"
            description="Explore a wide range of assessments in AI/ML, Web Development, Data Structures, and more."
            delay={0.2}
          />
          <FeatureCard
            icon={BarChart3}
            title="Instant Feedback"
            description="Receive immediate, percentage-based results after each assessment to track your learning."
            delay={0.4}
          />
          <FeatureCard
            icon={UserCheck}
            title="Personalized Profile"
            description="Maintain a user profile with your assessment history and achievements."
            delay={0.6}
          />
           <FeatureCard
            icon={Brain}
            title="AI Recommendations"
            description="Get intelligent suggestions for new assessments based on your performance and interests."
            delay={0.8}
          />
           <FeatureCard
            icon={ArrowRight}
            title="Interactive Learning"
            description="Engage with dynamic questions and an intuitive interface designed for optimal learning."
            delay={1.0}
          />
           <FeatureCard
            icon={ShieldCheck} 
            title="Quality Content"
            description="Assessments crafted to test practical knowledge and conceptual understanding."
            delay={1.2}
          />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 bg-card rounded-xl shadow-lg overflow-hidden">
        <h2 className="text-4xl font-headline font-bold text-center mb-12 text-primary">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <motion.div initial={{opacity: 0, x: -50}} whileInView={{opacity:1, x:0}} transition={{duration:0.5, delay: 0.2}} viewport={{ once: true }}>
            <Image src="/1.png" alt="Browse Assessments" width={300} height={200} className="mx-auto mb-4 rounded-lg shadow-md" data-ai-hint="browsing online courses" />
            <h3 className="text-2xl font-headline font-semibold mb-2">1. Browse & Select</h3>
            <p className="text-muted-foreground">Choose an assessment from various CS categories.</p>
          </motion.div>
          <motion.div initial={{opacity: 0, y: 50}} whileInView={{opacity:1, y:0}} transition={{duration:0.5, delay: 0.4}} viewport={{ once: true }}>
            <Image src="/2.png" alt="Take Assessment" width={300} height={200} className="mx-auto mb-4 rounded-lg shadow-md" data-ai-hint="online test taking" />
            <h3 className="text-2xl font-headline font-semibold mb-2">2. Take the Test</h3>
            <p className="text-muted-foreground">Answer questions in our interactive environment.</p>
          </motion.div>
          <motion.div initial={{opacity: 0, x: 50}} whileInView={{opacity:1, x:0}} transition={{duration:0.5, delay: 0.6}} viewport={{ once: true }}>
            <Image src="/3.png" alt="View Results" width={300} height={200} className="mx-auto mb-4 rounded-lg shadow-md" data-ai-hint="dashboard analytics results" />
            <h3 className="text-2xl font-headline font-semibold mb-2">3. Get Results</h3>
            <p className="text-muted-foreground">See your score instantly and review performance.</p>
          </motion.div>
        </div>
      </section>

      {/* Call to Action Section */}
      <motion.section 
        className="py-16 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-4xl font-headline font-bold mb-6">Ready to Test Your Knowledge?</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Sign up today and start your journey to mastering Computer Science concepts.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="text-sm sm:text-lg px-4 sm:px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground">
              Get Started
            </Button>
          </Link>
          <Link href="/assessments">
            <Button size="lg" variant="outline" className="text-sm sm:text-lg px-4 sm:px-8 py-6 border-primary text-primary hover:bg-primary/5">
              View Assessments
            </Button>
          </Link>
        </div>
      </motion.section>
    </div>
  );
}
