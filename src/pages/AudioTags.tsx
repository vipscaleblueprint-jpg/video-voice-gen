import { useState } from 'react';
import { AudioTagsForm, type AudioTagsFormPayload } from '@/components/AudioTagsForm';
import { AudioTagsResponseDisplay } from '@/components/AudioTagsResponseDisplay';
import { Mic, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { NavLink } from '@/components/NavLink';

const API_ENDPOINT = 'https://n8n.srv1151765.hstgr.cloud/webhook/audio-tags';

const AudioTags = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState<string[] | null>(null);

    const handleSubmit = async (payload: AudioTagsFormPayload) => {
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
                throw new Error(`Request failed with status ${res.status}`);
            }

            const text = await res.text();  
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                // Not JSON, use text directly
                data = text;
            }

            if (Array.isArray(data)) {
                const allScripts: string[] = [];
                data.forEach((item: any) => {
                    if (item && typeof item === 'object') {
                        if (item.output) {
                            allScripts.push(String(item.output));
                        } else {
                            // Extract values from keys like "Script1", "Script2"
                            Object.values(item).forEach((val) => {
                                if (val && (typeof val === 'string' || typeof val === 'number')) {
                                    allScripts.push(String(val));
                                }
                            });
                        }
                    } else if (typeof item === 'string') {
                        allScripts.push(item);
                    }
                });
                setResponse(allScripts.length > 0 ? allScripts : [JSON.stringify(data, null, 2)]);
            } else if (typeof data === 'object' && data !== null) {
                if ('output' in data) {
                    // @ts-ignore
                    setResponse([String(data.output)]);
                } else {
                    // Extract all values
                    const scripts = Object.values(data)
                        .filter(val => val && (typeof val === 'string' || typeof val === 'number'))
                        .map(String);

                    if (scripts.length > 0) {
                        setResponse(scripts);
                    } else {
                        setResponse([JSON.stringify(data, null, 2)]);
                    }
                }
            } else {
                setResponse([String(data)]);
            }

            toast({
                title: 'Success',
                description: 'Audio tags applied successfully!',
            });
        } catch (error) {
            console.error('API error:', error);
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to apply tags. Please try again.',
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
                    <NavLink to="/audio-tags">Audio Tags</NavLink>
                </nav>

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4 glow-primary">
                        <Mic className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                        Audio <span className="gradient-text">Tags</span>
                    </h1>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Apply ElevenLabs audio tags to your script.
                    </p>
                </div>

                {/* Main Content - Side by Side Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Side - Input Form */}
                    <div className="glass rounded-2xl p-6 md:p-8 shadow-card h-fit">
                        <AudioTagsForm onSubmit={handleSubmit} isLoading={isLoading} />
                    </div>

                    {/* Right Side - Response Display */}
                    <div className="h-fit">
                        {isLoading ? (
                            <div className="glass rounded-2xl p-6 md:p-8 shadow-card flex flex-col items-center justify-center min-h-[300px] text-center">
                                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                                <p className="text-muted-foreground font-medium">Applying tags...</p>
                                <p className="text-xs text-muted-foreground/70 mt-2">This may take a few moments</p>
                            </div>
                        ) : response ? (
                            <AudioTagsResponseDisplay response={response} />
                        ) : (
                            <div className="glass rounded-2xl p-6 md:p-8 shadow-card flex flex-col items-center justify-center min-h-[300px] text-center">
                                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                    <Mic className="w-8 h-8 text-muted-foreground" />
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

export default AudioTags;
