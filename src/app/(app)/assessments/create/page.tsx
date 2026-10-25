import { AddAssessmentForm } from "@/components/admin/add-assessment-form";

export default function CreateAssessmentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-headline text-primary">Host An Assessment</h1>
        <p className="text-muted-foreground">Design your own assessment and publish it for learners.</p>
      </div>
      <AddAssessmentForm />
    </div>
  );
}
