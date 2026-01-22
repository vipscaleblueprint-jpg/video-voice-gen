import { useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ContentResponseDisplay } from '@/components/ContentResponseDisplay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ContentFormat = 'looping-video' | 'carousel';
type Tone = 'Calm' | 'Bold' | 'Direct' | 'Aspirational' | 'Educational';

type LoopingVideoPillar = 'bts-pain-points' | 'storytelling-motivational' | 'quick-tips' | 'testimonial' | 'storytelling-future';
type CarouselPillar = 'founders-journey' | 'case-study' | 'educational';

interface UniversalInputs {
    clientName: string;
    clientRole: string;
    clientNiche: string;
    targetAudience: string;
    audiencePainPoint: string;
    desiredOutcome: string;
    offerCta: string;
    tone: Tone;
    format: ContentFormat;
    referenceText?: string;
}

const ContentCreationSystem = () => {
    const [activeSection, setActiveSection] = useState<'looping-video' | 'carousel'>('looping-video');
    const [selectedPillar, setSelectedPillar] = useState<LoopingVideoPillar | CarouselPillar>('bts-pain-points');
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState<any | null>(null);

    // Universal inputs state
    const [inputs, setInputs] = useState<UniversalInputs>({
        clientName: '',
        clientRole: '',
        clientNiche: '',
        targetAudience: '',
        audiencePainPoint: '',
        desiredOutcome: '',
        offerCta: '',
        tone: 'Direct',
        format: 'looping-video',
        referenceText: ''
    });

    const loopingVideoPillars: { value: LoopingVideoPillar; label: string }[] = [
        { value: 'bts-pain-points', label: 'BTS / Pain Points' },
        { value: 'storytelling-motivational', label: 'Storytelling – Motivational' },
        { value: 'quick-tips', label: 'Quick Tips / Hacks' },
        { value: 'testimonial', label: 'Testimonial' },
        { value: 'storytelling-future', label: 'Storytelling – Future Pacing' },
    ];

    const carouselPillars: { value: CarouselPillar; label: string }[] = [
        { value: 'founders-journey', label: "Founder's Journey" },
        { value: 'case-study', label: 'Case Study' },
        { value: 'educational', label: 'Educational' },
    ];

    const handleGenerate = async () => {
        setIsLoading(true);
        setResponse(null);

        try {
            const API_ENDPOINT = 'https://n8n.srv1151765.hstgr.cloud/webhook/content-gen';

            const payload = {
                ...inputs,
                contentPillar: selectedPillar,
                format: activeSection // Will be either 'looping-video' or 'carousel'
            };

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

            const data = await res.json();
            setResponse(data);

            toast({
                title: 'Success',
                description: 'Content generated successfully!',
            });
        } catch (error) {
            console.error('Generation error:', error);
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to generate content. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const updateInput = (field: keyof UniversalInputs, value: string) => {
        setInputs(prev => ({ ...prev, [field]: value }));
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
                        <FileText className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                        Content Creation <span className="gradient-text">System</span>
                    </h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Generate ready-to-produce social media scripts for Text Overlay Looping Videos and Carousels
                    </p>
                </div>

                {/* Section Navigation */}
                <div className="glass rounded-2xl p-2 mb-8 inline-flex w-full max-w-md mx-auto">
                    <button
                        onClick={() => {
                            setActiveSection('looping-video');
                            setSelectedPillar('bts-pain-points');
                        }}
                        className={`flex-1 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${activeSection === 'looping-video'
                            ? 'bg-primary text-primary-foreground shadow-glow'
                            : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                            }`}
                    >
                        Text Overlay Videos
                    </button>
                    <button
                        onClick={() => {
                            setActiveSection('carousel');
                            setSelectedPillar('founders-journey');
                        }}
                        className={`flex-1 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${activeSection === 'carousel'
                            ? 'bg-primary text-primary-foreground shadow-glow'
                            : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                            }`}
                    >
                        Carousels
                    </button>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Side - Input Form */}
                    <div className="glass rounded-2xl p-6 md:p-8 shadow-card h-fit">
                        <h2 className="text-xl font-bold text-foreground mb-6">Universal Inputs</h2>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="clientName">Client Name</Label>
                                <Input
                                    id="clientName"
                                    value={inputs.clientName}
                                    onChange={(e) => updateInput('clientName', e.target.value)}
                                    placeholder="Enter client name"
                                />
                            </div>

                            <div>
                                <Label htmlFor="clientRole">Client Role / Title</Label>
                                <Input
                                    id="clientRole"
                                    value={inputs.clientRole}
                                    onChange={(e) => updateInput('clientRole', e.target.value)}
                                    placeholder="e.g., Business Coach, Designer"
                                />
                            </div>

                            <div>
                                <Label htmlFor="clientNiche">Client Niche</Label>
                                <Input
                                    id="clientNiche"
                                    value={inputs.clientNiche}
                                    onChange={(e) => updateInput('clientNiche', e.target.value)}
                                    placeholder="e.g., Personal Branding, SaaS Marketing"
                                />
                            </div>

                            <div>
                                <Label htmlFor="targetAudience">Target Audience</Label>
                                <Input
                                    id="targetAudience"
                                    value={inputs.targetAudience}
                                    onChange={(e) => updateInput('targetAudience', e.target.value)}
                                    placeholder="e.g., Entrepreneurs, Freelancers"
                                />
                            </div>

                            <div>
                                <Label htmlFor="audiencePainPoint">Primary Audience Pain Point</Label>
                                <Textarea
                                    id="audiencePainPoint"
                                    value={inputs.audiencePainPoint}
                                    onChange={(e) => updateInput('audiencePainPoint', e.target.value)}
                                    placeholder="Describe the main challenge your audience faces"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label htmlFor="desiredOutcome">Primary Desired Outcome</Label>
                                <Textarea
                                    id="desiredOutcome"
                                    value={inputs.desiredOutcome}
                                    onChange={(e) => updateInput('desiredOutcome', e.target.value)}
                                    placeholder="What result does your audience want?"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label htmlFor="offerCta">Offer / CTA</Label>
                                <Input
                                    id="offerCta"
                                    value={inputs.offerCta}
                                    onChange={(e) => updateInput('offerCta', e.target.value)}
                                    placeholder="e.g., DM for details, Link in bio"
                                />
                            </div>

                            <div>
                                <Label htmlFor="tone">Tone</Label>
                                <Select value={inputs.tone} onValueChange={(value) => updateInput('tone', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select tone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Calm">Calm</SelectItem>
                                        <SelectItem value="Bold">Bold</SelectItem>
                                        <SelectItem value="Direct">Direct</SelectItem>
                                        <SelectItem value="Aspirational">Aspirational</SelectItem>
                                        <SelectItem value="Educational">Educational</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Content Pillar Selection */}
                            <div>
                                <Label htmlFor="contentPillar">Content Pillar</Label>
                                <Select
                                    value={selectedPillar}
                                    onValueChange={(value) => setSelectedPillar(value as any)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select content pillar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {activeSection === 'looping-video'
                                            ? loopingVideoPillars.map(pillar => (
                                                <SelectItem key={pillar.value} value={pillar.value}>
                                                    {pillar.label}
                                                </SelectItem>
                                            ))
                                            : carouselPillars.map(pillar => (
                                                <SelectItem key={pillar.value} value={pillar.value}>
                                                    {pillar.label}
                                                </SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Reference Text (Carousel Only) */}
                            {activeSection === 'carousel' && (
                                <div>
                                    <Label htmlFor="referenceText">Reference Text (Optional)</Label>
                                    <Textarea
                                        id="referenceText"
                                        value={inputs.referenceText}
                                        onChange={(e) => updateInput('referenceText', e.target.value)}
                                        placeholder="Paste reference content here (recommended for Case Study and Educational carousels)"
                                        rows={5}
                                    />
                                </div>
                            )}

                            <Button
                                onClick={handleGenerate}
                                disabled={isLoading}
                                className="w-full"
                                size="lg"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    'Generate Content'
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Right Side - Response Display */}
                    <div className="h-fit">
                        {isLoading ? (
                            <div className="glass rounded-2xl p-6 md:p-8 shadow-card flex flex-col items-center justify-center min-h-[400px] text-center">
                                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                                <p className="text-muted-foreground font-medium">Generating your content...</p>
                                <p className="text-xs text-muted-foreground/70 mt-2">This may take a few moments</p>
                            </div>
                        ) : response ? (
                            <ContentResponseDisplay response={response} format={activeSection} />
                        ) : (
                            <div className="glass rounded-2xl p-6 md:p-8 shadow-card flex flex-col items-center justify-center min-h-[400px] text-center">
                                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                    <FileText className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground">Result Section</p>
                                <p className="text-xs text-muted-foreground/70 mt-2">
                                    Fill the form and click "Generate Content"
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContentCreationSystem;
