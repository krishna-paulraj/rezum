import { Injectable } from '@nestjs/common';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage } from '@langchain/core/messages';
import { WebPDFLoader } from '@langchain/community/document_loaders/web/pdf';

@Injectable()
export class UploadService {
  private files: Map<string, Buffer> = new Map();

  storeFile(filename: string, buffer: Buffer): string {
    const fileId = `${Date.now()}-${filename}`;
    console.log(`File ${fileId} uploaded:`, {
      filename,
      size: buffer.length,
      mimetype: 'binary',
    });
    this.files.set(fileId, buffer);
    return fileId;
  }

  getFile(fileId: string): Buffer | null {
    return this.files.get(fileId) || null;
  }

  getAllFiles(): { fileId: string; size: number }[] {
    return Array.from(this.files.entries()).map(([fileId, buffer]) => ({
      fileId,
      size: buffer.length,
    }));
  }

  deleteFile(fileId: string): boolean {
    return this.files.delete(fileId);
  }

  async extractTextFromPDF(fileId: string): Promise<string | null> {
    const buffer = this.getFile(fileId);
    if (!buffer) return null;

    const blob = new Blob([new Uint8Array(buffer)]);

    try {
      const loader = new WebPDFLoader(blob, {
        splitPages: true,
      });
      const docs = await loader.load();
      const resumeText = docs.map((d) => d.pageContent).join('\n');
      console.log(resumeText);
      return resumeText;
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      return null;
    }
  }

  async analyzeResume(fileId: string): Promise<any> {
    const resumeText = await this.extractTextFromPDF(fileId);
    if (!resumeText) return null;

    const model = new ChatGoogleGenerativeAI({
      model: 'gemini-3-flash-preview',
      apiKey: process.env.GOOGLE_API_KEY,
    });

    const prompt = `Analyze this resume and provide detailed suggestions for improvement. Focus on:

1. **Overall Structure & Format**: How well-organized is the resume?
2. **Content Quality**: Are the descriptions specific and impactful?
3. **Skills & Keywords**: Are relevant skills and industry keywords included?
4. **Achievements**: Are accomplishments quantified with metrics?
5. **ATS Optimization**: Would this resume pass ATS filters?
6. **Industry Best Practices**: What modern resume trends are missing?
7. **Specific Improvements**: Concrete suggestions for each section
8. **ATS Score**: {score}/100 - Provide a score out of 100 for how well this resume would perform in ATS systems, with brief reasoning.

Resume Content:
${resumeText}

Please provide a comprehensive analysis with actionable recommendations.`;

    try {
      const response = await model.invoke([new HumanMessage(prompt)]);
      const content = response.content as string;
      const atsScoreMatch = content.match(/ATS Score.*?(\d+)/i);
      const atsScore = atsScoreMatch ? parseInt(atsScoreMatch[1], 10) : null;
      return {
        analysis: content,
        fileId,
        extractedText: resumeText,
        atsScore,
      };
    } catch (error) {
      console.error('Error analyzing resume:', error);
      return null;
    }
  }
}
