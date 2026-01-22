
import { useState } from 'react';
import { ThumbnailHookForm, type ThumbnailHookFormPayload } from '@/components/ThumbnailHookForm';
import { ThumbnailHookResponseDisplay } from '@/components/ThumbnailHookResponseDisplay';
import { Zap, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Placeholder endpoint - user should replace with actual if different
const API_ENDPOINT = 'https://n8n.srv1151765.hstgr.cloud/webhook/8f78f1c8-3494-4879-8e6b-ceb98bccc961';

const ThumbnailHookGenerator = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [titles, setTitles] = useState<string[] | null>(null);

    const handleSubmit = async (payload: ThumbnailHookFormPayload) => {
        setIsLoading(true);
        setTitles(null);

        try {
            const res = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                // Determine if it is a 404 or other error to give better feedback
                if (res.status === 404) {
                    throw new Error('Webhook endpoint not found. Please ensure the n8n workflow is active.');
                }
                throw new Error(`Request failed with status ${res.status}`);
            }

            const data = await res.json();

            // Expected format: { "output": { "titles": ["Title 1", ...] } } or { "titles": [...] }
            let extractedTitles: string[] = [];

            if (data && data.output && data.output.titles && Array.isArray(data.output.titles)) {
                extractedTitles = data.output.titles;
            } else if (data && data.titles && Array.isArray(data.titles)) {
                extractedTitles = data.titles;
            } else if (Array.isArray(data)) {
                // If it returns an array of strings directly
                if (data.every(i => typeof i === 'string')) {
                    extractedTitles = data;
                }
                // If it returns an array of objects (n8n standard output sometimes)
                else if (data.length > 0 && data[0].titles) {
                    extractedTitles = data[0].titles;
                }
            } else if (data && typeof data === 'object') {
                // Try to find any array of strings
                const values = Object.values(data);
                for (const val of values) {
                    if (Array.isArray(val) && val.every(v => typeof v === 'string')) {
                        extractedTitles = val as string[];
                        break;
                    }
                }
            }

            if (extractedTitles.length > 0) {
                setTitles(extractedTitles);
                toast({
                    title: 'Success',
                    description: 'Viral hooks generated successfully!',
                });
            } else {
                // Fallback display raw JSON if we can't parse it, or error
                console.warn('Could not parse titles from response:', data);
                toast({
                    title: 'Warning',
                    description: 'Received response but could not parse titles.',
                    variant: 'destructive',
                });
            }

        } catch (error) {
            console.error('API error:', error);
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to generate hooks. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden lg:pl-64">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 container max-w-7xl mx-auto px-4 py-12">
                {/* Navigation */}


                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4 glow-primary">
                        <Zap className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                        Thumbnail <span className="gradient-text">Hooks</span>
                    </h1>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Generate scroll-stopping viral hooks for your thumbnails.
                    </p>
                </div>

                {/* Main Content - Side by Side Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Side - Input Form */}
                    <div className="glass rounded-2xl p-6 md:p-8 shadow-card h-fit">
                        <ThumbnailHookForm onSubmit={handleSubmit} isLoading={isLoading} />
                    </div>

                    {/* Right Side - Response Display */}
                    <div className="h-fit">
                        {isLoading ? (
                            <div className="glass rounded-2xl p-6 md:p-8 shadow-card flex flex-col items-center justify-center min-h-[300px] text-center">
                                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                                <p className="text-muted-foreground font-medium">Generating hooks...</p>
                                <p className="text-xs text-muted-foreground/70 mt-2">This may take a few moments</p>
                            </div>
                        ) : titles ? (
                            <ThumbnailHookResponseDisplay titles={titles} />
                        ) : (
                            <div className="glass rounded-2xl p-6 md:p-8 shadow-card flex flex-col items-center justify-center min-h-[300px] text-center">
                                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                    <Zap className="w-8 h-8 text-muted-foreground" />
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

export default ThumbnailHookGenerator;
