"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileText,
  ArrowLeft,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import api from "@/lib/api";

interface AnalysisData {
  analysis: string;
  fileId: string;
  extractedText: string;
  atsScore: number;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

const Page = ({ params }: PageProps) => {
  const { id } = use(params);
  const router = useRouter();
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (hasFetchedRef.current) return; // Prevent duplicate calls

      try {
        setLoading(true);
        hasFetchedRef.current = true;
        const response = await api.get(`upload/analyze/${id}`);
        setAnalysis(response.data);

        // Load PDF from sessionStorage
        const storedFile = sessionStorage.getItem("uploadedFile");
        if (storedFile) {
          const { file: dataUrl } = JSON.parse(storedFile);
          setPdfUrl(dataUrl);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch analysis";
        if (errorMessage.includes("image")) {
          setError(
            "The uploaded file contains images that cannot be processed. Please upload a PDF with text only.",
          );
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    if (id && !hasFetchedRef.current) {
      fetchAnalysis();
    }

    // Cleanup URL on unmount
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [id, pdfUrl]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-6 w-6 text-green-600" />;
    if (score >= 60)
      return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
    return <XCircle className="h-6 w-6 text-red-600" />;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            No analysis data available for this file.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Button
        variant="outline"
        onClick={() => router.push("/")}
        className="mb-8"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>
      <div className="mb-8 flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Resume Analysis</h1>
          <p className="text-muted-foreground">File ID: {id}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* PDF Preview */}
        <div className="order-2 lg:order-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Resume Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <embed
                src={
                  pdfUrl || `${api.defaults.baseURL}/uploads/${analysis.fileId}`
                }
                type="application/pdf"
                width="100%"
                height="600px"
                className="border rounded"
              />
            </CardContent>
          </Card>
        </div>
        {/* Analysis */}
        <div className="order-1 lg:order-2 space-y-6 max-h-[800px] overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {/* ATS Score Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getScoreIcon(analysis.atsScore)}
                Your ATS Score
              </CardTitle>
              <CardDescription>
                How well your resume performs with Applicant Tracking Systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div
                  className={`text-6xl font-bold ${getScoreColor(analysis.atsScore)}`}
                >
                  {analysis.atsScore}%
                </div>
                <Badge
                  variant={
                    analysis.atsScore >= 80
                      ? "default"
                      : analysis.atsScore >= 60
                        ? "secondary"
                        : "destructive"
                  }
                  className="mt-2"
                >
                  {analysis.atsScore >= 80
                    ? "Excellent"
                    : analysis.atsScore >= 60
                      ? "Good"
                      : "Needs Improvement"}
                </Badge>
              </div>
            </CardContent>
          </Card>
          {/* Feedback */}
          {analysis.analysis && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-2xl font-bold my-6 text-primary">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-xl font-semibold my-5 text-primary">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-lg font-medium my-4 text-foreground">
                          {children}
                        </h3>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside space-y-2 mb-6">
                          {children}
                        </ul>
                      ),
                      li: ({ children }) => (
                        <li className="text-sm leading-relaxed">{children}</li>
                      ),
                      p: ({ children }) => (
                        <p className="mb-4 text-sm leading-relaxed">
                          {children}
                        </p>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-foreground">
                          {children}
                        </strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic">{children}</em>
                      ),
                    }}
                  >
                    {analysis.analysis}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
