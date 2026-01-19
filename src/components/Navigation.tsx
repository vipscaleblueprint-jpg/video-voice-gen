import { NavLink as RouterNavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
    Video,
    Type,
    ScrollText,
    MessageSquareText,
    Music,
    Image,
    Megaphone
} from 'lucide-react';

const navItems = [
    { to: '/', label: 'Reel Paraphraser', icon: Video },
    { to: '/caption-generator', label: 'Caption Generator', icon: Type },
    { to: '/script-generator', label: 'Script Generator', icon: ScrollText },
    { to: '/caption-paraphraser', label: 'Caption Paraphraser', icon: MessageSquareText },
    { to: '/audio-tags', label: 'Audio Tags', icon: Music },
    { to: '/thumbnail-hooks', label: 'Thumbnail Hooks', icon: Image },
    { to: '/ads-copy', label: 'Ads Copy', icon: Megaphone },
];

export const Navigation = () => {
    return (
        <div className="flex justify-center mb-12">
            <nav className="glass p-1.5 rounded-2xl flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full shadow-2xl border border-white/5">
                {navItems.map((item) => (
                    <RouterNavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap group",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-glow scale-[1.02] z-10"
                                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                            )
                        }
                    >
                        <item.icon className={cn(
                            "w-4 h-4 transition-transform duration-300 group-hover:scale-110",
                            "text-current"
                        )} />
                        <span>{item.label}</span>
                    </RouterNavLink>
                ))}
            </nav>
        </div>
    );
};
