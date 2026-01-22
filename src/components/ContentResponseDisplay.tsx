import { useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface ContentResponse {
    // Current simple structure (keeping for backward compatibility or direct usage)
    textOverlay?: string[];
    bRollSuggestions?: string[];
    carouselTitle?: string;
    slides?: Array<{
        headline: string;
        subheadline: string;
    }>;
    rawOutput?: string;
    // New nested structure from webhook
    output?: {
        textOverlay?: Record<string, string>;
        bRollSuggestions?: Record<string, string>;
    };
}

interface ContentResponseDisplayProps {
    response: ContentResponse | ContentResponse[];
    format: 'looping-video' | 'carousel';
}

export const ContentResponseDisplay = ({ response, format }: ContentResponseDisplayProps) => {
    const [copied, setCopied] = useState(false);

    const parsedContent = useMemo(() => {
        // Handle array response (common from webhooks)
        const data = Array.isArray(response) ? response[0] : response;

        if (!data) return null;

        if (format === 'looping-video') {
            let overlayLines: string[] = [];
            let bRolls: string[] = [];

            // Case 1: Nested webhook structure
            if (data.output?.textOverlay) {
                // Extract lines safely, filtering out empty ones
                overlayLines = Object.values(data.output.textOverlay).filter(Boolean);
            }
            // Case 2: Direct array structure (legacy support)
            else if (data.textOverlay && Array.isArray(data.textOverlay)) {
                overlayLines = data.textOverlay;
            }

            // Extract B-Rolls
            if (data.output?.bRollSuggestions) {
                bRolls = Object.values(data.output.bRollSuggestions).filter(Boolean);
            } else if (data.bRollSuggestions && Array.isArray(data.bRollSuggestions)) {
                bRolls = data.bRollSuggestions;
            }

            return {
                type: 'looping-video',
                textOverlay: overlayLines,
                bRollSuggestions: bRolls
            };
        }

        if (format === 'carousel') {
            // Basic support for carousel structure (can be enhanced if specific JSON provided)
            return {
                type: 'carousel',
                title: data.carouselTitle,
                slides: data.slides
            };
        }

        return { type: 'unknown', raw: data };
    }, [response, format]);

    const handleCopy = () => {
        let textToCopy = '';

        if (parsedContent?.type === 'looping-video') {
            textToCopy = `Text Overlay:\n${parsedContent.textOverlay.join('\n')}\n\nB-Roll Suggestions:\n${parsedContent.bRollSuggestions.map(s => `- ${s}`).join('\n')}`;
        } else if (parsedContent?.type === 'carousel' && parsedContent.slides) {
            textToCopy = `Carousel Title:\n${parsedContent.title || ''}\n\n${parsedContent.slides.map((slide, idx) =>
                `Slide ${idx + 1}\nHeadline: ${slide.headline}\nSubheadline: ${slide.subheadline}`
            ).join('\n\n')}`;
        } else if (response) {
            textToCopy = JSON.stringify(response, null, 2);
        }

        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        toast({
            title: 'Copied!',
            description: 'Content copied to clipboard',
        });
        setTimeout(() => setCopied(false), 2000);
    };

    if (!parsedContent) return null;

    return (
        <div className="glass rounded-2xl p-6 md:p-8 shadow-card">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-foreground">Generated Content</h3>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="gap-2"
                >
                    {copied ? (
                        <>
                            <Check className="w-4 h-4" />
                            Copied
                        </>
                    ) : (
                        <>
                            <Copy className="w-4 h-4" />
                            Copy All
                        </>
                    )}
                </Button>
            </div>

            {parsedContent.type === 'looping-video' && parsedContent.textOverlay.length > 0 ? (
                <div className="space-y-6">
                    {/* Text Overlay Section */}
                    <div>
                        <h4 className="text-sm font-semibold text-primary mb-3">Text Overlay:</h4>
                        <div className="bg-muted/20 rounded-xl p-4 space-y-2">
                            {parsedContent.textOverlay.map((line, idx) => (
                                <p key={idx} className="text-foreground leading-relaxed">
                                    {line}
                                </p>
                            ))}
                        </div>
                    </div>

                    {/* B-Roll Suggestions */}
                    {parsedContent.bRollSuggestions.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-primary mb-3">B-Roll Suggestions:</h4>
                            <div className="bg-muted/20 rounded-xl p-4">
                                <ul className="space-y-2">
                                    {parsedContent.bRollSuggestions.map((suggestion, idx) => (
                                        <li key={idx} className="text-foreground flex items-start">
                                            <span className="text-primary mr-2">•</span>
                                            <span>{suggestion}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            ) : parsedContent.type === 'carousel' && parsedContent.slides ? (
                <div className="space-y-6">
                    {/* Carousel Title */}
                    {parsedContent.title && (
                        <div>
                            <h4 className="text-sm font-semibold text-primary mb-3">Carousel Title:</h4>
                            <div className="bg-muted/20 rounded-xl p-4">
                                <p className="text-lg font-bold text-foreground">{parsedContent.title}</p>
                            </div>
                        </div>
                    )}

                    {/* Slides */}
                    <div>
                        <h4 className="text-sm font-semibold text-primary mb-3">Slides:</h4>
                        <div className="space-y-4">
                            {parsedContent.slides.map((slide, idx) => (
                                <div key={idx} className="bg-muted/20 rounded-xl p-4 border border-border/50">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                            <span className="text-sm font-bold text-primary">{idx + 1}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {idx === parsedContent.slides!.length - 1 ? 'CTA Slide' : `Slide ${idx + 1}`}
                                        </span>
                                    </div>
                                    <p className="text-foreground font-semibold mb-2">{slide.headline}</p>
                                    <p className="text-muted-foreground text-sm">{slide.subheadline}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-muted/20 rounded-xl p-4">
                    <pre className="whitespace-pre-wrap text-sm text-foreground font-mono">
                        {JSON.stringify(response, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};
