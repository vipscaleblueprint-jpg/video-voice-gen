import { useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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
    title?: string;
    // New nested structure from webhook
    output?: string | {
        textOverlay?: {
            line1?: string;
            line2?: string;
            line3?: string;
            line4?: string;
            line5?: string;
            line6?: string;
            cta?: string;
            [key: string]: string | undefined;
        };
        bRollSuggestions?: {
            clip1?: string;
            clip2?: string;
            [key: string]: string | undefined;
        };
    };
}

interface ContentResponseDisplayProps {
    response: ContentResponse | ContentResponse[];
    format: 'looping-video' | 'carousel';
}

const CopyableItem = ({ text, className }: { text: string; className?: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast({
            title: 'Copied!',
            description: 'Item copied to clipboard',
            duration: 1500,
        });
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={cn("group flex items-start justify-between gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors", className)}>
            <p className="text-foreground leading-relaxed flex-1">{text}</p>
            <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 text-muted-foreground hover:text-primary shrink-0"
                title="Copy item"
            >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
        </div>
    );
};

export const ContentResponseDisplay = ({ response, format }: ContentResponseDisplayProps) => {
    const [copied, setCopied] = useState(false);

    const parsedContent = useMemo(() => {
        // Handle array response (common from webhooks)
        const data = Array.isArray(response) ? response[0] : response;

        if (!data) return null;

        if (format === 'looping-video') {
            let overlayLines: string[] = [];
            let bRolls: string[] = [];
            let cta: string = '';

            // Case 1: Nested webhook structure
            if (data.output && typeof data.output !== 'string') {
                if (data.output.textOverlay) {
                    const to = data.output.textOverlay;
                    // If it has line1...line6 structure
                    if (to.line1 || to.line2 || to.line3 || to.line4 || to.line5 || to.line6) {
                        overlayLines = [to.line1, to.line2, to.line3, to.line4, to.line5, to.line6].filter(Boolean) as string[];
                        cta = to.cta || '';
                    } else {
                        // Fallback: exclude 'cta' if it exists in the values
                        overlayLines = Object.entries(to)
                            .filter(([key, value]) => key !== 'cta' && Boolean(value))
                            .map(([_, value]) => value as string);
                        cta = to.cta || '';
                    }
                }

                if (data.output.bRollSuggestions) {
                    bRolls = Object.values(data.output.bRollSuggestions).filter(Boolean) as string[];
                }
            }
            // Case 2: Direct properties (legacy or alternative format)
            else if (data.textOverlay || data.bRollSuggestions) {
                if (Array.isArray(data.textOverlay)) {
                    overlayLines = data.textOverlay;
                } else if (typeof data.textOverlay === 'object' && data.textOverlay !== null) {
                    const to = data.textOverlay as any;
                    overlayLines = [to.line1, to.line2, to.line3, to.line4, to.line5, to.line6].filter(Boolean);
                    cta = to.cta || '';
                    if (overlayLines.length === 0) {
                        overlayLines = Object.entries(to)
                            .filter(([key, value]) => key !== 'cta' && Boolean(value))
                            .map(([_, value]) => value as string);
                    }
                }

                if (Array.isArray(data.bRollSuggestions)) {
                    bRolls = data.bRollSuggestions;
                } else if (typeof data.bRollSuggestions === 'object' && data.bRollSuggestions !== null) {
                    bRolls = Object.values(data.bRollSuggestions).filter(Boolean) as string[];
                }
            }

            return {
                type: 'looping-video',
                title: (data.output as any)?.title || data.title || '',
                textOverlay: overlayLines,
                bRollSuggestions: bRolls,
                cta: cta
            };
        }

        if (format === 'carousel') {
            // Case 1: Nested markdown JSON string (from user sample)
            if (typeof data.output === 'string') {
                try {
                    // Robustly remove markdown code block markers from start and end only
                    const cleanJson = data.output.replace(/^```(?:json)?\s*|\s*```$/gi, '').trim();
                    const parsed = JSON.parse(cleanJson);

                    if (parsed.carouselTitle || parsed.slides) {
                        return {
                            type: 'carousel',
                            title: parsed.carouselTitle,
                            slides: parsed.slides
                        };
                    }
                } catch (e) {
                    console.error("Failed to parse carousel JSON", e);
                    // Fallback: try parsing the original string in case it was already JSON
                    try {
                        const parsed = JSON.parse(data.output);
                        if (parsed.carouselTitle || parsed.slides) {
                            return {
                                type: 'carousel',
                                title: parsed.carouselTitle,
                                slides: parsed.slides
                            };
                        }
                    } catch (e2) { /* Ignore fallback error */ }
                }
            }

            // Case 2: Direct property access (fallback)
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
            if (parsedContent.title) textToCopy += `Title: ${parsedContent.title}\n\n`;
            textToCopy += `Text Overlay:\n${parsedContent.textOverlay.join('\n')}`;
            if (parsedContent.cta) {
                textToCopy += `\nCTA: ${parsedContent.cta}`;
            }
            textToCopy += `\n\nB-Roll Suggestions:\n${parsedContent.bRollSuggestions.map(s => `- ${s}`).join('\n')}`;
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

            {parsedContent.type === 'looping-video' && (parsedContent.textOverlay.length > 0 || parsedContent.title) ? (
                <div className="space-y-6">
                    {/* Header/Title Section */}
                    {parsedContent.title && (
                        <div className="mb-2 p-4 bg-primary/5 rounded-xl border border-primary/20">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-primary uppercase tracking-widest">Content Title</span>
                                {/* We can use CopyableItem or a custom copy here, but for simplicity let's use CopyableItem */}
                                <CopyableItem text={parsedContent.title} className="font-bold text-xl !p-0 hover:bg-transparent" />
                            </div>
                        </div>
                    )}

                    {/* Text Overlay Section */}
                    <div>
                        <h4 className="text-sm font-semibold text-primary mb-3">Text Overlay:</h4>
                        <div className="bg-muted/20 rounded-xl p-2 space-y-1">
                            {parsedContent.textOverlay.map((line, idx) => (
                                <CopyableItem key={idx} text={line} />
                            ))}
                            {parsedContent.cta && (
                                <div className="mt-2 pt-2 border-t border-white/5">
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground ml-2 mb-1">Call to Action</p>
                                    <CopyableItem text={parsedContent.cta} className="text-primary font-bold" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* B-Roll Suggestions */}
                    {parsedContent.bRollSuggestions.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-primary mb-3">B-Roll Suggestions:</h4>
                            <div className="bg-muted/20 rounded-xl p-2 space-y-1">
                                {parsedContent.bRollSuggestions.map((suggestion, idx) => (
                                    <CopyableItem key={idx} text={suggestion} />
                                ))}
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
                            <div className="bg-muted/20 rounded-xl p-2">
                                <CopyableItem text={parsedContent.title} className="font-bold text-lg" />
                            </div>
                        </div>
                    )}

                    {/* Slides */}
                    <div>
                        <h4 className="text-sm font-semibold text-primary mb-3">Slides:</h4>
                        <div className="space-y-4">
                            {parsedContent.slides.map((slide, idx) => (
                                <div key={idx} className="bg-muted/20 rounded-xl p-4 border border-border/50 group relative">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                            <span className="text-sm font-bold text-primary">{idx + 1}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {idx === parsedContent.slides!.length - 1 ? 'CTA Slide' : `Slide ${idx + 1}`}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <CopyableItem text={slide.headline} className="font-semibold" />
                                        <CopyableItem text={slide.subheadline} className="text-sm text-muted-foreground" />
                                    </div>
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
