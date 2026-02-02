import { useState, useMemo } from 'react';
import { Copy, Check, User, Loader2, Save, Edit3, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface PersonaLine {
    personaLine1?: string;
    personaLine2?: string;
    personaLine3?: string;
    personaLine4?: string;
    personaLine5?: string;
    [key: string]: string | undefined;
}

interface PersonaResponse {
    output?: PersonaLine[];
}

interface PersonaResponseDisplayProps {
    response: PersonaResponse | PersonaResponse[];
    clientName: string;
}

const VariationCard = ({ text, label, clientName, className }: { text: string; label?: string; clientName: string; className?: string }) => {
    const [copied, setCopied] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(text);

    const handleCopy = () => {
        navigator.clipboard.writeText(editedText);
        setCopied(true);
        toast({
            title: 'Copied!',
            description: `${label || 'Item'} copied to clipboard`,
            duration: 1500,
        });
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSaveToSheet = async () => {
        setIsSaving(true);
        try {
            const API_ENDPOINT = 'https://n8n.srv1151765.hstgr.cloud/webhook/update-persona-sheet';
            const res = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    clientName: clientName,
                    persona: editedText,
                    variation: label
                })
            });

            if (!res.ok) throw new Error('Failed to save to sheet');

            setIsSaved(true);
            toast({
                title: 'Success',
                description: 'Persona saved to sheet successfully!',
            });
        } catch (error) {
            console.error('Save error:', error);
            toast({
                title: 'Error',
                description: 'Failed to save to sheet. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={cn("group flex flex-col gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all", className, isEditing && "border-primary/50 bg-primary/5")}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                    {label && <p className="text-[10px] uppercase tracking-wider text-primary font-bold mb-1">{label}</p>}
                    {isEditing ? (
                        <Textarea
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            className="bg-background/50 border-primary/20 min-h-[100px] text-sm leading-relaxed"
                            autoFocus
                        />
                    ) : (
                        <p className="text-foreground leading-relaxed">{editedText}</p>
                    )}
                </div>
                <div className="flex flex-col gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsEditing(!isEditing)}
                        className={cn(
                            "opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-primary shrink-0",
                            isEditing && "opacity-100 text-primary"
                        )}
                        title={isEditing ? "Finish editing" : "Edit variation"}
                    >
                        <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopy}
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-primary shrink-0"
                        title="Copy item"
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                </div>
            </div>
            <div className="flex justify-end pt-3 border-t border-white/5">
                <Button
                    variant="default"
                    size="sm"
                    onClick={handleSaveToSheet}
                    disabled={isSaving}
                    className="text-xs h-9 px-4 gap-2 shadow-glow hover:scale-105 transition-all duration-300 font-bold bg-primary text-primary-foreground"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="h-3.5 w-3.5" />
                            Save
                        </>
                    )}
                </Button>
            </div>

            {isSaved && (
                <div className="flex justify-end mt-1 animate-in fade-in slide-in-from-top-1 duration-300">
                    <a
                        href="https://docs.google.com/spreadsheets/d/1oQUbYqCJ-7A7S33459JycD2h60bb7Z8El1p4cTD5B_s/edit?gid=851312623#gid=851312623"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-primary hover:underline flex items-center gap-1 font-medium"
                    >
                        <ExternalLink className="w-2.5 h-2.5" />
                        Click here to see
                    </a>
                </div>
            )}
        </div>
    );
};

export const PersonaResponseDisplay = ({ response, clientName }: PersonaResponseDisplayProps) => {
    const [copied, setCopied] = useState(false);

    const personaLines = useMemo(() => {
        const data = Array.isArray(response) ? response[0] : response;
        if (!data || !data.output || !Array.isArray(data.output)) return [];

        const output = data.output[0];
        if (!output) return [];

        return Object.entries(output)
            .filter(([key, value]) => key.startsWith('personaLine') && typeof value === 'string')
            .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
            .map(([key, value]) => ({
                id: key,
                label: `Variation ${key.replace('personaLine', '')}`,
                text: value as string
            }));
    }, [response]);

    const handleCopyAll = () => {
        const textToCopy = personaLines.map(line => `${line.label}:\n${line.text}`).join('\n\n');
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        toast({
            title: 'Copied!',
            description: 'All variations copied to clipboard',
        });
        setTimeout(() => setCopied(false), 2000);
    };

    if (personaLines.length === 0) {
        return (
            <div className="glass rounded-2xl p-6 md:p-8 shadow-card flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
                    <User className="w-8 h-8" />
                </div>
                <p className="text-muted-foreground">No persona variations found in the response.</p>
                <div className="mt-4 p-4 bg-muted/20 rounded-xl text-left">
                    <pre className="text-[10px] overflow-auto max-w-[300px]">
                        {JSON.stringify(response, null, 2)}
                    </pre>
                </div>
            </div>
        );
    }

    return (
        <div className="glass rounded-2xl p-6 md:p-8 shadow-card">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-bold text-foreground">Persona Variations</h3>
                    <p className="text-xs text-muted-foreground mt-1">Generated based on your inputs</p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyAll}
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

            <div className="space-y-4">
                {personaLines.map((line) => (
                    <VariationCard
                        key={line.id}
                        text={line.text}
                        label={line.label}
                        clientName={clientName}
                    />
                ))}
            </div>
        </div>
    );
};
