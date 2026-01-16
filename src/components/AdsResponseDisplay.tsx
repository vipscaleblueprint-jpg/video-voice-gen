import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AdStage {
    graphic_hook: string;
    ad_copy: string;
    hashtag: string;
}

interface AdsOutput {
    stage_1_unaware: AdStage;
    stage_2_problem_aware: AdStage;
    stage_3_solution_aware: AdStage;
    stage_4_product_aware: AdStage;
    stage_5_most_aware: AdStage;
}

interface AdsResponse {
    ads_output: AdsOutput;
}

interface AdsResponseDisplayProps {
    response: AdsResponse;
}

export const AdsResponseDisplay = ({ response }: AdsResponseDisplayProps) => {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Robustly extract the ads output data
    const adsOutput = response?.ads_output || (response as any)?.output || response;

    if (!adsOutput || typeof adsOutput !== 'object') {
        return (
            <div className="glass rounded-2xl p-8 text-center">
                <p className="text-destructive font-medium mb-2">Unexpected Response Format</p>
                <p className="text-xs text-muted-foreground break-all">{JSON.stringify(response)}</p>
            </div>
        );
    }

    const handleCopy = (text: string, id: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
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
    ].filter(stage => stage.data); // Only show stages that have data

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
                {stages.map((stage) => (
                    <TabsContent key={stage.id} value={stage.id} className="mt-6">
                        <Card className="glass border-none shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <CardHeader className="border-b border-border/50 bg-primary/5 p-6">
                                <div className="flex justify-between items-center">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl font-bold gradient-text">{stage.label}</CardTitle>
                                        <p className="text-sm text-muted-foreground">Tailored ad copy for this awareness stage</p>
                                    </div>
                                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                        {stage.id.replace('stage_', '').replace('_', ' ')}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-8">
                                {/* Graphic Hook */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Graphic Hook</h4>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => handleCopy(stage.data.graphic_hook, `${stage.id}-hook`)}
                                        >
                                            {copiedId === `${stage.id}-hook` ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                    <div className="p-4 rounded-xl bg-secondary/50 border border-border/50 font-medium text-lg italic">
                                        "{stage.data.graphic_hook}"
                                    </div>
                                </div>

                                {/* Ad Copy */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ad Copy</h4>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => handleCopy(stage.data.ad_copy, `${stage.id}-copy`)}
                                        >
                                            {copiedId === `${stage.id}-copy` ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                    <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 whitespace-pre-wrap leading-relaxed text-foreground/90">
                                        {stage.data.ad_copy}
                                    </div>
                                </div>

                                {/* Hashtags */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Hashtags</h4>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => handleCopy(stage.data.hashtag, `${stage.id}-tag`)}
                                        >
                                            {copiedId === `${stage.id}-tag` ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 text-primary font-medium tracking-tight">
                                        {stage.data.hashtag}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
};
