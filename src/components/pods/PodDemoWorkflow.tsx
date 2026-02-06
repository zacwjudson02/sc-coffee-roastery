import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, FileText, AlertCircle, ArrowRight, Upload, Eye, CheckCheck, X, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PodViewer } from "./PodViewer";
import { getDemoWorkflowPods, generateDemoPodFile, DemoPodFileConfig } from "@/lib/demoPodFiles";
import { StatusChip } from "@/components/shared/StatusChip";

type WorkflowStep = 
  | "upload-prompt"     // Show pinging upload button
  | "processing"        // Simulating OCR processing
  | "batch-results"     // Show all 7 PODs with status
  | "reviewing-discrepancy" // Reviewing a specific discrepancy
  | "complete";         // Workflow complete

type ProcessedPod = {
  config: DemoPodFileConfig;
  file: File;
  status: "processing" | "matched" | "needs-review" | "resolved";
};

type PodDemoWorkflowProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (pods: {
    bookingId: string;
    fileName: string;
    matchPercent: number;
    file: File;
    status: string;
  }[]) => void;
};

export function PodDemoWorkflow({ open, onOpenChange, onComplete }: PodDemoWorkflowProps) {
  const [step, setStep] = useState<WorkflowStep>("upload-prompt");
  const [progress, setProgress] = useState(0);
  const [processedPods, setProcessedPods] = useState<ProcessedPod[]>([]);
  const [currentDiscrepancyIndex, setCurrentDiscrepancyIndex] = useState(0);
  const [discrepanciesToReview, setDiscrepanciesToReview] = useState<ProcessedPod[]>([]);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setStep("upload-prompt");
      setProgress(0);
      setProcessedPods([]);
      setCurrentDiscrepancyIndex(0);
      setDiscrepanciesToReview([]);
    }
  }, [open]);

  // Start processing when files are "uploaded"
  const handleStartWorkflow = async () => {
    setStep("processing");
    setProgress(0);
    
    // Get demo POD configs
    const demoConfigs = getDemoWorkflowPods();
    
    // Generate files
    const files: ProcessedPod[] = demoConfigs.map(config => ({
      config,
      file: generateDemoPodFile(config),
      status: "processing" as const,
    }));
    
    setProcessedPods(files);
    
    // Simulate processing with progress
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setProgress(i);
    }
    
    // Process all PODs and assign statuses
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const updatedPods = files.map(pod => ({
      ...pod,
      status: pod.config.shouldMatch ? "matched" as const : "needs-review" as const,
    }));
    
    setProcessedPods(updatedPods);
    
    // Extract discrepancies
    const discrepancies = updatedPods.filter(p => p.status === "needs-review");
    setDiscrepanciesToReview(discrepancies);
    
    // Show batch results
    setStep("batch-results");
  };

  const handleStartReview = () => {
    setCurrentDiscrepancyIndex(0);
    setStep("reviewing-discrepancy");
  };

  const handleConfirmMatch = () => {
    // Mark current discrepancy as resolved
    const currentDiscrepancy = discrepanciesToReview[currentDiscrepancyIndex];
    setProcessedPods(prev => prev.map(p => 
      p.file.name === currentDiscrepancy.file.name 
        ? { ...p, status: "resolved" as const }
        : p
    ));
    
    // Move to next discrepancy or complete
    if (currentDiscrepancyIndex < discrepanciesToReview.length - 1) {
      setCurrentDiscrepancyIndex(prev => prev + 1);
    } else {
      setStep("complete");
    }
  };

  const handleCompleteWorkflow = () => {
    // Convert processed pods to the format expected by parent
    const results = processedPods.map(p => ({
      bookingId: p.config.bookingId,
      fileName: p.file.name,
      matchPercent: p.config.matchPercent,
      file: p.file,
      status: p.status === "matched" || p.status === "resolved" ? "Assigned" : "Pending",
    }));
    
    onComplete(results);
    onOpenChange(false);
  };

  const currentDiscrepancy = discrepanciesToReview[currentDiscrepancyIndex];
  const matchedCount = processedPods.filter(p => p.status === "matched").length;
  const resolvedCount = processedPods.filter(p => p.status === "resolved").length;
  const needsReviewCount = processedPods.filter(p => p.status === "needs-review").length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "max-w-[95vw]",
        step === "reviewing-discrepancy" ? "max-w-[1400px]" : "sm:max-w-[900px]"
      )}>
        <DialogHeader>
          <DialogTitle>POD Upload & Reconciliation Demo</DialogTitle>
          <DialogDescription>
            Watch how our AI-powered OCR automatically matches PODs to bookings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Prompt Step */}
          {step === "upload-prompt" && (
            <div className="text-center space-y-4 py-8">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-32 w-32 rounded-full bg-primary/20 animate-ping" />
                    <div className="absolute h-24 w-24 rounded-full bg-primary/30 animate-ping" style={{ animationDelay: "0.5s" }} />
                  </div>
                  <div className="relative z-10 bg-primary text-primary-foreground rounded-full p-8">
                    <Upload className="h-16 w-16" />
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-semibold">Ready to Upload PODs?</h3>
              <p className="text-muted-foreground">Upload 7 demo POD files to see our intelligent matching system in action</p>
              <Button size="lg" onClick={handleStartWorkflow} className="mt-4">
                <Upload className="h-5 w-5 mr-2" />
                Start Demo Upload (7 Files)
              </Button>
            </div>
          )}

          {/* Processing Step */}
          {step === "processing" && (
            <div className="space-y-4 py-8">
              <div className="text-center space-y-2">
                <FileText className="h-12 w-12 mx-auto text-primary animate-pulse" />
                <h3 className="text-xl font-semibold">Processing PODs...</h3>
                <p className="text-sm text-muted-foreground">Running OCR extraction and matching against {processedPods.length} bookings</p>
              </div>
              <Progress value={progress} className="w-full h-3" />
              <p className="text-center text-sm font-medium text-muted-foreground">{progress}% complete • Analyzing {processedPods.length} documents</p>
            </div>
          )}

          {/* Batch Results Step */}
          {step === "batch-results" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Processing Complete</h3>
                  <p className="text-sm text-muted-foreground">
                    {matchedCount} auto-matched • {needsReviewCount} need review
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {matchedCount} Matched
                  </Badge>
                  <Badge variant="outline" className="text-amber-600 border-amber-600">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {needsReviewCount} To Review
                  </Badge>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">POD File</th>
                      <th className="px-4 py-3 text-left font-medium">Booking ID</th>
                      <th className="px-4 py-3 text-left font-medium">Customer</th>
                      <th className="px-4 py-3 text-left font-medium">Confidence</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {processedPods.map((pod, index) => (
                      <tr key={index} className={cn(
                        "transition-colors",
                        pod.status === "matched" && "bg-green-50/50",
                        pod.status === "needs-review" && "bg-amber-50/50"
                      )}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-xs">{pod.file.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium">{pod.config.bookingId}</td>
                        <td className="px-4 py-3">{pod.config.customer}</td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            "font-semibold",
                            pod.config.matchPercent >= 90 && "text-green-600",
                            pod.config.matchPercent < 90 && pod.config.matchPercent >= 75 && "text-amber-600",
                            pod.config.matchPercent < 75 && "text-red-600"
                          )}>
                            {pod.config.matchPercent}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {pod.status === "matched" && (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Auto-Matched
                            </Badge>
                          )}
                          {pod.status === "needs-review" && (
                            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Needs Review
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  {needsReviewCount} {needsReviewCount === 1 ? 'POD requires' : 'PODs require'} manual review due to low confidence matches
                </p>
                <Button onClick={handleStartReview} size="lg">
                  <Eye className="h-4 w-4 mr-2" />
                  Review Discrepancies ({needsReviewCount})
                </Button>
              </div>
            </div>
          )}

          {/* Reviewing Discrepancy Step */}
          {step === "reviewing-discrepancy" && currentDiscrepancy && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Review Discrepancy {currentDiscrepancyIndex + 1} of {discrepanciesToReview.length}</h3>
                  <p className="text-sm text-muted-foreground">Compare OCR-extracted data with booking information</p>
                </div>
                <Badge variant="outline" className="text-amber-600 border-amber-600">
                  {currentDiscrepancy.config.matchPercent}% Match Confidence
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* POD Preview */}
                <Card className="col-span-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      POD Document
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg overflow-hidden">
                      <PodViewer file={currentDiscrepancy.file} height={400} />
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {currentDiscrepancy.file.name}
                    </div>
                  </CardContent>
                </Card>

                {/* Data Comparison */}
                <div className="col-span-2 space-y-4">
                  {/* Issues Summary */}
                  <Card className="border-amber-200 bg-amber-50/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2 text-amber-700">
                        <AlertCircle className="h-4 w-4" />
                        Detected Issues
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {currentDiscrepancy.config.discrepancyReasons?.map((reason, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <div className="h-5 w-5 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-amber-700 text-xs font-semibold">{idx + 1}</span>
                            </div>
                            <span className="text-amber-900">{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Field Comparison */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <ArrowLeftRight className="h-4 w-4" />
                        Field Comparison
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Booking ID */}
                        <div className="grid grid-cols-2 gap-4 pb-3 border-b">
                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-1">OCR Extracted</div>
                            <div className="text-sm font-mono bg-blue-50 p-2 rounded border border-blue-200">
                              {currentDiscrepancy.config.ocrExtracted.bookingId}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-1">System Booking</div>
                            <div className="text-sm font-mono bg-green-50 p-2 rounded border border-green-200">
                              {currentDiscrepancy.config.bookingData.bookingId}
                            </div>
                          </div>
                        </div>

                        {/* Customer */}
                        <div className="grid grid-cols-2 gap-4 pb-3 border-b">
                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-1">OCR Customer</div>
                            <div className={cn(
                              "text-sm p-2 rounded border",
                              currentDiscrepancy.config.ocrExtracted.customer !== currentDiscrepancy.config.bookingData.customer
                                ? "bg-amber-50 border-amber-200"
                                : "bg-blue-50 border-blue-200"
                            )}>
                              {currentDiscrepancy.config.ocrExtracted.customer}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-1">System Customer</div>
                            <div className="text-sm bg-green-50 p-2 rounded border border-green-200">
                              {currentDiscrepancy.config.bookingData.customer}
                            </div>
                          </div>
                        </div>

                        {/* Pickup */}
                        <div className="grid grid-cols-2 gap-4 pb-3 border-b">
                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-1">OCR Pickup</div>
                            <div className={cn(
                              "text-sm p-2 rounded border",
                              currentDiscrepancy.config.ocrExtracted.pickup !== currentDiscrepancy.config.bookingData.pickup
                                ? "bg-amber-50 border-amber-200"
                                : "bg-blue-50 border-blue-200"
                            )}>
                              {currentDiscrepancy.config.ocrExtracted.pickup}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-1">System Pickup</div>
                            <div className="text-sm bg-green-50 p-2 rounded border border-green-200">
                              {currentDiscrepancy.config.bookingData.pickup}
                            </div>
                          </div>
                        </div>

                        {/* Dropoff */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-1">OCR Dropoff</div>
                            <div className={cn(
                              "text-sm p-2 rounded border",
                              currentDiscrepancy.config.ocrExtracted.dropoff !== currentDiscrepancy.config.bookingData.dropoff
                                ? "bg-amber-50 border-amber-200"
                                : "bg-blue-50 border-blue-200"
                            )}>
                              {currentDiscrepancy.config.ocrExtracted.dropoff}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-1">System Dropoff</div>
                            <div className="text-sm bg-green-50 p-2 rounded border border-green-200">
                              {currentDiscrepancy.config.bookingData.dropoff}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <DialogFooter className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  The system data appears to be the source of truth
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep("batch-results")}>
                    <X className="h-4 w-4 mr-2" />
                    Back to List
                  </Button>
                  <Button onClick={handleConfirmMatch}>
                    <CheckCheck className="h-4 w-4 mr-2" />
                    Confirm Match to {currentDiscrepancy.config.bookingId}
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}

          {/* Complete Step */}
          {step === "complete" && (
            <div className="text-center space-y-4 py-8">
              <CheckCircle2 className="h-16 w-16 mx-auto text-green-500" />
              <h3 className="text-2xl font-semibold">Workflow Complete!</h3>
              <p className="text-muted-foreground">All {processedPods.length} PODs have been processed and reconciled</p>
              
              <div className="grid grid-cols-3 gap-4 mt-6">
                <Card className="border-green-200">
                  <CardContent className="pt-6">
                    <div className="text-4xl font-bold text-green-600">{matchedCount}</div>
                    <div className="text-sm text-muted-foreground mt-1">Auto-Matched</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {matchedCount > 0 && `${Math.round((matchedCount / processedPods.length) * 100)}% of total`}
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-amber-200">
                  <CardContent className="pt-6">
                    <div className="text-4xl font-bold text-amber-600">{resolvedCount}</div>
                    <div className="text-sm text-muted-foreground mt-1">Manually Reviewed</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {resolvedCount > 0 && `${Math.round((resolvedCount / processedPods.length) * 100)}% of total`}
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-blue-200">
                  <CardContent className="pt-6">
                    <div className="text-4xl font-bold text-blue-600">{processedPods.length}</div>
                    <div className="text-sm text-muted-foreground mt-1">Total PODs</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      100% processed
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Button size="lg" onClick={handleCompleteWorkflow} className="mt-6">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                View All PODs in Table
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
