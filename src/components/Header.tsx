
import { Sparkles } from "lucide-react";

export const Header = () => {
    return (
        <header className="lg:pl-64 fixed top-0 left-0 right-0 z-40 transition-all duration-300 pointer-events-none">
            <div className="h-16 px-6 flex items-center justify-end bg-transparent">
                {/* Decorative elements - purely aesthetic as requested */}
                <div className="flex items-center gap-2 opacity-30">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
                        AI Powered
                    </span>
                </div>

                {/* Optional glass gradient line at the bottom */}
                <div className="absolute bottom-0 left-0 lg:left-64 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

                {/* Top ambient glow */}
                <div className="absolute top-0 right-0 w-96 h-full bg-primary/5 blur-3xl -z-10" />
            </div>
        </header>
    );
};
