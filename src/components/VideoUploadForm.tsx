import { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, Film, X, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

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

interface PromptOption {
  prompt: string;
  'content type': string;
}

interface CtaOption {
  cta: string;
}

const PROMPTS_API = 'https://n8n.srv1151765.hstgr.cloud/webhook/32117416-351b-4703-8ffb-931dec69efa4';
const CTA_API = 'https://n8n.srv1151765.hstgr.cloud/webhook/e5260e03-6ded-4448-ab29-52f88af0d35b';
const GENERATE_PERSONA_API = 'https://n8n.srv1151765.hstgr.cloud/webhook/generate-persona';

interface VideoUploadFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  onPersonaGenerated: (personaText: string) => void;
  paraphrasedText?: string;
  isLoading: boolean;
}

const MAX_FILE_SIZE_MB = 100;
const ACCEPTED_FORMATS = ['video/mp4', 'video/quicktime'];

export const VideoUploadForm = ({ onSubmit, onPersonaGenerated, paraphrasedText, isLoading }: VideoUploadFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [language, setLanguage] = useState('English');
  const [prompt, setPrompt] = useState('');
  const [contentType, setContentType] = useState('');
  const [selectedPromptTemplate, setSelectedPromptTemplate] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promptOptions, setPromptOptions] = useState<PromptOption[]>([]);
  const [promptsLoading, setPromptsLoading] = useState(true);
  const [ctaOptions, setCtaOptions] = useState<CtaOption[]>([]);
  const [ctaLoading, setCtaLoading] = useState(true);
  const [selectedCta, setSelectedCta] = useState('');
  const [caption, setCaption] = useState('');
  const [personaInput, setPersonaInput] = useState('');
  const [isGeneratingPersona, setIsGeneratingPersona] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fetch prompts from API
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const res = await fetch(PROMPTS_API);
        const data = await res.json();
        // Filter out empty objects
        const validPrompts = data.filter((item: PromptOption) => item.prompt);
        setPromptOptions(validPrompts);
      } catch (err) {
        console.error('Failed to fetch prompts:', err);
      } finally {
        setPromptsLoading(false);
      }
    };
    fetchPrompts();
  }, []);


  // Fetch CTA options from API
  useEffect(() => {
    const fetchCtaOptions = async () => {
      try {
        const res = await fetch(CTA_API);
        const data = await res.json();
        const validCta = data.filter((item: CtaOption) => item.cta);
        setCtaOptions(validCta);
      } catch (err) {
        console.error('Failed to fetch CTA options:', err);
      } finally {
        setCtaLoading(false);
      }
    };
    fetchCtaOptions();
  }, []);

  // Create video preview URL when file changes
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setVideoPreviewUrl(null);
    }
  }, [file]);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_FORMATS.includes(file.type)) {
      return 'Invalid format. Please upload MP4 or MOV files only.';
    }
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      return `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`;
    }
    return null;
  };

  const handleFile = useCallback((selectedFile: File) => {
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setFile(selectedFile);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  }, [handleFile]);

  const handleGeneratePersona = async () => {
    setIsGeneratingPersona(true);
    setError(null);
    try {
      const res = await fetch(GENERATE_PERSONA_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona_input: personaInput,
          paraphrased: paraphrasedText || ''
        })
      });

      if (!res.ok) throw new Error('Failed to generate persona');

      const data = await res.json();

      // Parse array response format: [{"output": "..."}]
      let generatedText = '';
      if (Array.isArray(data) && data.length > 0 && data[0].output) {
        generatedText = data[0].output;
      } else if (data.output) {
        generatedText = data.output;
      } else if (data.persona_line) {
        generatedText = data.persona_line;
      } else if (data.text) {
        generatedText = data.text;
      } else if (typeof data === 'string') {
        generatedText = data;
      }

      if (generatedText) {
        setPersonaInput(generatedText);
        onPersonaGenerated(generatedText);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Persona generation error:', err);
      setError('Failed to generate persona. Please try again.');
    } finally {
      setIsGeneratingPersona(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a video file.');
      return;
    }
    if (!prompt.trim()) {
      setError('Prompt is required.');
      return;
    }

    const formData = new FormData();
    formData.append('reel', file);
    formData.append('language', language);
    formData.append('prompt', prompt);
    formData.append('content_type', contentType);
    formData.append('cta', selectedCta);
    if (caption.trim()) {
      formData.append('caption', caption);
    }
    if (personaInput.trim()) {
      formData.append('persona_input', personaInput);
    }

    await onSubmit(formData);
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(2) + ' MB';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer group",
          "hover:border-primary/60 hover:bg-primary/5",
          isDragging ? "border-primary bg-primary/10 scale-[1.02]" : "border-border",
          file && "border-success/50 bg-success/5"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".mp4,.mov,video/mp4,video/quicktime"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-4 text-center">
          {file && videoPreviewUrl ? (
            <>
              <div className="w-full max-w-xs rounded-lg overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  src={videoPreviewUrl}
                  controls
                  className="w-full h-auto max-h-48 object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="max-w-full overflow-hidden">
                <p className="font-medium text-foreground break-words text-sm max-w-[250px]">{file.name}</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4 mr-1" />
                Remove
              </Button>
            </>
          ) : (
            <>
              <div className={cn(
                "w-16 h-16 rounded-full bg-muted flex items-center justify-center transition-all",
                "group-hover:bg-primary/20 group-hover:scale-110",
                isDragging && "bg-primary/20 scale-110 animate-pulse"
              )}>
                <Upload className={cn(
                  "w-8 h-8 text-muted-foreground transition-colors",
                  "group-hover:text-primary",
                  isDragging && "text-primary"
                )} />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  Drop your video here or <span className="text-primary">browse</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  MP4, MOV • Max {MAX_FILE_SIZE_MB}MB
                </p>
              </div>
            </>
          )}
        </div>

        {/* Animated border glow when dragging */}
        {isDragging && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 animate-pulse pointer-events-none" />
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}


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

      {/* Prompt Section */}
      <div className="space-y-3">
        <Label className="text-muted-foreground">
          Prompt <span className="text-destructive">*</span>
        </Label>

        {/* Prompt Template Dropdown */}
        <Select
          value={selectedPromptTemplate}
          onValueChange={(value) => {
            setSelectedPromptTemplate(value);
            setPrompt(value);
            const selectedOption = promptOptions.find(opt => opt.prompt === value);
            setContentType(selectedOption?.['content type'] || '');
          }}
        >
          <SelectTrigger className="bg-secondary border-border focus:border-primary focus:ring-primary/20">
            <SelectValue placeholder={promptsLoading ? "Loading prompts..." : "Select a prompt template"} />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border z-50">
            {promptOptions.length > 0 ? (
              promptOptions.map((option, index) => (
                <SelectItem key={index} value={option.prompt}>
                  <span className="flex items-center gap-2">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                      {option['content type']}
                    </span>
                    <span className="truncate max-w-[200px]">{option.prompt}</span>
                  </span>
                </SelectItem>
              ))
            ) : (
              <SelectItem value="_empty" disabled>
                No prompts available
              </SelectItem>
            )}
          </SelectContent>
        </Select>

        {/* Add new prompt link */}
        <a
          href="https://docs.google.com/spreadsheets/d/1oQUbYqCJ-7A7S33459JycD2h60bb7Z8El1p4cTD5B_s/edit?gid=1974246146#gid=1974246146"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
        >
          + Add a new prompt template
        </a>

        {/* Editable Prompt Textarea */}
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type your prompt or edit the selected template..."
          rows={8}
          className="bg-secondary border-border focus:border-primary focus:ring-primary/20 resize-y min-h-[200px]"
        />
      </div>

      {/* Caption (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="caption" className="text-muted-foreground">
          Caption <span className="text-xs text-muted-foreground/70">(Optional)</span>
        </Label>
        <Textarea
          id="caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Enter a caption for the video..."
          rows={3}
          className="bg-secondary border-border focus:border-primary focus:ring-primary/20 resize-y"
        />
      </div>

      {/* CTA Dropdown */}
      <div className="space-y-3">
        <Label htmlFor="cta" className="text-muted-foreground">CTA (Call to Action)</Label>
        <Select
          value={ctaOptions.find(opt => opt.cta === selectedCta)?.cta || ''}
          onValueChange={setSelectedCta}
        >
          <SelectTrigger className="bg-secondary border-border focus:border-primary focus:ring-primary/20">
            <SelectValue placeholder={ctaLoading ? "Loading CTA options..." : "Select a CTA template"} />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border z-50">
            {ctaOptions.length > 0 ? (
              ctaOptions.map((option, index) => (
                <SelectItem key={index} value={option.cta}>
                  {option.cta}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="_empty" disabled>
                No CTA options available
              </SelectItem>
            )}
          </SelectContent>
        </Select>

        {/* Editable CTA Textarea */}
        <Textarea
          id="cta"
          value={selectedCta}
          onChange={(e) => setSelectedCta(e.target.value)}
          placeholder="Select a template above or type your own CTA..."
          rows={2}
          className="bg-secondary border-border focus:border-primary focus:ring-primary/20 resize-y"
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading || !file}
        className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 glow-primary transition-all"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing Video...
          </>
        ) : (
          <>
            <Upload className="w-5 h-5 mr-2" />
            Upload & Analyze
          </>
        )}
      </Button>

      {/* Persona Input */}
      <div className="space-y-2">
        <Label htmlFor="personaInput" className="text-muted-foreground">
          Persona Input <span className="text-xs text-muted-foreground/70">(Who you help & Outcome)</span>
        </Label>
        <Textarea
          id="personaInput"
          value={personaInput}
          onChange={(e) => setPersonaInput(e.target.value)}
          placeholder="e.g. I am Jenesia Red, a fractional CMO who helps creators with AI content and funnels."
          rows={3}
          className="bg-secondary border-border focus:border-primary focus:ring-primary/20 resize-y"
        />
        <Button
          type="button"
          onClick={handleGeneratePersona}
          disabled={isGeneratingPersona || !paraphrasedText}
          className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 glow-primary transition-all"
        >
          {isGeneratingPersona ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5 mr-2" />
          )}
          Generate Persona
        </Button>
      </div>
    </form>
  );
};
