import { useState } from 'react';
import { VideoUploadForm } from '@/components/VideoUploadForm';
import { ResponseDisplay } from '@/components/ResponseDisplay';
import { Film } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { NavLink } from '@/components/NavLink';
import type { SocialCaptions } from '@/pages/CaptionTranscriber';

interface ApiResponse {
  original: string;
  language_code: string;
  paraphrased: string;
  hook?: string;
  caption?: string;
  captions?: SocialCaptions;
  timestamps: Array<{
    text: string;
    start: number;
    end: number;
  }>;
}

const API_ENDPOINT = 'https://n8n.srv1151765.hstgr.cloud/webhook/reel-copy';

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setResponse(null);

    try {
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Upload failed with status ${res.status}`);
      }

      const data = await res.json();
      setResponse(data);
      toast({
        title: 'Success',
        description: 'Video analyzed successfully!',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload video. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container max-w-7xl mx-auto px-4 py-12">
        {/* Navigation */}
        <nav className="flex items-center gap-4 mb-8">
          <NavLink to="/">Reel Paraphraser</NavLink>
          <NavLink to="/caption-transcriber">Caption Transcriber</NavLink>
        </nav>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4 glow-primary">
            <Film className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Reel Content <span className="gradient-text">Paraphraser</span>
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Upload your video reel to extract transcripts and get AI-powered paraphrasing.
          </p>
        </div>

        {/* Main Content - Side by Side Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Input Form */}
          <div className="glass rounded-2xl p-6 md:p-8 shadow-card h-fit">
            <VideoUploadForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>

          {/* Right Side - Response Display */}
          <div className="h-fit">
            {response ? (
              <ResponseDisplay response={response} />
            ) : (
              <div className="glass rounded-2xl p-6 md:p-8 shadow-card flex flex-col items-center justify-center min-h-[300px] text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Film className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  Upload a video to see the analysis results here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
