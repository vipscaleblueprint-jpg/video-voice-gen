import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, UserPlus, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ResponseDisplay } from '@/components/ResponseDisplay';

const API_ENDPOINT = 'https://n8n.srv1151765.hstgr.cloud/webhook/client-onboarding';
const CLIENTS_ENDPOINT = 'https://n8n.srv1151765.hstgr.cloud/webhook/client-description';
const SCRIPT_API_ENDPOINT = 'https://n8n.srv1151765.hstgr.cloud/webhook/client-onboarding-script';

interface Client {
    Client: string;
    Voice: string;
}

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
    const [clientAdditionalInfo, setClientAdditionalInfo] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingScript, setIsGeneratingScript] = useState(false);
    const [generatedScript, setGeneratedScript] = useState<any>(null);
    const [finalScript, setFinalScript] = useState<string>('');

    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClient, setSelectedClient] = useState<string>('');
    const [loadingClients, setLoadingClients] = useState(false);

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

    // Fetch Clients
    useEffect(() => {
        const fetchClients = async () => {
            setLoadingClients(true);
            try {
                const res = await fetch(CLIENTS_ENDPOINT);
                if (!res.ok) throw new Error('Failed to fetch clients');
                const data = await res.json();
                setClients(data);
            } catch (error) {
                console.error('Failed to fetch clients:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load client list',
                    variant: 'destructive',
                });
            } finally {
                setLoadingClients(false);
            }
        };

        fetchClients();
    }, []);

    const handleClientChange = (clientId: string) => {
        setSelectedClient(clientId);
        const clientData = clients.find(c => c.Client === clientId);
        if (clientData) {
            setClientBio(clientData.Voice);
        }
    };

    // Helper to recursively extract the structured part of the response
    const extractStructuredData = (content: any): any => {
        if (!content) return null;

        // If it's already an object (and not an array)
        if (typeof content === 'object' && content !== null && !Array.isArray(content)) {
            // Check for nested structured fields first
            if (content.output && typeof content.output === 'object' && !Array.isArray(content.output)) {
                return content.output;
            }
            if (content.script && typeof content.script === 'object' && !Array.isArray(content.script)) {
                return content.script;
            }
            // It's already the structured object we want
            return content;
        }

        // If it's a string, try to parse it
        if (typeof content === 'string') {
            const trimmed = content.trim();
            if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                try {
                    const parsed = JSON.parse(trimmed);
                    // Recurse to handle potentially nested output/script within the parsed string
                    return extractStructuredData(parsed);
                } catch (e) {
                    return null;
                }
            }
        }

        return null;
    };

    const formatStructuredData = (structured: any): string => {
        return Object.entries(structured).map(([key, value]) => {
            const label = key.replace(/_/g, ' ').toUpperCase();
            let content = '';

            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                // Prettify nested step objects
                content = Object.entries(value).map(([vKey, vVal]) => {
                    return `${vKey.toUpperCase()}: ${vVal}`;
                }).join('\n');
            } else {
                content = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
            }

            return `[ ${label} ]\n${content}`;
        }).join('\n\n');
    };

    const handleGenerateScript = async () => {
        if (!generatedScript?.paraphrased) return;

        setIsGeneratingScript(true);
        try {
            const templateLogic = TEMPLATES.find(t => t.label === selectedTemplate)?.value || '';
            const res = await fetch(SCRIPT_API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    client_bio_input: clientBio,
                    client_additional_info: clientAdditionalInfo,
                    template_structure: templateLogic,
                    cta: selectedCta,
                    client: selectedClient,
                    internal_logic: generatedScript.paraphrased
                }),
            });

            if (!res.ok) throw new Error(`Request failed with status ${res.status}`);

            let data = await res.json();

            // Handle array response
            if (Array.isArray(data) && data.length > 0) {
                data = data[0];
            }

            const structured = extractStructuredData(data);
            if (structured) {
                setFinalScript(formatStructuredData(structured));
            } else {
                const script = data.output || data.script || (typeof data === 'string' ? data : JSON.stringify(data, null, 2));
                setFinalScript(script);
            }

            toast({
                title: "Script Generated",
                description: "The final script is ready!",
            });
        } catch (error) {
            console.error('Script generation error:', error);
            toast({
                title: "Error",
                description: "Failed to generate the final script.",
                variant: "destructive"
            });
        } finally {
            setIsGeneratingScript(false);
        }
    };

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
                    client_additional_info: clientAdditionalInfo,
                    template_structure: templateLogic,
                    cta: selectedCta,
                    client: selectedClient
                }),
            });

            if (!res.ok) {
                throw new Error(`Request failed with status ${res.status}`);
            }

            let data = await res.json();

            // Handle array response (common with n8n)
            if (Array.isArray(data) && data.length > 0) {
                data = data[0];
            }

            // Handle structured JSON response
            let responseData: any = {};
            const structured = extractStructuredData(data);

            if (structured) {
                responseData.paraphrased = formatStructuredData(structured);
                responseData.preserveWhitespace = true; // Ensure newline preservation
            } else {
                // Fallback to string display if no structured data found
                const rawContent = data.output || data.script || (typeof data === 'string' ? data : JSON.stringify(data, null, 2));
                responseData.paraphrased = rawContent;
                responseData.preserveWhitespace = true;
            }

            setGeneratedScript(responseData);

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
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-3">
                                    <Label htmlFor="clientProfile" className="text-primary font-semibold flex items-center gap-2">
                                        ✨ Client Profile Selector
                                    </Label>
                                    <Select value={selectedClient} onValueChange={handleClientChange}>
                                        <SelectTrigger className="bg-background/50 border-primary/20">
                                            <SelectValue placeholder={loadingClients ? "Loading clients..." : "Select a client profile"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {clients.map((client) => (
                                                <SelectItem key={client.Client} value={client.Client}>
                                                    {client.Client}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="clientBio">Client Bio</Label>
                                    <Textarea
                                        id="clientBio"
                                        value={clientBio}
                                        onChange={(e) => setClientBio(e.target.value)}
                                        placeholder="Paste client bio here or select a profile above..."
                                        className="min-h-[200px]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="clientAdditionalInfo">Client Additional Info</Label>
                                    <Textarea
                                        id="clientAdditionalInfo"
                                        value={clientAdditionalInfo}
                                        onChange={(e) => setClientAdditionalInfo(e.target.value)}
                                        placeholder="Add any extra details, specific requirements, or contexts..."
                                        className="min-h-[120px]"
                                    />
                                </div>
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
                                        Generate Internal Logic
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
                            <div className="space-y-6">
                                <ResponseDisplay
                                    response={generatedScript}
                                    paraphrasedLabel="Internal Logic"
                                    secondaryAction={{
                                        label: "Generate Script",
                                        onClick: handleGenerateScript,
                                        isLoading: isGeneratingScript
                                    }}
                                />

                                {isGeneratingScript && (
                                    <div className="glass rounded-2xl p-6 md:p-8 shadow-card flex flex-col items-center justify-center min-h-[200px] text-center">
                                        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                                        <p className="text-muted-foreground font-medium">Drafting final script...</p>
                                    </div>
                                )}

                                {finalScript && (
                                    <ResponseDisplay
                                        response={{
                                            paraphrased: finalScript,
                                            preserveWhitespace: true
                                        }}
                                        paraphrasedLabel="Final Script"
                                    />
                                )}
                            </div>
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
