import { Copy, Check, Edit2, Save, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

interface AudioTagsResponseDisplayProps {
    response: string[];
}

const HighlightedText = ({ text }: { text: string }) => {
    // Regex to find text within square brackets, e.g., [friendly]
    const parts = text.split(/(\[[^\]]+\])/g);

    return (
        <span>
            {parts.map((part, index) => {
                if (part.startsWith('[') && part.endsWith(']')) {
                    return (
                        <span key={index} className="text-violet-500 font-semibold">
                            {part}
                        </span>
                    );
                }
                return part;
            })}
        </span>
    );
};

const ResultItem = ({ initialText, index }: { initialText: string; index: number }) => {
    const [text, setText] = useState(initialText);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(initialText);
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        toast({ title: 'Copied!', description: 'Result copied to clipboard.' });
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSave = () => {
        setText(editText);
        setIsEditing(false);
        toast({ title: 'Saved', description: 'Changes saved successfully.' });
    };

    const handleCancel = () => {
        setEditText(text);
        setIsEditing(false);
    };

    return (
        <div className="bg-secondary/50 rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Script {index + 1}
                </span>
                <div className="flex items-center gap-1">
                    {isEditing ? (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleSave}
                                className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-500/10"
                                title="Save changes"
                            >
                                <Save className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleCancel}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                title="Cancel editing"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsEditing(true)}
                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                title="Edit text"
                            >
                                <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleCopy}
                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                title="Copy to clipboard"
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="relative group">
                {isEditing ? (
                    <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="min-h-[100px] font-mono bg-background/80"
                        placeholder="Edit your script..."
                    />
                ) : (
                    <p className="text-foreground text-sm whitespace-pre-wrap bg-background/50 p-4 rounded-md font-mono">
                        <HighlightedText text={text} />
                    </p>
                )}
            </div>
        </div>
    );
};

export const AudioTagsResponseDisplay = ({ response }: AudioTagsResponseDisplayProps) => {
    if (!response || response.length === 0) return null;

    return (
        <div className="glass rounded-2xl p-6 md:p-8 shadow-card space-y-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
                Results ({response.length})
            </h2>

            <div className="space-y-4">
                {response.map((text, index) => (
                    <ResultItem key={index} initialText={text} index={index} />
                ))}
            </div>
        </div>
    );
};
