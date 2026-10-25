
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, ListChecks, Loader2, ShieldCheck, Clock3 } from "lucide-react";

export default function AdminPage() {
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalAssessments, setTotalAssessmentsState] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load stats");
        return response.json();
      })
      .then((stats: { totalUsers: number; totalAssessments: number; assessmentsByCategory: Record<string, number> }) => {
        setTotalUsers(stats.totalUsers);
        setTotalAssessmentsState(stats.totalAssessments);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-headline font-bold text-primary mb-2">Admin Dashboard</h1>
        <p className="text-lg text-muted-foreground">Operations overview and publishing control center.</p>
      </header>

      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-lg hover:shadow-primary/10 transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">(Registered users + Admin)</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-primary/10 transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
            <ListChecks className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalAssessments}</div>
            <p className="text-xs text-muted-foreground">All published assessments</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-primary/10 transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <ShieldCheck className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Healthy</div>
            <p className="text-xs text-muted-foreground">Auth, API, and assessment services online</p>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center">
              <Clock3 className="h-6 w-6 mr-2 text-primary" />
              Admin Notes
            </CardTitle>
            <CardDescription>Current focus areas for the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="p-3 bg-card-foreground/5 rounded-md">No user-activity graphs are shown on this page.</li>
              <li className="p-3 bg-card-foreground/5 rounded-md">Use Assessments to review and publish evaluation content.</li>
              <li className="p-3 bg-card-foreground/5 rounded-md">Use Create Assessment to add new admin assessments quickly.</li>
            </ul>
          </CardContent>
        </Card>
      </section>
      
      <section className="space-y-4">
        <h3 className="text-2xl font-headline font-semibold">Analysis Focus</h3>
        <p className="text-muted-foreground">This admin area is focused on content operations and system health.</p>
      </section>
    </div>
  );
}
