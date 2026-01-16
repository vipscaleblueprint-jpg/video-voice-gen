import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';

export interface AdsCopyFormPayload {
    vps: string;
    goal: string;
    target_market: string;
}

interface AdsCopyFormProps {
    onSubmit: (payload: AdsCopyFormPayload) => Promise<void>;
    isLoading: boolean;
}

export const AdsCopyForm = ({ onSubmit, isLoading }: AdsCopyFormProps) => {
    const [vps, setVps] = useState('');
    const [goal, setGoal] = useState('');
    const [targetMarket, setTargetMarket] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit({
            vps,
            goal,
            target_market: targetMarket,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="vps" className="text-muted-foreground uppercase text-xs font-bold tracking-wider">
                    Value Proposition Statement (VPS)
                </Label>
                <Textarea
                    id="vps"
                    value={vps}
                    onChange={(e) => setVps(e.target.value)}
                    placeholder="Enter your value proposition..."
                    className="bg-secondary border-border focus:border-primary focus:ring-primary/20 min-h-[120px] resize-y"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="goal" className="text-muted-foreground uppercase text-xs font-bold tracking-wider">
                    Goal
                </Label>
                <Textarea
                    id="goal"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g. Increase signups, Drive sales..."
                    className="bg-secondary border-border focus:border-primary focus:ring-primary/20 min-h-[100px] resize-y"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="target_market" className="text-muted-foreground uppercase text-xs font-bold tracking-wider">
                    Target Market
                </Label>
                <Textarea
                    id="target_market"
                    value={targetMarket}
                    onChange={(e) => setTargetMarket(e.target.value)}
                    placeholder="Describe your ideal audience..."
                    className="bg-secondary border-border focus:border-primary focus:ring-primary/20 min-h-[100px] resize-y"
                    required
                />
            </div>

            <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 glow-primary transition-all"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating Ads Copy...
                    </>
                ) : (
                    <>
                        <Send className="w-5 h-5 mr-2" />
                        Generate Ads Copy
                    </>
                )}
            </Button>
        </form>
    );
};
