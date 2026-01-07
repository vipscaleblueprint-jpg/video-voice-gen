import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import type { SocialCaptions } from '@/pages/CaptionTranscriber';

// Platform icons/labels mapping
const PLATFORM_CONFIG: Record<keyof SocialCaptions, { label: string; color: string }> = {
  facebook: { label: 'Facebook', color: 'bg-blue-600' },
  instagram: { label: 'Instagram', color: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500' },
  tiktok: { label: 'TikTok', color: 'bg-black' },
  x: { label: 'X (Twitter)', color: 'bg-black' },
  youtube: { label: 'YouTube', color: 'bg-red-600' },
  linkedin: { label: 'LinkedIn', color: 'bg-blue-700' },
  snapchat: { label: 'Snapchat', color: 'bg-yellow-400' },
  pinterest: { label: 'Pinterest', color: 'bg-red-500' },
  reddit: { label: 'Reddit', color: 'bg-orange-600' },
  whatsapp: { label: 'WhatsApp', color: 'bg-green-500' },
  messenger: { label: 'Messenger', color: 'bg-blue-500' },
  telegram: { label: 'Telegram', color: 'bg-sky-500' },
  discord: { label: 'Discord', color: 'bg-indigo-600' },
  wechat: { label: 'WeChat', color: 'bg-green-600' },
  tumblr: { label: 'Tumblr', color: 'bg-blue-900' },
  threads: { label: 'Threads', color: 'bg-black' },
  quora: { label: 'Quora', color: 'bg-red-700' },
  clubhouse: { label: 'Clubhouse', color: 'bg-amber-100' },
};

interface CaptionResponseDisplayProps {
  captions: SocialCaptions;
}

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: 'Copied!', description: 'Caption copied to clipboard.' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      className="h-8 w-8 text-muted-foreground hover:text-primary"
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
    </Button>
  );
};

export const CaptionResponseDisplay = ({ captions }: CaptionResponseDisplayProps) => {
  // Filter out empty/null/undefined captions
  const validCaptions = Object.entries(captions).filter(
    ([_, value]) => value && value.trim() !== ''
  ) as [keyof SocialCaptions, string][];

  if (validCaptions.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 md:p-8 shadow-card text-center">
        <p className="text-muted-foreground">No captions were generated.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 md:p-8 shadow-card space-y-4">
      <h2 className="text-xl font-semibold text-foreground mb-4">
        Generated Captions ({validCaptions.length})
      </h2>
      
      <div className="space-y-4">
        {validCaptions.map(([platform, caption]) => {
          const config = PLATFORM_CONFIG[platform];
          return (
            <div
              key={platform}
              className="bg-secondary/50 rounded-xl p-4 border border-border"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`inline-block w-3 h-3 rounded-full ${config.color}`} />
                  <span className="font-medium text-foreground">{config.label}</span>
                </div>
                <CopyButton text={caption} />
              </div>
              <p className="text-muted-foreground text-sm whitespace-pre-wrap">{caption}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
