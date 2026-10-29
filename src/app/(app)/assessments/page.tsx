
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { AssessmentCard } from "@/components/assessments/assessment-card";
import { AssessmentCategoryFilter } from "@/components/assessments/assessment-category-filter";
import type { AssessmentSummary } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function AssessmentsPage() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [assessments, setAssessments] = useState<AssessmentSummary[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [topic, setTopic] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState("10");
  const [difficulty, setDifficulty] = useState("medium");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const loadAssessments = async () => {
      try {
        setIsLoading(true);
        setLoadError(false);
        const response = await fetch("/api/assessments", { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("Failed to load assessments");
        const data: AssessmentSummary[] = await response.json();
        setAssessments(data);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(error);
        setLoadError(true);
        setAssessments([]);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    void loadAssessments();
    return () => controller.abort();
  }, [retryCount]);

  const applyFilters = useCallback((source: AssessmentSummary[]) => {
    return source.filter((assessment) => {
      const categoryMatch = selectedCategory ? assessment.category === selectedCategory : true;
      const searchTermMatch = searchTerm
        ? assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assessment.description.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      return categoryMatch && searchTermMatch;
    }).sort((a, b) => sortBy === "popular" ? (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes) : sortBy === "shortest" ? (a.durationMinutes ?? 999) - (b.durationMinutes ?? 999) : Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }, [selectedCategory, searchTerm, sortBy]);

  const adminAssessments = useMemo(() => {
    const source = assessments.filter((assessment) => assessment.createdByRole === "admin" || assessment.isPredefined);
    return applyFilters(source);
  }, [assessments, applyFilters]);

  const userAssessments = useMemo(() => {
    const source = assessments.filter((assessment) => assessment.createdByRole === "user");
    return applyFilters(source);
  }, [assessments, applyFilters]);

  const aiAssessments = useMemo(() => {
    const source = assessments.filter((assessment) => assessment.createdByRole === "ai" || assessment.isAIGenerated);
    return applyFilters(source);
  }, [assessments, applyFilters]);

  const availableCategories = useMemo(() => {
    const cats = Array.from(new Set(assessments.map((a) => a.category)));
    return cats.sort();
  }, [assessments]);

  const handleGenerateAIAssessment = async () => {
    if (!topic.trim()) return;

    try {
      setIsGenerating(true);
      const response = await fetch("/api/assessments/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          numberOfQuestions: Number(numberOfQuestions),
          difficulty,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({ message: "Failed to generate assessment" }))) as {
          message?: string;
        };
        throw new Error(payload.message ?? "Failed to generate assessment");
      }
      const generated: AssessmentSummary = await response.json();
      setAssessments((prev) => [generated, ...prev]);
      setSearchTerm("");
      setSelectedCategory(null);
      toast({ title: "Assessment Generated", description: "Your AI assessment is ready." });
    } catch (error) {
      console.error(error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading assessments...
        </div>
      </div>
    );
  }

  if (loadError) return (
    <div role="alert" className="text-center py-16 space-y-4">
      <h1 className="text-2xl font-headline">Could not load assessments</h1>
      <p className="text-muted-foreground">Please try again in a moment.</p>
      <Button onClick={() => setRetryCount(count => count + 1)}>Try again</Button>
    </div>
  );

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-headline font-bold text-primary mb-4">Explore Assessments</h1>
        <p className="text-xl text-muted-foreground">
          Admin-made, user-made, and AI-generated assessments in one place.
        </p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            aria-label="Search assessments"
            placeholder="Search assessments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p role="status" className="text-sm text-muted-foreground">{adminAssessments.length + userAssessments.length + aiAssessments.length} assessments match your filters</p>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger aria-label="Sort assessments" className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="newest">Newest first</SelectItem><SelectItem value="popular">Most popular</SelectItem><SelectItem value="shortest">Shortest first</SelectItem></SelectContent>
        </Select>
      </div>
      <AssessmentCategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        availableCategories={availableCategories}
      />

      <Tabs defaultValue="admin" className="w-full">
        <TabsList className="w-full md:w-auto h-auto flex flex-wrap gap-2">
          <TabsTrigger value="admin">Admin Made Assessments</TabsTrigger>
          <TabsTrigger value="user">User Made Assessments</TabsTrigger>
          <TabsTrigger value="ai">AI Based Assessments</TabsTrigger>
        </TabsList>

        <TabsContent value="admin" className="pt-6">
          {adminAssessments.length > 0 ? (
            <motion.div layout className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {adminAssessments.map((assessment) => (
                  <motion.div key={assessment.id} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.3 }}>
                    <AssessmentCard assessment={assessment} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">No admin-made assessments found.</div>
          )}
        </TabsContent>

        <TabsContent value="user" className="pt-6">
          {userAssessments.length > 0 ? (
            <motion.div layout className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {userAssessments.map((assessment) => (
                  <motion.div key={assessment.id} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.3 }}>
                    <AssessmentCard assessment={assessment} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">No user-made assessments found yet.</div>
          )}
        </TabsContent>

        <TabsContent value="ai" className="pt-6 space-y-6">
          <div className="grid md:grid-cols-4 gap-4 p-5 border-[3px] border-black rounded-[8px] bg-card">
            <Input aria-label="Assessment topic" placeholder="Topic (e.g. Graph Algorithms)" value={topic} onChange={(e) => setTopic(e.target.value)} />
            <Input aria-label="Number of questions" type="number" min={3} max={25} value={numberOfQuestions} onChange={(e) => setNumberOfQuestions(e.target.value)} />
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger aria-label="Difficulty">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="easy-medium">Easy-Medium</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="medium-hard">Medium-Hard</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleGenerateAIAssessment} disabled={isGenerating || !topic.trim()}>
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Generate AI Assessment
            </Button>
          </div>

          <Separator />

          {aiAssessments.length > 0 ? (
            <motion.div layout className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {aiAssessments.map((assessment) => (
                  <motion.div key={assessment.id} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.3 }}>
                    <AssessmentCard assessment={assessment} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">Generate your first AI assessment above.</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
