import { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, Film, X, Loader2, AlertCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface PromptOption {
  prompt: string;
  'content type': string;
}

const PROMPTS_API = 'https://n8n.srv1151765.hstgr.cloud/webhook/32117416-351b-4703-8ffb-931dec69efa4';

interface VideoUploadFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  isLoading: boolean;
}

const MAX_FILE_SIZE_MB = 100;
const ACCEPTED_FORMATS = ['video/mp4', 'video/quicktime'];

export const VideoUploadForm = ({ onSubmit, isLoading }: VideoUploadFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [vps, setVps] = useState('');
  const [language, setLanguage] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promptOptions, setPromptOptions] = useState<PromptOption[]>([]);
  const [promptsLoading, setPromptsLoading] = useState(true);
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

    const formData = new FormData();
    formData.append('reel', file);
    formData.append('vps', vps);
    formData.append('language', language);
    if (prompt) {
      formData.append('prompt', prompt);
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
              <div>
                <p className="font-medium text-foreground">{file.name}</p>
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

      {/* Form Fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="vps" className="text-muted-foreground">VPS</Label>
          <Input
            id="vps"
            value={vps}
            onChange={(e) => setVps(e.target.value)}
            placeholder="Enter VPS value"
            className="bg-secondary border-border focus:border-primary focus:ring-primary/20"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="language" className="text-muted-foreground">Language</Label>
          <Input
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="e.g., English, Spanish"
            className="bg-secondary border-border focus:border-primary focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Prompt Dropdown */}
      <div className="space-y-2">
        <Label htmlFor="prompt" className="text-muted-foreground">
          Prompt <span className="text-xs opacity-60">(optional)</span>
        </Label>
        <Select value={prompt} onValueChange={setPrompt}>
          <SelectTrigger className="bg-secondary border-border focus:border-primary focus:ring-primary/20">
            <SelectValue placeholder={promptsLoading ? "Loading prompts..." : "Select a prompt"} />
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
    </form>
  );
};
