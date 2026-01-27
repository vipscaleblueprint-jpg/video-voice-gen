import { ChevronDown, Copy, Check, FileText, Globe, Sparkles, Clock, MessageSquare, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { CaptionResponseDisplay } from '@/components/CaptionResponseDisplay';
import type { SocialCaptions } from '@/types';

interface TimestampItem {
  text: string;
  start: number;
  end: number;
}

interface ApiResponse {
  original?: string;
  language_code?: string;
  paraphrased?: string;
  final_script?: string;
  persona_line?: string;
  bridge_line?: string;
  credibility_line?: string;
  hook?: string;
  caption?: string;
  captions?: SocialCaptions;
  timestamps?: TimestampItem[];
  // Top-level platform captions (optional)
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  x?: string;
  youtube?: string;
  linkedin?: string;
  snapchat?: string;
  pinterest?: string;
  reddit?: string;
  threads?: string;
  sections?: { label: string; content: string }[];
  preserveWhitespace?: boolean;
}

interface ResponseDisplayProps {
  response: ApiResponse;
  paraphrasedLabel?: string;
  secondaryAction?: {
    label: string;
    onClick: () => void;
    isLoading?: boolean;
    icon?: React.ElementType;
  };
}

const CopyButton = ({ text, showLabel = false }: { text: string; showLabel?: boolean }) => {
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
      className={cn("h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-muted font-medium", showLabel && "gap-2")}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-success" />
          {showLabel && <span className="text-success">Copied!</span>}
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          {showLabel && <span>Copy All</span>}
        </>
      )}
    </Button>
  );
};

const LineCopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    // Strip "[ STEP X ]" or "[ LABEL ]" if it's just a header line? 
    // Actually, user said line per line, so let's copy exactly what's there but maybe trim.
    await navigator.clipboard.writeText(text.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
    >
      {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
    </Button>
  );
};

const ResponseCard = ({
  icon: Icon,
  title,
  content,
  badge,
  className,
  preserveWhitespace = false,
  secondaryAction,
}: {
  icon: React.ElementType;
  title: string;
  content: string;
  badge?: string;
  className?: string;
  preserveWhitespace?: boolean;
  secondaryAction?: {
    label: string;
    onClick: () => void;
    isLoading?: boolean;
    icon?: React.ElementType;
  };
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
      <CopyButton text={content} showLabel={title.toLowerCase() === 'internal logic' || !!badge} />
    </div>
    <div className={cn(
      "text-foreground leading-relaxed text-sm",
      preserveWhitespace && "whitespace-pre-wrap"
    )}>
      {content.split('\n').map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-2" />;

        // Don't show copy button for step headers like [ STEP 1 ] if we want to be clean
        // But user said "line per line", so let's enable it for all non-empty lines
        return (
          <div key={idx} className="group flex items-start justify-between gap-4 py-0.5 hover:bg-primary/5 rounded px-1 -mx-1 transition-colors">
            <span className="flex-1">{line}</span>
            <LineCopyButton text={line} />
          </div>
        );
      })}
    </div>

    {secondaryAction && (
      <Button
        onClick={(e) => {
          e.stopPropagation();
          secondaryAction.onClick();
        }}
        disabled={secondaryAction.isLoading}
        className="w-full mt-2 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
        variant="outline"
        size="sm"
      >
        {secondaryAction.isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : secondaryAction.icon ? (
          <secondaryAction.icon className="w-4 h-4 mr-2" />
        ) : (
          <Sparkles className="w-4 h-4 mr-2" />
        )}
        {secondaryAction.label}
      </Button>
    )}
  </div>
);

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};


export const ResponseDisplay = ({ response, paraphrasedLabel, secondaryAction }: ResponseDisplayProps) => {
  const [isScriptOpen, setIsScriptOpen] = useState(false);

  // Build captions from either nested captions object or top-level platform fields
  const socialCaptions: SocialCaptions = { ...response.captions };

  // Helper to convert legacy string captions to CaptionData structure
  const addPlatformCaption = (platform: string, content?: string) => {
    if (content && !socialCaptions[platform]) {
      socialCaptions[platform] = {
        content: content,
        title: '',
        hashtags: '',
        caption: ''
      };
    }
  };

  addPlatformCaption('facebook', response.facebook);
  addPlatformCaption('instagram', response.instagram);
  addPlatformCaption('tiktok', response.tiktok);
  addPlatformCaption('x', response.x);
  addPlatformCaption('youtube', response.youtube);
  addPlatformCaption('linkedin', response.linkedin);
  addPlatformCaption('snapchat', response.snapchat);
  addPlatformCaption('pinterest', response.pinterest);
  addPlatformCaption('reddit', response.reddit);
  addPlatformCaption('threads', response.threads);

  const hasValidCaptions = Object.values(socialCaptions).some(
    v => v && typeof v === 'object' && 'content' in v && typeof (v as any).content === 'string' && (v as any).content.trim()
  );

  return (
    <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 mb-6">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        <span className="text-xs font-medium text-foreground uppercase tracking-wider">
          Analysis Results
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Language Badge */}
      {response.language_code && (
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">Detected Language:</span>
          <span className="px-3 py-1 text-sm font-medium rounded-full bg-primary/20 text-primary">
            {response.language_code.toUpperCase()}
          </span>
        </div>
      )}

      {/* Original Transcript */}
      {response.original && (
        <ResponseCard
          icon={FileText}
          title="Original Transcript"
          content={response.original}
        />
      )}

      {/* Final Script (Most Important) */}
      {response.final_script && (
        <ResponseCard
          icon={Sparkles}
          title="Final Script"
          content={response.final_script}
          className="border-primary bg-primary/5"
          badge="Ready to Use"
        />
      )}

      {/* Paraphrased Version */}
      {response.paraphrased && (
        <ResponseCard
          icon={Sparkles}
          title={paraphrasedLabel || "Paraphrased Version"}
          content={response.paraphrased}
          className="border-primary/20"
          preserveWhitespace={response.preserveWhitespace}
          secondaryAction={secondaryAction}
        />
      )}

      {/* Structured Sections */}
      {response.sections && response.sections.length > 0 && (
        <div className="space-y-4">
          {response.sections.map((section, index) => (
            <ResponseCard
              key={index}
              icon={Sparkles}
              title={section.label}
              content={section.content}
              className="border-primary/10"
              preserveWhitespace={true}
            />
          ))}
        </div>
      )}

      {/* Hook */}
      {response.hook && (
        <ResponseCard
          icon={Sparkles}
          title="Hook"
          content={response.hook}
          className="border-accent/20"
        />
      )}


      {/* Generated Persona (Displayed after all analysis results) */}
      {response.persona_line && (
        <ResponseCard
          icon={Sparkles}
          title="Generated Persona"
          content={response.persona_line}
          className="border-primary/20 bg-primary/5"
          preserveWhitespace={true}
        />
      )}

      {/* Social Captions */}
      {hasValidCaptions && (
        <div className="mt-6">
          <CaptionResponseDisplay captions={socialCaptions} />
        </div>
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
                    ({response.timestamps.length} segments)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CopyButton
                    text={response.timestamps
                      .map(seg => `${formatTime(seg.start)}–${formatTime(seg.end)}\n"${seg.text.trim()}"`)
                      .join('\n\n')}
                  />
                  <ChevronDown
                    className={cn(
                      "w-5 h-5 text-muted-foreground transition-transform duration-200",
                      isScriptOpen && "rotate-180"
                    )}
                  />
                </div>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-5 pb-5 max-h-96 overflow-y-auto space-y-3">
                {response.timestamps.map((segment, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono px-2 py-1 rounded bg-primary/20 text-primary font-semibold">
                        {formatTime(segment.start)}–{formatTime(segment.end)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                      "{segment.text.trim()}"
                    </p>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      )}
    </div>
  );
};
