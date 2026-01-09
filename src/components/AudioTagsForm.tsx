import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Send, Plus, Trash2, Wand2, Sparkles } from 'lucide-react';
import { AlertCircle } from 'lucide-react';

export interface AudioTagsFormPayload {
    scripts: string[];
    theme?: string;
    language: string;
}

interface AudioTagsFormProps {
    onSubmit: (payload: AudioTagsFormPayload) => Promise<void>;
    isLoading: boolean;
}

const THEMES = [
    'Professional',
    'Friendly',
    'Energetic',
    'Calm',
    'Dramatic',
];

const LANGUAGES = [
    'English',
    'Tagalog',
    'Taglish',
    'Spanish',
    'French',
    'German',
    'Italian',
    'Portuguese',
    'Japanese',
    'Korean',
    'Chinese',
    'Hindi',
    'Arabic',
    'Russian',
    'Dutch',
    'Polish',
    'Vietnamese',
    'Thai',
    'Indonesian',
    'Malay',
];

export const AudioTagsForm = ({ onSubmit, isLoading }: AudioTagsFormProps) => {
    const [scripts, setScripts] = useState<string[]>(['']);
    const [theme, setTheme] = useState('');
    const [customStyle, setCustomStyle] = useState('');
    const [isAdvancedMode, setIsAdvancedMode] = useState(false);
    const [language, setLanguage] = useState('English');
    const [error, setError] = useState<string | null>(null);

    const handleScriptChange = (index: number, value: string) => {
        const newScripts = [...scripts];
        newScripts[index] = value;
        setScripts(newScripts);
    };

    const addScript = () => {
        if (scripts.length < 4) {
            setScripts([...scripts, '']);
        }
    };

    const removeScript = (index: number) => {
        const newScripts = scripts.filter((_, i) => i !== index);
        setScripts(newScripts.length ? newScripts : ['']);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Filter out empty scripts
        const validScripts = scripts.map(s => s.trim()).filter(s => s.length > 0);

        if (validScripts.length === 0) {
            setError('Please enter at least one script.');
            return;
        }

        const selectedTheme = isAdvancedMode ? customStyle : theme;

        setError(null);
        await onSubmit({
            scripts: validScripts,
            theme: selectedTheme || undefined,
            language
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Language - Moved to top left for better layout balance */}
                <div className="space-y-2">
                    <Label htmlFor="language" className="text-muted-foreground">
                        Language
                    </Label>
                    <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="bg-secondary border-border focus:border-primary focus:ring-primary/20">
                            <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border z-50">
                            {LANGUAGES.map((l) => (
                                <SelectItem key={l} value={l}>
                                    {l}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2 h-5">
                        <Label htmlFor="theme" className="text-muted-foreground">
                            {isAdvancedMode ? 'Custom Instruction' : 'Theme (Optional)'}
                        </Label>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                {isAdvancedMode ? 'Advanced' : 'Simple'}
                            </span>
                            <Switch
                                checked={isAdvancedMode}
                                onCheckedChange={setIsAdvancedMode}
                                className="scale-75 origin-right"
                            />
                        </div>
                    </div>

                    {isAdvancedMode ? (
                        <div className="relative animate-in fade-in-0 zoom-in-95 duration-200">
                            <Textarea
                                value={customStyle}
                                onChange={(e) => setCustomStyle(e.target.value)}
                                placeholder="Describe the specific style or tone (e.g., 'Whispering like a secret agent')..."
                                className="bg-secondary border-border focus:border-primary focus:ring-primary/20 resize-y min-h-[80px] py-2 leading-tight pr-8"
                                rows={3}
                            />
                            <Wand2 className="absolute right-3 top-3 w-4 h-4 text-muted-foreground opacity-50 pointer-events-none" />
                        </div>
                    ) : (
                        <div className="animate-in fade-in-0 zoom-in-95 duration-200">
                            <Select value={theme} onValueChange={setTheme}>
                                <SelectTrigger className="bg-secondary border-border focus:border-primary focus:ring-primary/20">
                                    <SelectValue placeholder="Select a theme" />
                                </SelectTrigger>
                                <SelectContent className="bg-popover border-border z-50">
                                    {THEMES.map((t) => (
                                        <SelectItem key={t} value={t}>
                                            {t}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="text-muted-foreground">
                        Scripts <span className="text-destructive">*</span>
                        <span className="text-xs text-muted-foreground ml-2 font-normal">
                            ({scripts.length}/4)
                        </span>
                    </Label>
                    <Button
                        type="button"
                        onClick={addScript}
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1 h-7"
                        disabled={scripts.length >= 4}
                    >
                        <Plus className="w-3 h-3" />
                        Add Script
                    </Button>
                </div>

                {scripts.map((script, index) => (
                    <div key={index} className="relative group animate-in fade-in-0 slide-in-from-top-2 duration-200">
                        <Textarea
                            value={script}
                            onChange={(e) => handleScriptChange(index, e.target.value)}
                            placeholder={`Enter script ${index + 1}...`}
                            rows={5}
                            className="bg-secondary border-border focus:border-primary focus:ring-primary/20 resize-y pr-10 text-base"
                        />
                        {scripts.length > 1 && (
                            <Button
                                type="button"
                                onClick={() => removeScript(index)}
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-50 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                ))}
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 glow-primary transition-all"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Applying Tags...
                    </>
                ) : (
                    <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Apply Tags
                    </>
                )}
            </Button>
        </form>
    );
};
