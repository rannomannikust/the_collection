/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Box, 
  Sparkles, 
  Layout, 
  Newspaper, 
  Instagram, 
  ArrowRight, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Download
} from "lucide-react";
import { generateProductIdentity, generateBrandImage } from "./lib/gemini";
import { cn } from "./lib/utils";

type Medium = {
  id: string;
  name: string;
  icon: any;
  description: string;
  aspectRatio: string;
};

const MEDIUMS: Medium[] = [
  { 
    id: "billboard", 
    name: "Billboard", 
    icon: Layout, 
    description: "Wide cinematic outdoor advertising",
    aspectRatio: "aspect-video"
  },
  { 
    id: "newspaper", 
    name: "Newspaper", 
    icon: Newspaper, 
    description: "Classic print media advertisement",
    aspectRatio: "aspect-[3/4]"
  },
  { 
    id: "social post", 
    name: "Social Post", 
    icon: Instagram, 
    description: "Square format for digital platforms",
    aspectRatio: "aspect-square"
  },
];

export default function App() {
  const [productDescription, setProductDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [identity, setIdentity] = useState<string | null>(null);
  const [images, setImages] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"input" | "generating" | "results">("input");

  const handleGenerate = async () => {
    if (!productDescription.trim()) return;

    setIsGenerating(true);
    setError(null);
    setStep("generating");
    setImages({});
    
    try {
      // 1. Generate visual identity
      const visualIdentity = await generateProductIdentity(productDescription);
      setIdentity(visualIdentity);

      // 2. Generate images for each medium
      const newImages: Record<string, string> = {};
      
      // We'll generate them sequentially to avoid hitting rate limits too hard
      // but we could also use Promise.all if the API allows it.
      for (const medium of MEDIUMS) {
        const imageUrl = await generateBrandImage(visualIdentity, medium.id);
        if (imageUrl) {
          newImages[medium.id] = imageUrl;
          // Update state incrementally for better UX
          setImages(prev => ({ ...prev, [medium.id]: imageUrl }));
        }
      }

      setStep("results");
    } catch (err) {
      console.error(err);
      setError("Failed to generate brand kit. Please try again.");
      setStep("input");
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setStep("input");
    setImages({});
    setIdentity(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-orange-500/30 overflow-x-hidden">
      {/* Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      
      {/* Background Atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 lg:py-24">
        <AnimatePresence mode="wait">
          {step === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto text-center space-y-12"
            >
              <div className="space-y-4">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium tracking-widest uppercase text-orange-400"
                >
                  <Sparkles className="w-3 h-3" />
                  AI Brand Builder
                </motion.div>
                <h1 className="text-6xl lg:text-8xl font-bold tracking-tighter leading-[0.9] font-serif">
                  IMAGINE YOUR <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 italic">PRODUCT.</span>
                </h1>
                <p className="text-lg text-white/40 max-w-xl mx-auto font-light">
                  Describe your product and see it come to life across premium advertising mediums with visual consistency.
                </p>
              </div>

              <div className="relative group">
                <textarea
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder="e.g. A sleek, minimalist glass water bottle with a bamboo cap and a subtle etched logo of a mountain..."
                  className="w-full h-48 bg-white/5 border border-white/10 rounded-3xl p-8 text-xl font-light placeholder:text-white/10 focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 transition-all resize-none"
                />
                <button
                  onClick={handleGenerate}
                  disabled={!productDescription.trim() || isGenerating}
                  className="absolute bottom-6 right-6 px-6 py-3 bg-orange-500 hover:bg-orange-400 disabled:bg-white/10 disabled:text-white/20 text-black font-semibold rounded-2xl flex items-center gap-2 transition-all active:scale-95"
                >
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Generate Kit"}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center gap-2 text-red-400 text-sm"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}

              <div className="grid grid-cols-3 gap-4 pt-12">
                {MEDIUMS.map((m) => (
                  <div key={m.id} className="p-6 rounded-3xl bg-white/5 border border-white/10 text-left space-y-3">
                    <m.icon className="w-6 h-6 text-orange-500" />
                    <div>
                      <h3 className="font-semibold text-sm uppercase tracking-wider">{m.name}</h3>
                      <p className="text-xs text-white/30">{m.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === "generating" && (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto text-center space-y-12 py-24"
            >
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full animate-pulse" />
                <Loader2 className="w-24 h-24 text-orange-500 animate-spin relative z-10" />
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-bold tracking-tight">Building your brand...</h2>
                <div className="space-y-2">
                  <p className="text-white/40 animate-pulse">
                    {!identity ? "Defining visual identity..." : "Generating medium assets..."}
                  </p>
                  <div className="flex justify-center gap-2">
                    {MEDIUMS.map((m) => (
                      <div 
                        key={m.id}
                        className={cn(
                          "w-2 h-2 rounded-full transition-colors duration-500",
                          images[m.id] ? "bg-orange-500" : "bg-white/10"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-16"
            >
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/10 pb-12">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-orange-500 uppercase tracking-[0.2em] text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    Brand Kit Ready
                  </div>
                  <h2 className="text-5xl lg:text-7xl font-bold tracking-tighter font-serif">
                    THE <span className="text-white/40 italic">COLLECTION.</span>
                  </h2>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={reset}
                    className="px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-2 transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    New Brand
                  </button>
                </div>
              </div>

              {identity && (
                <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/30">Visual Identity Definition</h3>
                  <p className="text-xl font-light leading-relaxed text-white/80 italic">
                    "{identity}"
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {MEDIUMS.map((m, idx) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={cn(
                      "group relative rounded-[2rem] overflow-hidden bg-white/5 border border-white/10",
                      m.id === "billboard" ? "lg:col-span-2" : ""
                    )}
                  >
                    <div className={cn("relative w-full overflow-hidden", m.aspectRatio)}>
                      {images[m.id] ? (
                        <img 
                          src={images[m.id]} 
                          alt={m.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                          <Loader2 className="w-8 h-8 text-white/10 animate-spin" />
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <div className="space-y-1">
                          <h4 className="text-2xl font-bold tracking-tight">{m.name}</h4>
                          <p className="text-sm text-white/60">{m.description}</p>
                        </div>
                        <a 
                          href={images[m.id]} 
                          download={`brand-${m.id}.png`}
                          className="p-4 rounded-2xl bg-white text-black hover:bg-orange-500 transition-colors"
                        >
                          <Download className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5 text-center">
        <p className="text-xs text-white/20 uppercase tracking-widest flex items-center justify-center gap-2">
          <Box className="w-3 h-3" />
          Powered by Nano-Banana & Gemini AI
        </p>
      </footer>
    </div>
  );
}
