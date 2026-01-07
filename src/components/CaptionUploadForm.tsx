import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, MessageSquare, ExternalLink } from 'lucide-react';
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

interface CTAOption {
  cta: string;
}

interface CaptionUploadFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  isLoading: boolean;
}

export const CaptionUploadForm = ({ onSubmit, isLoading }: CaptionUploadFormProps) => {
  const [caption, setCaption] = useState('');
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('English');
  const [selectedCta, setSelectedCta] = useState('');
  const [ctaOptions, setCtaOptions] = useState<CTAOption[]>([]);
  const [isLoadingCtas, setIsLoadingCtas] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    setError(null);

    const formData = new FormData();
    formData.append('caption', caption.trim());
    formData.append('cta', selectedCta.trim());
    formData.append('language', language);
    if (prompt.trim()) {
      formData.append('prompt', prompt.trim());
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

      {/* Prompt (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="prompt" className="text-muted-foreground">
          Prompt <span className="text-xs text-muted-foreground/70">(Optional)</span>
        </Label>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Add any custom instructions for generating captions..."
          rows={3}
          className="bg-secondary border-border focus:border-primary focus:ring-primary/20 resize-y"
        />
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
        disabled={isLoading || !caption.trim() || !selectedCta.trim()}
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
