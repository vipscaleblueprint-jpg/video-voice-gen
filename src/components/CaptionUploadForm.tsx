import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, MessageSquare, ExternalLink, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

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

const SOCIAL_PLATFORMS = [
  { id: 'facebook', name: 'Facebook' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'tiktok', name: 'TikTok' },
  { id: 'x', name: 'X (Twitter)' },
  { id: 'youtube', name: 'YouTube' },
  { id: 'linkedin', name: 'LinkedIn' },
  { id: 'snapchat', name: 'Snapchat' },
  { id: 'pinterest', name: 'Pinterest' },
  { id: 'reddit', name: 'Reddit' },
  { id: 'threads', name: 'Threads' },
];

interface CTAOption {
  cta: string;
}

interface CaptionUploadFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
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
    
    if (!selectedCta.trim()) {
      setError('Please select or enter a CTA.');
      return;
    }

    if (selectedPlatforms.length === 0) {
      setError('Please select at least one platform.');
      return;
    }

    setError(null);

    const formData = new FormData();
    formData.append('caption', caption.trim());
    formData.append('cta', selectedCta.trim());
    formData.append('language', language);
    formData.append('platforms', JSON.stringify(selectedPlatforms));
    
    // Add platform-specific prompts
    const prompts: Record<string, string> = {};
    selectedPlatforms.forEach(platform => {
      if (platformPrompts[platform]?.trim()) {
        prompts[platform] = platformPrompts[platform].trim();
      }
    });
    if (Object.keys(prompts).length > 0) {
      formData.append('prompts', JSON.stringify(prompts));
    }

    await onSubmit(formData);
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
          CTA (Call to Action) <span className="text-destructive">*</span>
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
        {selectedCta && (
          <Textarea
            value={selectedCta}
            onChange={(e) => setSelectedCta(e.target.value)}
            placeholder="Edit your CTA..."
            rows={2}
            className="bg-secondary border-border focus:border-primary focus:ring-primary/20 resize-y mt-2"
          />
        )}
        
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

      {/* Platform Selection with Individual Prompts */}
      <div className="space-y-3">
        <Label className="text-muted-foreground">
          Platforms <span className="text-destructive">*</span>
        </Label>
        <p className="text-xs text-muted-foreground/70">
          Select platforms and add optional prompts for each
        </p>
        
        <div className="space-y-3">
          {SOCIAL_PLATFORMS.map((platform) => {
            const isSelected = selectedPlatforms.includes(platform.id);
            return (
              <div key={platform.id} className="space-y-2">
                <div 
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-primary/10 border-primary/30' 
                      : 'bg-secondary/50 border-border hover:border-primary/20'
                  }`}
                  onClick={() => handlePlatformToggle(platform.id)}
                >
                  <Checkbox
                    id={platform.id}
                    checked={isSelected}
                    onCheckedChange={() => handlePlatformToggle(platform.id)}
                    className="pointer-events-none"
                  />
                  <Label 
                    htmlFor={platform.id} 
                    className="flex-1 cursor-pointer font-medium text-foreground"
                  >
                    {platform.name}
                  </Label>
                  {isSelected && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </div>
                
                {/* Prompt textarea for selected platform */}
                {isSelected && (
                  <div className="ml-6 animate-in fade-in-0 slide-in-from-top-2 duration-200">
                    <Textarea
                      value={platformPrompts[platform.id] || ''}
                      onChange={(e) => handlePromptChange(platform.id, e.target.value)}
                      placeholder={`Optional prompt for ${platform.name}...`}
                      rows={2}
                      className="bg-secondary border-border focus:border-primary focus:ring-primary/20 resize-y text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
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
        disabled={isLoading || !caption.trim() || !selectedCta.trim() || selectedPlatforms.length === 0}
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
