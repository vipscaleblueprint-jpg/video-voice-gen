import { NavLink as RouterNavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
    Video,
    Type,
    ScrollText,
    MessageSquareText,
    Music,
    Image,
    Megaphone,
    Menu,
    X,
    FileText
} from 'lucide-react';

const navItems = [
    { to: '/', label: 'Reel Paraphraser', icon: Video },
    { to: '/caption-paraphraser', label: 'Caption Paraphraser', icon: MessageSquareText },
    { to: '/script-generator', label: 'Script Generator', icon: ScrollText },
    { to: '/caption-generator', label: 'Caption Generator', icon: Type },
    { to: '/audio-tags', label: 'Audio Tags', icon: Music },
    { to: '/thumbnail-hooks', label: 'Thumbnail Hooks', icon: Image },
    { to: '/ads-copy', label: 'Ads Copy', icon: Megaphone },
    { to: '/content-creation', label: 'Content Creation System', icon: FileText },
];

export const Navigation = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Menu Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 glass p-3 rounded-xl shadow-card hover:bg-white/5 transition-all duration-300"
                aria-label="Toggle menu"
            >
                {isOpen ? (
                    <X className="w-5 h-5 text-foreground" />
                ) : (
                    <Menu className="w-5 h-5 text-foreground" />
                )}
            </button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Navigation */}
            <nav
                className={cn(
                    "fixed top-0 left-0 h-full w-64 glass shadow-2xl border-r border-white/5 z-40 transition-transform duration-300 flex flex-col",
                    isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Logo/Header Section */}
                <div className="p-6 border-b border-white/5">
                    <h2 className="text-xl font-bold gradient-text">Video Voice Gen</h2>
                    <p className="text-xs text-muted-foreground mt-1">AI Content Tools</p>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto py-6 px-3">
                    <div className="flex flex-col gap-1">
                        {navItems.map((item) => (
                            <RouterNavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group",
                                        isActive
                                            ? "bg-primary text-primary-foreground shadow-glow"
                                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                    )
                                }
                            >
                                <item.icon className={cn(
                                    "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                                    "text-current"
                                )} />
                                <span className="flex-1">{item.label}</span>
                            </RouterNavLink>
                        ))}
                    </div>
                </div>

                {/* Footer Section (Optional) */}
                <div className="p-4 border-t border-white/5">
                    <p className="text-xs text-muted-foreground text-center">
                        © 2026 Video Voice Gen
                    </p>
                </div>
            </nav>
        </>
    );
};
