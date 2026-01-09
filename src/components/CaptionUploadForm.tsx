import { useState, useEffect } from 'react';
import {
  Loader2, AlertCircle, MessageSquare, ExternalLink,
  Facebook, Instagram, Youtube, Linkedin, Twitter,
  Ghost, Pin, MessageCircle, AtSign, Music2, Sparkles,
  type LucideIcon
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CTA_ENDPOINT = 'https://n8n.srv1151765.hstgr.cloud/webhook/e5260e03-6ded-4448-ab29-52f88af0d35b';

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

const SOCIAL_PLATFORMS: { id: string; name: string; icon: LucideIcon }[] = [
  { id: 'facebook', name: 'Facebook', icon: Facebook },
  { id: 'instagram', name: 'Instagram', icon: Instagram },
  { id: 'tiktok', name: 'TikTok', icon: Music2 },
  { id: 'x', name: 'X', icon: Twitter },
  { id: 'youtube', name: 'YouTube', icon: Youtube },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin },
  { id: 'snapchat', name: 'Snapchat', icon: Ghost },
  { id: 'pinterest', name: 'Pinterest', icon: Pin },
  { id: 'reddit', name: 'Reddit', icon: MessageCircle },
  { id: 'threads', name: 'Threads', icon: AtSign },
];

interface CTAOption {
  cta: string;
}

export interface CaptionFormPayload {
  caption: string;
  cta: string;
  language: string;
  platforms: string[];
  centralizedPrompt?: string;
  prompts?: Record<string, string>;
}

interface CaptionUploadFormProps {
  onSubmit: (payload: CaptionFormPayload) => Promise<void>;
  isLoading: boolean;
}

export const CaptionUploadForm = ({ onSubmit, isLoading }: CaptionUploadFormProps) => {
  const [caption, setCaption] = useState('');
  const [language, setLanguage] = useState('English');
  const [selectedCta, setSelectedCta] = useState('');
  const [ctaOptions, setCtaOptions] = useState<CTAOption[]>([]);
  const [isLoadingCtas, setIsLoadingCtas] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Multi-platform selection with individual prompts
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [platformPrompts, setPlatformPrompts] = useState<Record<string, string>>({});

  // Centralized prompt
  const [centralizedPrompt, setCentralizedPrompt] = useState('');
  const [useCentralizedPrompt, setUseCentralizedPrompt] = useState(false);

  // Fetch CTA options
  useEffect(() => {
    const fetchCtas = async () => {
      try {
        const res = await fetch(CTA_ENDPOINT);
        if (res.ok) {
          const data = await res.json();
          setCtaOptions(data);
        }
      } catch (err) {
        console.error('Failed to fetch CTAs:', err);
      } finally {
        setIsLoadingCtas(false);
      }
    };
    fetchCtas();
  }, []);

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => {
      if (prev.includes(platformId)) {
        return prev.filter(p => p !== platformId);
      }
      return [...prev, platformId];
    });
  };

  const handlePromptChange = (platformId: string, value: string) => {
    setPlatformPrompts(prev => ({
      ...prev,
      [platformId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!caption.trim()) {
      setError('Please enter a caption.');
      return;
    }

    if (selectedPlatforms.length === 0) {
      setError('Please select at least one platform.');
      return;
    }

    setError(null);

    // Map IDs to Names for the payload
    const platformNames = selectedPlatforms.map(id => {
      const platform = SOCIAL_PLATFORMS.find(p => p.id === id);
      return platform ? platform.name : id;
    });

    const payload: CaptionFormPayload = {
      caption: caption.trim(),
      cta: selectedCta.trim(),
      language,
      platforms: platformNames,
    };

    // Add centralized prompt if enabled
    if (useCentralizedPrompt && centralizedPrompt.trim()) {
      payload.centralizedPrompt = centralizedPrompt.trim();
    }

    // Add platform-specific prompts (using Names as keys)
    const prompts: Record<string, string> = {};
    selectedPlatforms.forEach(platformId => {
      const platform = SOCIAL_PLATFORMS.find(p => p.id === platformId);
      const platformName = platform ? platform.name : platformId;

      if (platformPrompts[platformId]?.trim()) {
        prompts[platformName] = platformPrompts[platformId].trim();
      }
    });

    if (Object.keys(prompts).length > 0) {
      payload.prompts = prompts;
    }

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Caption Input (Required) */}
      <div className="space-y-2">
        <Label htmlFor="caption" className="text-muted-foreground">
          Caption <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Enter your caption text here..."
          rows={4}
          className="bg-secondary border-border focus:border-primary focus:ring-primary/20 resize-y"
          required
        />
      </div>

      {/* CTA Dropdown (Required) */}
      <div className="space-y-2">
        <Label htmlFor="cta" className="text-muted-foreground">
          CTA (Call to Action)
        </Label>
        <Select
          value={ctaOptions.some(opt => opt.cta === selectedCta) ? selectedCta : ''}
          onValueChange={setSelectedCta}
          disabled={isLoadingCtas}
        >
          <SelectTrigger className="bg-secondary border-border focus:border-primary focus:ring-primary/20">
            <SelectValue placeholder={isLoadingCtas ? "Loading CTAs..." : "Select a CTA"} />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border z-50">
            {ctaOptions.map((option) => (
              <SelectItem key={option.cta} value={option.cta}>
                {option.cta}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Editable CTA */}
        {/* Editable CTA */}
        <Textarea
          value={selectedCta}
          onChange={(e) => setSelectedCta(e.target.value)}
          placeholder="Select a CTA from above or type your own..."
          rows={2}
          className="bg-secondary border-border focus:border-primary focus:ring-primary/20 resize-y mt-2"
        />

        <a
          href="https://docs.google.com/spreadsheets/d/1oQUbYqCJ-7A7S33459JycD2h60bb7Z8El1p4cTD5B_s/edit?gid=1974246146#gid=1974246146"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors mt-1"
        >
          <ExternalLink className="w-3 h-3" />
          Add a new CTA
        </a>
      </div>

      {/* Language Dropdown */}
      <div className="space-y-2">
        <Label htmlFor="language" className="text-muted-foreground">Language</Label>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="bg-secondary border-border focus:border-primary focus:ring-primary/20">
            <SelectValue placeholder="Select a language" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border z-50">
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang} value={lang}>
                {lang}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Centralized Prompt */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <Label className="text-muted-foreground">Centralized Prompt</Label>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Apply to all</span>
            <Switch
              checked={useCentralizedPrompt}
              onCheckedChange={setUseCentralizedPrompt}
            />
          </div>
        </div>
        {useCentralizedPrompt && (
          <div className="animate-in fade-in-0 slide-in-from-top-2 duration-200">
            <Textarea
              value={centralizedPrompt}
              onChange={(e) => setCentralizedPrompt(e.target.value)}
              placeholder="Enter a prompt that will apply to all selected platforms..."
              rows={3}
              className="bg-secondary border-border focus:border-primary focus:ring-primary/20 resize-y"
            />
            <p className="text-xs text-muted-foreground/70 mt-1">
              Individual platform prompts will override this for specific platforms
            </p>
          </div>
        )}
      </div>

      {/* Platform Selection with Individual Prompts */}
      <div className="space-y-3">
        <Label className="text-muted-foreground">
          Platforms <span className="text-destructive">*</span>
        </Label>
        <p className="text-xs text-muted-foreground/70">
          Select platforms and optionally add individual prompts
        </p>

        {/* Platform Pills */}
        <div className="flex flex-wrap gap-2">
          {SOCIAL_PLATFORMS.map((platform) => {
            const isSelected = selectedPlatforms.includes(platform.id);
            const Icon = platform.icon;
            return (
              <button
                key={platform.id}
                type="button"
                onClick={() => handlePlatformToggle(platform.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${isSelected
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-foreground border border-border'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {platform.name}
              </button>
            );
          })}
        </div>

        {/* Prompts for selected platforms */}
        {selectedPlatforms.length > 0 && (
          <div className="space-y-3 mt-4">
            {selectedPlatforms.map((platformId) => {
              const platform = SOCIAL_PLATFORMS.find(p => p.id === platformId);
              if (!platform) return null;
              const Icon = platform.icon;
              return (
                <div key={platformId} className="animate-in fade-in-0 slide-in-from-top-2 duration-200">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{platform.name}</span>
                  </div>
                  <Textarea
                    value={platformPrompts[platformId] || ''}
                    onChange={(e) => handlePromptChange(platformId, e.target.value)}
                    placeholder={`Optional prompt for ${platform.name}...`}
                    rows={2}
                    className="bg-secondary border-border focus:border-primary focus:ring-primary/20 resize-y text-sm"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 glow-primary transition-all"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Generating Captions...
          </>
        ) : (
          <>
            <MessageSquare className="w-5 h-5 mr-2" />
            Generate Captions
          </>
        )}
      </Button>
    </form>
  );
};
