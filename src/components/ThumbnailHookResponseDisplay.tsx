
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface ThumbnailHookResponseDisplayProps {
  titles: string[];
}

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: 'Copied!', description: 'Copied to clipboard.' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      className="h-8 w-8 text-muted-foreground hover:text-primary shrink-0"
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
    </Button>
  );
};

export const ThumbnailHookResponseDisplay = ({ titles }: ThumbnailHookResponseDisplayProps) => {
  if (!titles || titles.length === 0) {
    return null;
  }

  return (
    <div className="glass rounded-2xl p-6 md:p-8 shadow-card space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          Viral Hooks ({titles.length})
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            await navigator.clipboard.writeText(titles.join('\n'));
            toast({ title: 'All Copied', description: 'All hooks copied to clipboard.' });
          }}
        >
          Copy All
        </Button>
      </div>

      <div className="space-y-3">
        {titles.map((title, index) => (
          <div
            key={index}
            className="group flex items-center justify-between bg-secondary/50 hover:bg-secondary/80 rounded-xl p-4 border border-border transition-colors"
          >
            <div className="flex gap-4 items-start w-full">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
                {index + 1}
              </span>
              <p className="text-foreground font-medium pt-0.5">{title}</p>
            </div>
            <CopyButton text={title} />
          </div>
        ))}
      </div>
    </div>
  );
};
