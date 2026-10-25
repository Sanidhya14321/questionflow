
"use client";

import type { AssessmentResult } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { BookOpenCheck, CalendarDays, Percent, Info } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "../ui/button";
import { motion } from "framer-motion";

interface AssessmentHistoryProps {
  history: AssessmentResult[];
}

export function AssessmentHistory({ history }: AssessmentHistoryProps) {
  if (!history || history.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center">
            <BookOpenCheck className="w-6 h-6 mr-2 text-primary" /> Assessment History
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-10">
          <Info className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-lg mb-4">No assessments completed yet.</p>
          <Link href="/assessments">
            <Button>Start an Assessment</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y:20 }} animate={{ opacity: 1, y:0 }} transition={{ duration: 0.5, delay: 0.2 }}>
      <Card className="shadow-xl bg-card">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center">
            <BookOpenCheck className="w-7 h-7 mr-3 text-primary" /> Assessment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4 pr-4">
              {history.slice().reverse().map((result, index) => ( 
                <motion.div 
                  key={result.assessmentId + result.completedAt + index} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-background"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-lg text-foreground">{result.assessmentTitle}</h4>
                    <Badge variant={result.scorePercentage >= 70 ? "default" : "destructive"}
                           className={result.scorePercentage >= 70 ? "bg-green-500/80 hover:bg-green-500 text-white" : "bg-red-500/80 hover:bg-red-500 text-white"}>
                      {result.scorePercentage >= 70 ? "Passed" : "Failed"}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center"><Badge variant="outline" className="mr-2 border-accent text-accent">{result.category}</Badge></div>
                    <p className="flex items-center">
                      <Percent className="w-4 h-4 mr-1.5 text-primary" /> Score: {result.scorePercentage}%
                    </p>
                    <p className="flex items-center">
                      <CalendarDays className="w-4 h-4 mr-1.5 text-primary" /> 
                      Completed: {format(new Date(result.completedAt), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <div className="mt-3">
                    <Link href={`/assessments/${result.assessmentId}`}>
                       <Button variant="link" className="p-0 h-auto text-sm text-primary hover:underline">
                         View Assessment Details
                       </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}
