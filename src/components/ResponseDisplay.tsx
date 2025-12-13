import { ChevronDown, Copy, Check, FileText, Globe, Sparkles, Clock } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface TimestampItem {
  text: string;
  start: number;
  end: number;
  type: string;
  logprob: number;
}

interface ApiResponse {
  original: string;
  language_code: string;
  paraphrased: string;
  hook?: string;
  timestamps: TimestampItem[];
}

interface ResponseDisplayProps {
  response: ApiResponse;
}

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-muted"
    >
      {copied ? (
        <Check className="w-4 h-4 text-success" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </Button>
  );
};

const ResponseCard = ({
  icon: Icon,
  title,
  content,
  badge,
  className,
}: {
  icon: React.ElementType;
  title: string;
  content: string;
  badge?: string;
  className?: string;
}) => (
  <div className={cn("glass rounded-xl p-5 space-y-3", className)}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        {badge && (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-accent/20 text-accent uppercase">
            {badge}
          </span>
        )}
      </div>
      <CopyButton text={content} />
    </div>
    <p className="text-muted-foreground leading-relaxed text-sm">{content}</p>
  </div>
);

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(1);
  return mins > 0 ? `${mins}:${secs.padStart(4, '0')}` : `${secs}s`;
};

export const ResponseDisplay = ({ response }: ResponseDisplayProps) => {
  const [isScriptOpen, setIsScriptOpen] = useState(false);

  return (
    <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 mb-6">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Analysis Results
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Language Badge */}
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-primary" />
        <span className="text-sm text-muted-foreground">Detected Language:</span>
        <span className="px-3 py-1 text-sm font-medium rounded-full bg-primary/20 text-primary">
          {response.language_code.toUpperCase()}
        </span>
      </div>

      {/* Original Transcript */}
      <ResponseCard
        icon={FileText}
        title="Original Transcript"
        content={response.original}
      />

      {/* Paraphrased Version */}
      <ResponseCard
        icon={Sparkles}
        title="Paraphrased Version"
        content={response.paraphrased}
        className="border-primary/20"
      />

      {/* Hook */}
      {response.hook && (
        <ResponseCard
          icon={Sparkles}
          title="Hook"
          content={response.hook}
          className="border-accent/20"
        />
      )}

      {/* Timestamps */}
      {response.timestamps && response.timestamps.length > 0 && (
        <Collapsible open={isScriptOpen} onOpenChange={setIsScriptOpen}>
          <div className="glass rounded-xl overflow-hidden">
            <CollapsibleTrigger asChild>
              <button className="w-full p-5 flex items-center justify-between hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">Timestamps</h3>
                  <span className="text-sm text-muted-foreground">
                    ({response.timestamps.filter(t => t.type === 'word').length} words)
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 text-muted-foreground transition-transform duration-200",
                    isScriptOpen && "rotate-180"
                  )}
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-5 pb-5 max-h-80 overflow-y-auto">
                <div className="flex flex-wrap gap-1">
                  {response.timestamps
                    .filter(item => item.type === 'word')
                    .map((item, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50 hover:bg-muted transition-colors cursor-default group"
                        title={`${formatTime(item.start)} → ${formatTime(item.end)}`}
                      >
                        <span className="text-foreground text-sm">{item.text.trim()}</span>
                        <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                          {formatTime(item.start)}
                        </span>
                      </span>
                    ))}
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      )}
    </div>
  );
};
