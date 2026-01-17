# Rezum - AI-Powered Resume Analysis

Rezum is a modern web application that leverages AI to analyze resumes and provide detailed feedback to improve your chances in the job market. Built with Next.js, React, and Tailwind CSS, it offers an intuitive interface for uploading resumes and receiving comprehensive ATS (Applicant Tracking System) scores and personalized recommendations.

## Features

- **PDF Upload**: Easy drag-and-drop or click-to-upload interface for resume files
- **AI Analysis**: Powered by advanced AI models to extract text and analyze resume content
- **ATS Score**: Get a clear percentage score on how well your resume performs with ATS systems
- **Detailed Feedback**: Receive structured analysis including strengths, weaknesses, and recommendations
- **Resume Preview**: View your uploaded PDF directly in the app
- **Responsive Design**: Optimized for desktop and mobile devices
- **Dark Mode Support**: Toggle between light and dark themes

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4, Radix UI components
- **Icons**: Lucide React
- **Markdown Rendering**: React Markdown
- **HTTP Client**: Axios
- **State Management**: React hooks
- **Build Tool**: Next.js (with ESLint)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API server running (configured in environment variables)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/rezum-fe.git
   cd rezum-fe
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory:
   ```
   BACKEND_API_URL=http://localhost:3400/api/v1
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Upload Resume**: On the home page, drag and drop your PDF resume or click to browse files.
2. **View Analysis**: After upload, you'll be redirected to the analysis page showing:
   - ATS compatibility score
   - Detailed AI-generated feedback
   - Resume preview
3. **Review Feedback**: Read through the analysis to understand areas for improvement.

## Project Structure

```
rezum-fe/
├── app/
│   ├── page.tsx              # Home page with upload interface
│   ├── ats/[id]/
│   │   └── page.tsx          # Analysis page with results
│   └── layout.tsx            # Root layout
├── components/
│   └── ui/                   # Reusable UI components
├── lib/
│   └── api.ts                # API configuration
├── public/                   # Static assets
└── package.json
```

## API Integration

The app communicates with a backend API for:
- File upload (`POST /upload`)
- Resume analysis (`GET /upload/analyze/{fileId}`)

Ensure your backend provides the following response format for analysis:

```json
{
  "analysis": "Detailed markdown-formatted analysis...",
  "fileId": "unique-file-id.pdf",
  "extractedText": "Full text extracted from PDF",
  "atsScore": 62
}
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- Uses TypeScript for type safety
- Follows React best practices with hooks
- Styled with Tailwind CSS utility classes
- Components use Radix UI for accessibility

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- AI analysis powered by advanced language models
- UI components built with Radix UI
- Icons from Lucide React
- Styling with Tailwind CSS

