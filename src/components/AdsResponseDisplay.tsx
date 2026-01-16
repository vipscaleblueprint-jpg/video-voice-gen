import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AdVariation {
    graphic_hook: string;
    primary_text: string[];
    headline: string[];
    description: string[];
    hashtag: string;
}

interface AdStageData {
    [key: string]: AdVariation; // a, b, c, d, e variations
}

interface AdsOutput {
    ads_output: {
        stage_1_unaware: AdStageData;
        stage_2_problem_aware: AdStageData;
        stage_3_solution_aware: AdStageData;
        stage_4_product_aware: AdStageData;
        stage_5_most_aware: AdStageData;
    };
}

interface AdsResponseDisplayProps {
    response: any;
}

export const AdsResponseDisplay = ({ response }: AdsResponseDisplayProps) => {
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({
        stage_1_unaware: 'a',
        stage_2_problem_aware: 'a',
        stage_3_solution_aware: 'a',
        stage_4_product_aware: 'a',
        stage_5_most_aware: 'a',
    });

    // Extract the ads output data - handle nested structure
    let adsOutput: any;
    if (response?.output?.ads_output) {
        adsOutput = response.output.ads_output;
    } else if (response?.ads_output) {
        adsOutput = response.ads_output;
    } else {
        adsOutput = response;
    }

    if (!adsOutput || typeof adsOutput !== 'object') {
        return (
            <div className="glass rounded-2xl p-8 text-center">
                <p className="text-destructive font-medium mb-2">Unexpected Response Format</p>
                <pre className="text-[10px] bg-secondary/30 p-4 mt-4 rounded-lg overflow-auto max-h-[200px] text-left">
                    {JSON.stringify(response, null, 2)}
                </pre>
            </div>
        );
    }

    const handleCopy = (text: string | string[], id: string) => {
        const textToCopy = Array.isArray(text) ? text.join('\n\n') : text;
        if (!textToCopy) return;
        navigator.clipboard.writeText(textToCopy);
        setCopiedId(id);
        toast({
            title: 'Copied to clipboard',
            description: 'The text has been copied to your clipboard.',
        });
        setTimeout(() => setCopiedId(null), 2000);
    };

    const stages = [
        { id: 'stage_1_unaware', label: '1. Unaware', data: adsOutput.stage_1_unaware },
        { id: 'stage_2_problem_aware', label: '2. Problem Aware', data: adsOutput.stage_2_problem_aware },
        { id: 'stage_3_solution_aware', label: '3. Solution Aware', data: adsOutput.stage_3_solution_aware },
        { id: 'stage_4_product_aware', label: '4. Product Aware', data: adsOutput.stage_4_product_aware },
        { id: 'stage_5_most_aware', label: '5. Most Aware', data: adsOutput.stage_5_most_aware },
    ].filter(stage => stage.data && typeof stage.data === 'object');

    if (stages.length === 0) {
        return (
            <div className="glass rounded-2xl p-8 text-center">
                <p className="text-warning font-medium mb-2">No Ads Data Found</p>
                <p className="text-xs text-muted-foreground">The API returned a response but no ad stages were recognized.</p>
                <pre className="text-[10px] bg-secondary/30 p-4 mt-4 rounded-lg overflow-auto max-h-[200px] text-left">
                    {JSON.stringify(response, null, 2)}
                </pre>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Tabs defaultValue="stage_1_unaware" className="w-full">
                <TabsList className="grid grid-cols-5 w-full bg-secondary/50 p-1">
                    {stages.map((stage) => (
                        <TabsTrigger
                            key={stage.id}
                            value={stage.id}
                            className="text-[10px] md:text-sm py-2 px-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                            {stage.label.split('. ')[1]}
                        </TabsTrigger>
                    ))}
                </TabsList>
                {stages.map((stage) => {
                    const variations = Object.keys(stage.data);
                    const selectedVar = selectedVariations[stage.id] || variations[0];
                    const varData = stage.data[selectedVar] as AdVariation;

                    if (!varData) return null;

                    return (
                        <TabsContent key={stage.id} value={stage.id} className="mt-6 space-y-4">
                            {/* Variation Selector */}
                            {variations.length > 1 && (
                                <div className="flex items-center gap-3 glass rounded-xl p-4">
                                    <label className="text-sm font-medium text-muted-foreground">Variation:</label>
                                    <Select
                                        value={selectedVar}
                                        onValueChange={(value) => setSelectedVariations(prev => ({ ...prev, [stage.id]: value }))}
                                    >
                                        <SelectTrigger className="w-[120px] bg-secondary">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {variations.map((v) => (
                                                <SelectItem key={v} value={v}>
                                                    Variation {v.toUpperCase()}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <Card className="glass border-none shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <CardHeader className="border-b border-border/50 bg-primary/5 p-6">
                                    <div className="flex justify-between items-center">
                                        <div className="space-y-1">
                                            <CardTitle className="text-xl font-bold gradient-text">{stage.label}</CardTitle>
                                            <p className="text-sm text-muted-foreground">Variation {selectedVar.toUpperCase()}</p>
                                        </div>
                                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                            {stage.id.replace('stage_', '').replace(/_/g, ' ')}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    {/* Graphic Hook */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Graphic Hook</h4>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => handleCopy(varData.graphic_hook, `${stage.id}-${selectedVar}-hook`)}
                                            >
                                                {copiedId === `${stage.id}-${selectedVar}-hook` ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                        <div className="p-4 rounded-xl bg-secondary/50 border border-border/50 font-medium italic">
                                            {varData.graphic_hook}
                                        </div>
                                    </div>

                                    {/* Headlines */}
                                    {varData.headline && varData.headline.length > 0 && (
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Headlines</h4>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() => handleCopy(varData.headline, `${stage.id}-${selectedVar}-headline`)}
                                                >
                                                    {copiedId === `${stage.id}-${selectedVar}-headline` ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                            <div className="space-y-2">
                                                {varData.headline.map((h, i) => (
                                                    <div key={i} className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-foreground font-semibold">
                                                        {h}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Primary Text */}
                                    {varData.primary_text && varData.primary_text.length > 0 && (
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Primary Text</h4>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() => handleCopy(varData.primary_text, `${stage.id}-${selectedVar}-primary`)}
                                                >
                                                    {copiedId === `${stage.id}-${selectedVar}-primary` ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                            <div className="space-y-2">
                                                {varData.primary_text.map((text, i) => (
                                                    <div key={i} className="p-4 rounded-lg bg-secondary/30 border border-border/50 leading-relaxed text-foreground/90">
                                                        {text}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Description */}
                                    {varData.description && varData.description.length > 0 && (
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</h4>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() => handleCopy(varData.description, `${stage.id}-${selectedVar}-desc`)}
                                                >
                                                    {copiedId === `${stage.id}-${selectedVar}-desc` ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                            <div className="space-y-2">
                                                {varData.description.map((desc, i) => (
                                                    <div key={i} className="p-3 rounded-lg bg-accent/10 border border-accent/20 text-foreground/80 text-sm">
                                                        {desc}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Hashtags */}
                                    {varData.hashtag && (
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Hashtags</h4>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() => handleCopy(varData.hashtag, `${stage.id}-${selectedVar}-tag`)}
                                                >
                                                    {copiedId === `${stage.id}-${selectedVar}-tag` ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                            <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 text-primary font-medium tracking-tight">
                                                {varData.hashtag}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    );
                })}
            </Tabs>
        </div>
    );
};
