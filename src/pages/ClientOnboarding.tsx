import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, UserPlus, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ResponseDisplay } from '@/components/ResponseDisplay';

const API_ENDPOINT = 'https://n8n.srv1151765.hstgr.cloud/webhook/client-onboarding';

const TEMPLATES = [
    {
        label: "Service-Based: My Story (Hero's Journey)",
        value: "Service-Based: My Story (Hero's Journey)"
    },
    {
        label: "Service-Based: Authority / How We Work",
        value: "Service-Based: Authority / How We Work"
    },
    {
        label: "Product-Based: My Story (The Transformation)",
        value: "Product-Based: My Story (The Transformation)"
    },
    {
        label: "Product-Based: Product Creation Story",
        value: "Product-Based: Product Creation Story"
    },
    {
        label: "Product-Based: Before and After",
        value: "Product-Based: Before and After"
    },
    {
        label: "Educational: My Story",
        value: "Educational: My Story"
    },
    {
        label: "Educational: About / Mission",
        value: "Educational: About / Mission"
    }
];

const CTA_API = 'https://n8n.srv1151765.hstgr.cloud/webhook/e5260e03-6ded-4448-ab29-52f88af0d35b';

interface CtaOption {
    cta: string;
}

const ClientOnboarding = () => {
    const [clientBio, setClientBio] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedScript, setGeneratedScript] = useState('');

    // CTA State
    const [ctaOptions, setCtaOptions] = useState<CtaOption[]>([]);
    const [ctaLoading, setCtaLoading] = useState(true);
    const [selectedCta, setSelectedCta] = useState('');

    // Fetch CTA options
    useEffect(() => {
        const fetchCtaOptions = async () => {
            try {
                const res = await fetch(CTA_API);
                const data = await res.json();
                const validCta = data.filter((item: CtaOption) => item.cta);
                setCtaOptions(validCta);
            } catch (err) {
                console.error('Failed to fetch CTA options:', err);
            } finally {
                setCtaLoading(false);
            }
        };
        fetchCtaOptions();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!clientBio.trim() || !selectedTemplate) {
            toast({
                title: "Error",
                description: "Please fill in all fields",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);
        setGeneratedScript('');

        try {
            const templateLogic = TEMPLATES.find(t => t.label === selectedTemplate)?.value || '';

            const res = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    client_bio_input: clientBio,
                    template_structure: templateLogic,
                    cta: selectedCta
                }),
            });

            if (!res.ok) {
                throw new Error(`Request failed with status ${res.status}`);
            }

            const data = await res.json();

            // Assume the webhook returns { output: "script..." } or just the text
            const script = data.output || data.script || (typeof data === 'string' ? data : JSON.stringify(data, null, 2));
            setGeneratedScript(script);

            toast({
                title: "Success",
                description: "Script generated successfully!",
            });

        } catch (error) {
            console.error('Generation error:', error);
            toast({
                title: "Error",
                description: "Failed to generate script. Please try again.",
                variant: "destructive"
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
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4 glow-primary">
                        <UserPlus className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                        Client <span className="gradient-text">Onboarding</span>
                    </h1>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Generate high-retention Reel scripts from client bios and proven templates.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input Form */}
                    <div className="glass rounded-2xl p-6 md:p-8 shadow-card h-fit">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="clientBio">Client Bio</Label>
                                <Textarea
                                    id="clientBio"
                                    value={clientBio}
                                    onChange={(e) => setClientBio(e.target.value)}
                                    placeholder="Paste client bio here..."
                                    className="min-h-[200px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="template">Template Structure</Label>
                                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a template structure" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TEMPLATES.map((template) => (
                                            <SelectItem key={template.label} value={template.label}>
                                                {template.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* CTA Dropdown */}
                            <div className="space-y-3">
                                <Label htmlFor="cta" className="text-muted-foreground">CTA (Call to Action)</Label>
                                <Select
                                    value={ctaOptions.find(opt => opt.cta === selectedCta)?.cta || ''}
                                    onValueChange={setSelectedCta}
                                >
                                    <SelectTrigger className="bg-secondary border-border focus:border-primary focus:ring-primary/20">
                                        <SelectValue placeholder={ctaLoading ? "Loading CTA options..." : "Select a CTA template"} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover border-border z-50">
                                        {ctaOptions.length > 0 ? (
                                            ctaOptions.map((option, index) => (
                                                <SelectItem key={index} value={option.cta}>
                                                    {option.cta}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="_empty" disabled>
                                                No CTA options available
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>

                                {/* Editable CTA Textarea */}
                                <Textarea
                                    id="cta"
                                    value={selectedCta}
                                    onChange={(e) => setSelectedCta(e.target.value)}
                                    placeholder="Select a template above or type your own CTA..."
                                    rows={2}
                                    className="bg-secondary border-border focus:border-primary focus:ring-primary/20 resize-y"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 glow-primary transition-all"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5 mr-2" />
                                        Generate Script
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>

                    {/* Output Display */}
                    <div className="h-fit">
                        {isLoading ? (
                            <div className="glass rounded-2xl p-6 md:p-8 shadow-card flex flex-col items-center justify-center min-h-[300px] text-center">
                                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                                <p className="text-muted-foreground font-medium">Generating script...</p>
                            </div>
                        ) : generatedScript ? (
                            <ResponseDisplay
                                response={{
                                    paraphrased: generatedScript
                                }}
                            />
                        ) : (
                            <div className="glass rounded-2xl p-6 md:p-8 shadow-card flex flex-col items-center justify-center min-h-[300px] text-center">
                                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                    <UserPlus className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground">
                                    Generated script will appear here
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientOnboarding;
