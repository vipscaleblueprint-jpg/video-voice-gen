import { useState } from 'react';
import { VideoUploadForm } from '@/components/VideoUploadForm';
import { ResponseDisplay } from '@/components/ResponseDisplay';
import { Video, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const API_ENDPOINT = 'https://n8n.srv1151765.hstgr.cloud/webhook/paraphrase-reel';

const ReelParaphraser = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [paraphrasedText, setParaphrasedText] = useState('');
    const [personaText, setPersonaText] = useState('');

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        setParaphrasedText('');
        setPersonaText('');

        try {
            const res = await fetch(API_ENDPOINT, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                throw new Error(`Upload failed with status ${res.status}`);
            }

            const data = await res.json();

            // Handle different response formats
            if (data.paraphrased_script) {
                setParaphrasedText(data.paraphrased_script);
            } else if (data.paraphrased) {
                setParaphrasedText(data.paraphrased);
            } else if (typeof data === 'string') {
                setParaphrasedText(data);
            } else {
                setParaphrasedText(JSON.stringify(data, null, 2));
            }

            toast({
                title: 'Success',
                description: 'Video processed successfully!',
            });
        } catch (error) {
            console.error('Upload error:', error);
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to process video. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePersonaGenerated = (text: string) => {
        setPersonaText(text);
        setParaphrasedText(''); // Clear paraphrased text when persona is generated
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden lg:pl-64">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 container max-w-7xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4 glow-primary">
                        <Video className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                        Reel <span className="gradient-text">Paraphraser</span>
                    </h1>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Upload your video or paste your script to generate paraphrased content.
                    </p>
                </div>

                {/* Main Content - Side by Side Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Side - Input Form */}
                    <div className="glass rounded-2xl p-6 md:p-8 shadow-card h-fit">
                        <VideoUploadForm
                            onSubmit={handleSubmit}
                            onPersonaGenerated={handlePersonaGenerated}
                            paraphrasedText={paraphrasedText}
                            isLoading={isLoading}
                        />
                    </div>

                    {/* Right Side - Response Display */}
                    <div className="h-fit">
                        {isLoading ? (
                            <div className="glass rounded-2xl p-6 md:p-8 shadow-card flex flex-col items-center justify-center min-h-[300px] text-center">
                                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                                <p className="text-muted-foreground font-medium">Processing your content...</p>
                                <p className="text-xs text-muted-foreground/70 mt-2">This may take a few moments</p>
                            </div>
                        ) : (paraphrasedText || personaText) ? (
                            <ResponseDisplay
                                response={{
                                    paraphrased: personaText ? undefined : paraphrasedText,
                                    persona_line: personaText || undefined,
                                }}
                            />
                        ) : (
                            <div className="glass rounded-2xl p-6 md:p-8 shadow-card flex flex-col items-center justify-center min-h-[300px] text-center">
                                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                    <Video className="w-8 h-8 text-muted-foreground" />
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

export default ReelParaphraser;
