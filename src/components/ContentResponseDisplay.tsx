import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface ContentResponse {
    textOverlay?: string[];
    bRollSuggestions?: string[];
    carouselTitle?: string;
    slides?: Array<{
        headline: string;
        subheadline: string;
    }>;
    rawOutput?: string;
}

interface ContentResponseDisplayProps {
    response: ContentResponse;
    format: 'looping-video' | 'carousel';
}

export const ContentResponseDisplay = ({ response, format }: ContentResponseDisplayProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        let textToCopy = '';

        if (format === 'looping-video' && response.textOverlay) {
            textToCopy = `Text Overlay:\n${response.textOverlay.join('\n')}\n\nB-Roll Suggestions:\n${response.bRollSuggestions?.map(s => `- ${s}`).join('\n') || ''}`;
        } else if (format === 'carousel' && response.slides) {
            textToCopy = `Carousel Title:\n${response.carouselTitle || ''}\n\n${response.slides.map((slide, idx) =>
                `Slide ${idx + 1}\nHeadline: ${slide.headline}\nSubheadline: ${slide.subheadline}`
            ).join('\n\n')}`;
        } else if (response.rawOutput) {
            textToCopy = response.rawOutput;
        }

        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        toast({
            title: 'Copied!',
            description: 'Content copied to clipboard',
        });
        setTimeout(() => setCopied(false), 2000);
    };

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

            {format === 'looping-video' && response.textOverlay ? (
                <div className="space-y-6">
                    {/* Text Overlay Section */}
                    <div>
                        <h4 className="text-sm font-semibold text-primary mb-3">Text Overlay:</h4>
                        <div className="bg-muted/20 rounded-xl p-4 space-y-2">
                            {response.textOverlay.map((line, idx) => (
                                <p key={idx} className="text-foreground leading-relaxed">
                                    {line}
                                </p>
                            ))}
                        </div>
                    </div>

                    {/* B-Roll Suggestions */}
                    {response.bRollSuggestions && response.bRollSuggestions.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-primary mb-3">B-Roll Suggestions:</h4>
                            <div className="bg-muted/20 rounded-xl p-4">
                                <ul className="space-y-2">
                                    {response.bRollSuggestions.map((suggestion, idx) => (
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
            ) : format === 'carousel' && response.slides ? (
                <div className="space-y-6">
                    {/* Carousel Title */}
                    {response.carouselTitle && (
                        <div>
                            <h4 className="text-sm font-semibold text-primary mb-3">Carousel Title:</h4>
                            <div className="bg-muted/20 rounded-xl p-4">
                                <p className="text-lg font-bold text-foreground">{response.carouselTitle}</p>
                            </div>
                        </div>
                    )}

                    {/* Slides */}
                    <div>
                        <h4 className="text-sm font-semibold text-primary mb-3">Slides:</h4>
                        <div className="space-y-4">
                            {response.slides.map((slide, idx) => (
                                <div key={idx} className="bg-muted/20 rounded-xl p-4 border border-border/50">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                            <span className="text-sm font-bold text-primary">{idx + 1}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {idx === response.slides!.length - 1 ? 'CTA Slide' : `Slide ${idx + 1}`}
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
                        {response.rawOutput || JSON.stringify(response, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};
