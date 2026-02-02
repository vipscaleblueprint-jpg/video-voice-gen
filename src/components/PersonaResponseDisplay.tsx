import { useState, useMemo } from 'react';
import { Copy, Check, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
}

const CopyableItem = ({ text, label, className }: { text: string; label?: string; className?: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast({
            title: 'Copied!',
            description: `${label || 'Item'} copied to clipboard`,
            duration: 1500,
        });
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={cn("group flex items-start justify-between gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all", className)}>
            <div className="flex-1">
                {label && <p className="text-[10px] uppercase tracking-wider text-primary font-bold mb-1">{label}</p>}
                <p className="text-foreground leading-relaxed">{text}</p>
            </div>
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
    );
};

export const PersonaResponseDisplay = ({ response }: PersonaResponseDisplayProps) => {
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
                    <CopyableItem
                        key={line.id}
                        text={line.text}
                        label={line.label}
                    />
                ))}
            </div>
        </div>
    );
};
