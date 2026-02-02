import { useState, useEffect } from 'react';
import { Users, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { PersonaResponseDisplay } from '@/components/PersonaResponseDisplay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CLIENTS_ENDPOINT = 'https://n8n.srv1151765.hstgr.cloud/webhook/client-description';

interface Client {
    Client: string;
    Voice: string;
}

type ContentFormat = 'looping-video' | 'carousel';
type Tone = 'Calm' | 'Bold' | 'Direct' | 'Aspirational' | 'Educational';

interface UniversalInputs {
    clientName: string;
    clientRole: string;
    clientNiche: string;
    targetAudience: string;
    audiencePainPoint: string;
    desiredOutcome: string;
    tone: Tone;
    format: ContentFormat;
    contentPillar: string;
}

const PILLARS: { value: string; label: string; format: ContentFormat }[] = [
    // Text Overlay Video Pillars
    { value: 'bts-pain-points', label: 'BTS / Pain Points (Video)', format: 'looping-video' },
    { value: 'storytelling-motivational', label: 'Storytelling – Motivational (Video)', format: 'looping-video' },
    { value: 'quick-tips', label: 'Quick Tips / Hacks (Video)', format: 'looping-video' },
    { value: 'testimonial', label: 'Testimonial (Video)', format: 'looping-video' },
    { value: 'storytelling-future', label: 'Storytelling – Future Pacing (Video)', format: 'looping-video' },
    // Carousel Pillars
    { value: 'founders-journey', label: "Founder's Journey (Carousel)", format: 'carousel' },
    { value: 'case-study', label: 'Case Study (Carousel)', format: 'carousel' },
    { value: 'educational', label: 'Educational (Carousel)', format: 'carousel' }
];

const PersonaGenerator = () => {
    const [tipType, setTipType] = useState<string>('Default');
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
        tone: 'Direct',
        format: 'looping-video',
        contentPillar: 'bts-pain-points'
    });

    // New State for Persona Generator
    const [personaInput, setPersonaInput] = useState('');
    const [isSuggestingPersona, setIsSuggestingPersona] = useState(false);
    const [autoFilledFields, setAutoFilledFields] = useState<Record<string, boolean>>({});
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClient, setSelectedClient] = useState<string>('');
    const [loadingClients, setLoadingClients] = useState(false);

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
                    variant: 'destructive'
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
            setPersonaInput(clientData.Voice);
        }
    };

    const handleSuggestPersona = async () => {
        setIsSuggestingPersona(true);
        try {
            const API_ENDPOINT = 'https://n8n.srv1151765.hstgr.cloud/webhook/suggest-persona';
            const res = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    persona: personaInput,
                    format: inputs.format,
                    client: selectedClient
                })
            });
            if (!res.ok) {
                throw new Error(`Request failed with status ${res.status}`);
            }
            let data = await res.json();

            // Handle array response
            if (Array.isArray(data) && data.length > 0) {
                data = data[0];
            }
            if (data && typeof data === 'object') {
                // Map the verbose keys from the webhook to our internal state keys
                const mappedData = {
                    clientName: data['Client Name'] || data.clientName,
                    clientRole: data['Client Role / Title'] || data.clientRole,
                    clientNiche: data['Client Niche'] || data.clientNiche,
                    targetAudience: data['Target Audience'] || data.targetAudience,
                    audiencePainPoint: data['Primary Audience Pain Point'] || data.audiencePainPoint,
                    desiredOutcome: data['Primary Desired Outcome'] || data.desiredOutcome,
                    tone: data['Tone'] || data.tone,
                    contentPillar: data['Content Pillar'] || data.contentPillar
                };

                // Normalize Tone
                let normalizedTone: Tone = inputs.tone;
                if (mappedData.tone) {
                    const toneString = mappedData.tone.toLowerCase().trim();
                    const allowedTones: Tone[] = ['Calm', 'Bold', 'Direct', 'Aspirational', 'Educational'];
                    const foundTone = allowedTones.find(t => t.toLowerCase() === toneString);
                    if (foundTone) {
                        normalizedTone = foundTone;
                    }
                }

                // Handle Content Pillar mapping
                let updatedPillar = inputs.contentPillar;
                let updatedFormat = inputs.format;
                if (mappedData.contentPillar) {
                    const pillarString = mappedData.contentPillar.toLowerCase().trim();
                    const foundPillar = PILLARS.find(p => p.label.toLowerCase().includes(pillarString) || p.value.toLowerCase() === pillarString);
                    if (foundPillar) {
                        updatedPillar = foundPillar.value;
                        updatedFormat = foundPillar.format;
                        setAutoFilledFields(prev => ({ ...prev, contentPillar: true }));
                    }
                }

                setInputs(prev => ({
                    ...prev,
                    clientName: mappedData.clientName || prev.clientName,
                    clientRole: mappedData.clientRole || prev.clientRole,
                    clientNiche: mappedData.clientNiche || prev.clientNiche,
                    targetAudience: mappedData.targetAudience || prev.targetAudience,
                    audiencePainPoint: mappedData.audiencePainPoint || prev.audiencePainPoint,
                    desiredOutcome: mappedData.desiredOutcome || prev.desiredOutcome,
                    tone: normalizedTone,
                    contentPillar: updatedPillar,
                    format: updatedFormat
                }));

                // Mark fields as auto-filled
                const newAutoFilled: Record<string, boolean> = { ...autoFilledFields };
                Object.keys(mappedData).forEach(key => {
                    if (mappedData[key as keyof typeof mappedData]) {
                        newAutoFilled[key] = true;
                    }
                });
                setAutoFilledFields(newAutoFilled);
            }
            toast({
                title: 'Persona Analyzed',
                description: 'Client details have been updated based on the persona.'
            });
        } catch (error) {
            console.error('Persona usage error:', error);
            toast({
                title: 'Error',
                description: 'Failed to analyze persona. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setIsSuggestingPersona(false);
        }
    };

    const handleGenerate = async () => {
        setIsLoading(true);
        setResponse(null);
        try {
            const API_ENDPOINT = 'https://n8n.srv1151765.hstgr.cloud/webhook/persona-generator';
            const payload = {
                ...inputs,
                tipType: inputs.contentPillar === 'quick-tips' ? tipType : undefined,
            };
            const res = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                throw new Error(`Request failed with status ${res.status}`);
            }
            const data = await res.json();
            setResponse(data);
            toast({
                title: 'Success',
                description: 'Persona variations generated successfully!'
            });
        } catch (error) {
            console.error('Generation error:', error);
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to generate content. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const updateInput = (field: keyof UniversalInputs, value: string) => {
        setInputs(prev => {
            const next = { ...prev, [field]: value };

            // If updating content pillar, also update format
            if (field === 'contentPillar') {
                const foundPillar = PILLARS.find(p => p.value === value);
                if (foundPillar) {
                    next.format = foundPillar.format;
                }
            }

            return next;
        });

        // Remove auto-filled status when user manually edits
        if (autoFilledFields[field]) {
            setAutoFilledFields(prev => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    return <div className="min-h-screen bg-background relative overflow-hidden lg:pl-64">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 container max-w-7xl mx-auto px-4 py-12">
            {/* Header */}
            <div className="text-center mb-10 py-[50px]">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4 glow-primary">
                    <Users className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                    Persona <span className="gradient-text">Generator</span>
                </h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Generate detailed personas and ready-to-produce social media scripts
                </p>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Side - Input Form */}
                <div className="glass rounded-2xl p-6 md:p-8 shadow-card h-fit">
                    <h2 className="text-xl font-bold text-foreground mb-6">Persona Inputs</h2>

                    <div className="space-y-4">

                        {/* Persona Input Section */}
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-3">
                            <div>
                                <Label htmlFor="personaInput" className="text-primary font-semibold flex items-center gap-2">
                                    ✨ Persona Details Generator
                                </Label>
                                <p className="text-xs text-muted-foreground mb-2">
                                    Paste a persona description or bio to auto-fill the client details.
                                </p>
                                <div className="mb-3">
                                    <Select value={selectedClient} onValueChange={handleClientChange}>
                                        <SelectTrigger className="bg-background/50 border-primary/20">
                                            <SelectValue placeholder={loadingClients ? "Loading clients..." : "Select a client profile"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {clients.map(client => <SelectItem key={client.Client} value={client.Client}>
                                                {client.Client}
                                            </SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Textarea id="personaInput" value={personaInput} onChange={e => setPersonaInput(e.target.value)} placeholder="Paste persona description, bio, or 'About Me' text here..." className="bg-background/50" rows={3} />
                            </div>
                            <Button onClick={handleSuggestPersona} disabled={isSuggestingPersona || !personaInput.trim()} variant="secondary" className="w-full" size="sm">
                                {isSuggestingPersona ? <>
                                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                    Analyzing Persona...
                                </> : 'Auto-Fill Details'}
                            </Button>
                        </div>

                        <div className="h-px bg-border/50 my-4" />

                        <div>
                            <Label htmlFor="clientName">
                                Client Name
                                {autoFilledFields.clientName && <span className="ml-2 text-xs text-primary animate-in fade-in">✨ Auto-filled</span>}
                            </Label>
                            <Input id="clientName" value={inputs.clientName} onChange={e => updateInput('clientName', e.target.value)} placeholder="Enter client name" />
                        </div>

                        <div>
                            <Label htmlFor="clientRole">
                                Client Role / Title
                                {autoFilledFields.clientRole && <span className="ml-2 text-xs text-primary animate-in fade-in">✨ Auto-filled</span>}
                            </Label>
                            <Input id="clientRole" value={inputs.clientRole} onChange={e => updateInput('clientRole', e.target.value)} placeholder="e.g., Business Coach, Designer" />
                        </div>

                        <div>
                            <Label htmlFor="clientNiche">
                                Client Niche
                                {autoFilledFields.clientNiche && <span className="ml-2 text-xs text-primary animate-in fade-in">✨ Auto-filled</span>}
                            </Label>
                            <Input id="clientNiche" value={inputs.clientNiche} onChange={e => updateInput('clientNiche', e.target.value)} placeholder="e.g., Personal Branding, SaaS Marketing" />
                        </div>

                        <div>
                            <Label htmlFor="targetAudience">
                                Target Audience
                                {autoFilledFields.targetAudience && <span className="ml-2 text-xs text-primary animate-in fade-in">✨ Auto-filled</span>}
                            </Label>
                            <Input id="targetAudience" value={inputs.targetAudience} onChange={e => updateInput('targetAudience', e.target.value)} placeholder="e.g., Entrepreneurs, Freelancers" />
                        </div>

                        <div>
                            <Label htmlFor="audiencePainPoint">
                                Primary Audience Pain Point
                                {autoFilledFields.audiencePainPoint && <span className="ml-2 text-xs text-primary animate-in fade-in">✨ Auto-filled</span>}
                            </Label>
                            <Textarea id="audiencePainPoint" value={inputs.audiencePainPoint} onChange={e => updateInput('audiencePainPoint', e.target.value)} placeholder="Describe the main challenge your audience faces" rows={3} />
                        </div>

                        <div>
                            <Label htmlFor="desiredOutcome">
                                Primary Desired Outcome
                                {autoFilledFields.desiredOutcome && <span className="ml-2 text-xs text-primary animate-in fade-in">✨ Auto-filled</span>}
                            </Label>
                            <Textarea id="desiredOutcome" value={inputs.desiredOutcome} onChange={e => updateInput('desiredOutcome', e.target.value)} placeholder="What result does your audience want?" rows={3} />
                        </div>

                        <div>
                            <Label htmlFor="tone">
                                Tone
                                {autoFilledFields.tone && <span className="ml-2 text-xs text-primary animate-in fade-in">✨ Auto-filled</span>}
                            </Label>
                            <Select value={inputs.tone} onValueChange={value => updateInput('tone', value)}>
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
                            <Label htmlFor="contentPillar">
                                Content Pillar
                                {autoFilledFields.contentPillar && <span className="ml-2 text-xs text-primary animate-in fade-in">✨ Auto-filled</span>}
                            </Label>
                            <Select value={inputs.contentPillar} onValueChange={value => updateInput('contentPillar', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select content pillar" />
                                </SelectTrigger>
                                <SelectContent>
                                    {PILLARS.map(pillar => (
                                        <SelectItem key={pillar.value} value={pillar.value}>
                                            {pillar.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Tip Type Dropdown - Only shows when Quick Tips is selected */}
                        {inputs.contentPillar === 'quick-tips' && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <Label htmlFor="tipType">Tip Type</Label>
                                <Select value={tipType} onValueChange={setTipType}>
                                    <SelectTrigger className="bg-background/50 border-border">
                                        <SelectValue placeholder="Select tip type" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover border-border z-50">
                                        <SelectItem value="Default">Default</SelectItem>
                                        <SelectItem value="Audit Tip">Audit Tip</SelectItem>
                                        <SelectItem value="Shortcut Tip">Shortcut Tip</SelectItem>
                                        <SelectItem value="Rule Tip">Rule Tip</SelectItem>
                                        <SelectItem value="Mistake Tip">Mistake Tip</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <Button onClick={handleGenerate} disabled={isLoading} className="w-full" size="lg">
                            {isLoading ? <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </> : 'Generate Persona'}
                        </Button>
                    </div>
                </div>

                {/* Right Side - Response Display */}
                <div className="h-fit">
                    {isLoading ? <div className="glass rounded-2xl p-6 md:p-8 shadow-card flex flex-col items-center justify-center min-h-[400px] text-center">
                        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                        <p className="text-muted-foreground font-medium">Generating your persona...</p>
                        <p className="text-xs text-muted-foreground/70 mt-2">This may take a few moments</p>
                    </div> : response ? <PersonaResponseDisplay response={response} clientName={inputs.clientName} /> : <div className="glass rounded-2xl p-6 md:p-8 shadow-card flex flex-col items-center justify-center min-h-[400px] text-center">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <Users className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground">Result Section</p>
                        <p className="text-xs text-muted-foreground/70 mt-2">
                            Fill the form and click "Generate Persona"
                        </p>
                    </div>}
                </div>
            </div>
        </div>
    </div>;
};

export default PersonaGenerator;
