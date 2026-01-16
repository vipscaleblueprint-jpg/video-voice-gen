import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ScriptGenerator from "./pages/ScriptGenerator";
import CaptionGenerator from "./pages/CaptionGenerator";
import CaptionParaphraser from "./pages/CaptionParaphraser";
import AudioTags from "./pages/AudioTags";
import ThumbnailHookGenerator from "./pages/ThumbnailHookGenerator";
import AdsCopyGenerator from "./pages/AdsCopyGenerator";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/caption-generator" element={<CaptionGenerator />} />
          <Route path="/script-generator" element={<ScriptGenerator />} />
          <Route path="/caption-paraphraser" element={<CaptionParaphraser />} />
          <Route path="/audio-tags" element={<AudioTags />} />
          <Route path="/thumbnail-hooks" element={<ThumbnailHookGenerator />} />
          <Route path="/ads-copy" element={<AdsCopyGenerator />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
