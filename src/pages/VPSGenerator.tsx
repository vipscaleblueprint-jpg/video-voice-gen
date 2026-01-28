import { useState } from 'react';
import { Target, Loader2, Copy, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from "sonner";
const VPS_API_URL = 'https://n8n.srv1151765.hstgr.cloud/webhook/generate-vps';
const VPSGenerator = () => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) {
      setError('Please enter a URL or text content.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch(VPS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'Website/Google Docs URL/PlainText': inputText
        })
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();

      // Parse response. It's likely an array of items or a single object.
      // We'll try to find a meaningful text field.
      let generatedText = '';
      if (Array.isArray(data) && data.length > 0) {
        // Check for 'output', 'text', or just the agent response structure
        const item = data[0];
        if (item.output) generatedText = item.output;else if (item.text) generatedText = item.text;else if (item.result) generatedText = item.result;else {
          // Fallback: try to stringify the first item if no obvious text field
          generatedText = typeof item === 'string' ? item : JSON.stringify(item, null, 2);
        }
      } else if (data && typeof data === 'object') {
        if (data.output) generatedText = data.output;else if (data.text) generatedText = data.text;else generatedText = JSON.stringify(data, null, 2);
      } else {
        generatedText = String(data);
      }

      // Clean up quotes if it serves purely as text
      if (generatedText.startsWith('"') && generatedText.endsWith('"')) {
        generatedText = generatedText.slice(1, -1);
      }
      setResult(generatedText);
      toast.success("VPS Generated successfully!");
    } catch (err) {
      console.error('VPS Generation Error:', err);
      setError('Failed to generate Value Proposition Statement. Please try again.');
      toast.error("Failed to generate VPS");
    } finally {
      setIsLoading(false);
    }
  };
  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };
  return <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col gap-2 py-[50px]">
                <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
                    <Target className="w-8 h-8 text-primary" />
                    VPS Generator
                </h1>
                <p className="text-muted-foreground">
                    Generate compelling Value Proposition Statements from your website URL, Google Doc, or raw text.
                </p>
            </div>

            <div className="grid gap-8">
                {/* Input Card */}
                <Card className="glass border-white/5 shadow-card overflow-hidden">
                    <CardHeader className="bg-white/5 border-b border-white/5">
                        <CardTitle className="text-xl font-semibold">Input Source</CardTitle>
                        <CardDescription>
                            Paste a website URL, Google Docs link, or describe your business directly.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="input-source">Website / Doc URL / Text</Label>
                                <Textarea id="input-source" placeholder="e.g. https://mybusiness.com, or 'I help doctors with financial planning...'" value={inputText} onChange={e => setInputText(e.target.value)} className="bg-secondary/50 border-white/10 min-h-[150px] focus:ring-primary/20 transition-all font-medium" />
                            </div>

                            {error && <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    <p>{error}</p>
                                </div>}

                            <Button type="submit" disabled={isLoading || !inputText.trim()} className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 glow-primary transition-all rounded-xl">
                                {isLoading ? <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Analyzing & Generating...
                                    </> : <>
                                        <Target className="w-5 h-5 mr-2" />
                                        Generate VPS
                                    </>}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Output Section */}
                {result && <Card className="glass border-white/5 shadow-card animate-slide-up">
                        <CardHeader className="bg-white/5 border-b border-white/5 flex flex-row items-center justify-between">
                            <CardTitle className="text-xl font-semibold flex items-center gap-2">
                                <Target className="w-5 h-5 text-primary" />
                                Generated Result
                            </CardTitle>
                            <Button variant="ghost" size="sm" onClick={handleCopy} className="text-muted-foreground hover:text-primary transition-colors">
                                {copied ? <Check className="w-4 h-4 mr-1 text-success" /> : <Copy className="w-4 h-4 mr-1" />}
                                {copied ? "Copied" : "Copy"}
                            </Button>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="p-4 rounded-xl bg-black/20 border border-white/5 font-mono text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                                {result}
                            </div>
                        </CardContent>
                    </Card>}
            </div>
        </div>;
};
export default VPSGenerator;