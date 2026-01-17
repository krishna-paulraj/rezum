"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, Zap, Shield, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import api from "@/lib/api";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setFile(file);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Store the file for preview
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      sessionStorage.setItem('uploadedFile', JSON.stringify({ file: dataUrl, name: file.name, type: file.type }));

      router.push(`/ats/${response.data.fileId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FileText className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Rezum
          </span>
        </div>
        <ThemeToggle />
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Elevate Your Resume
            <br />
            <span className="text-primary">with AI Power</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Get personalized feedback, optimize for ATS systems, and land your
            dream job with our intelligent resume analysis tool.
          </p>
          <div className="flex justify-center space-x-4 mb-12">
            <Button size="lg" className="animate-pulse">
              <Zap className="mr-2 h-4 w-4" />
              Start Improving
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>

        {/* Upload Section */}
        <Card className="max-w-2xl mx-auto transition-all duration-300 hover:shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Upload Your Resume</span>
            </CardTitle>
            <CardDescription>
              Drag and drop your resume file here, or click to browse
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                isDragOver
                  ? "border-primary bg-primary/5 scale-105"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">
                {file ? `Selected: ${file.name}` : "Drop your resume here"}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Supports PDF, DOC, DOCX up to 10MB
              </p>
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                id="resume-upload"
              />
              {!file ? (
                <Button asChild>
                  <label htmlFor="resume-upload" className="cursor-pointer">
                    Browse Files
                  </label>
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="w-full"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Resume
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setFile(null)}
                    disabled={isUploading}
                    className="w-full"
                  >
                    Choose Different File
                  </Button>
                </div>
              )}
            </div>
            {error && (
              <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-center">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <Card className="text-center transition-all duration-300 hover:shadow-md hover:-translate-y-1">
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mx-auto mb-4" />
              <CardTitle>AI-Powered Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get detailed insights and suggestions to improve your
                resume&apos;s impact.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center transition-all duration-300 hover:shadow-md hover:-translate-y-1">
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mx-auto mb-4" />
              <CardTitle>ATS Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Ensure your resume passes Applicant Tracking Systems with flying
                colors.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center transition-all duration-300 hover:shadow-md hover:-translate-y-1">
            <CardHeader>
              <Star className="h-10 w-10 text-primary mx-auto mb-4" />
              <CardTitle>Expert Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Receive professional-grade advice from industry experts and
                recruiters.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t">
        <div className="text-center text-muted-foreground">
          <p>&copy; 2024 Rezum. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
