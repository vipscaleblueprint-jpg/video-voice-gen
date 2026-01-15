import { useState } from 'react';
import { CaptionUploadForm, type CaptionFormPayload } from '@/components/CaptionUploadForm';
import { CaptionResponseDisplay } from '@/components/CaptionResponseDisplay';
import { MessageSquare, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { NavLink } from '@/components/NavLink';
import { SocialCaptions } from '@/types';

const API_ENDPOINT = 'https://n8n.srv1151765.hstgr.cloud/webhook/generate-caption';

const CaptionParaphraser = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState<SocialCaptions | null>(null);

    const handleSubmit = async (payload: CaptionFormPayload) => {
        setIsLoading(true);
        setResponse(null);

        try {
            const res = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                throw new Error(`Upload failed with status ${res.status}`);
            }

            const data = await res.json();
            // Handle the case where the API returns an array (take the first item)
            if (Array.isArray(data) && data.length > 0) {
                setResponse(data[0]);
            } else {
                setResponse(data);
            }
            toast({
                title: 'Success',
                description: 'Captions generated successfully!',
            });
        } catch (error) {
            console.error('Upload error:', error);
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to generate captions. Please try again.',
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
                    <NavLink to="/caption-paraphraser">Caption Paraphraser</NavLink>
                    <NavLink to="/script-generator">Script Generator</NavLink>
                    <NavLink to="/audio-tags">Audio Tags</NavLink>
                </nav>

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4 glow-primary">
                        <MessageSquare className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                        Caption <span className="gradient-text">Paraphraser</span>
                    </h1>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Generate platform-specific captions with the updated workflow.
                    </p>
                </div>

                {/* Main Content - Side by Side Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Side - Input Form */}
                    <div className="glass rounded-2xl p-6 md:p-8 shadow-card h-fit">
                        <CaptionUploadForm onSubmit={handleSubmit} isLoading={isLoading} />
                    </div>

                    {/* Right Side - Response Display */}
                    <div className="h-fit">
                        {isLoading ? (
                            <div className="glass rounded-2xl p-6 md:p-8 shadow-card flex flex-col items-center justify-center min-h-[300px] text-center">
                                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                                <p className="text-muted-foreground font-medium">Generating captions...</p>
                                <p className="text-xs text-muted-foreground/70 mt-2">This may take a few moments</p>
                            </div>
                        ) : response ? (
                            <CaptionResponseDisplay
                                captions={response}
                                title="Generated Paraphrase Caption"
                                emptyMessage="No paraphrase captions were generated."
                            />
                        ) : (
                            <div className="glass rounded-2xl p-6 md:p-8 shadow-card flex flex-col items-center justify-center min-h-[300px] text-center">
                                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                    <MessageSquare className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground">
                                    Result Section
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CaptionParaphraser;
