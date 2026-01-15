
import { useState } from 'react';
import { Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export interface ThumbnailHookFormPayload {
  script: string;
}

interface ThumbnailHookFormProps {
  onSubmit: (payload: ThumbnailHookFormPayload) => Promise<void>;
  isLoading: boolean;
}

export const ThumbnailHookForm = ({ onSubmit, isLoading }: ThumbnailHookFormProps) => {
  const [script, setScript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!script.trim()) {
      setError('Please enter a script.');
      return;
    }

    setError(null);
    await onSubmit({ script: script.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="script" className="text-muted-foreground">
          Script <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="script"
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="Paste your video script here..."
          rows={10}
          className="bg-secondary border-border focus:border-primary focus:ring-primary/20 resize-y"
          required
        />
        <p className="text-xs text-muted-foreground/70">
          The AI will generate 10 viral hooks based on this script.
        </p>
      </div>

      {error && (
        <div className="text-destructive text-sm font-medium">
          {error}
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
            Generating Hooks...
          </>
        ) : (
          <>
            <Zap className="w-5 h-5 mr-2" />
            Generate Viral Hooks
          </>
        )}
      </Button>
    </form>
  );
};
