import React, { useState } from 'react';
import { Sparkles, Check, X, Clock, ArrowLeft, ArrowRight, History, Heart, Share2, MessageCircle, MoreHorizontal } from 'lucide-react';

export const ContentReviewModal = ({ post, onClose, onApprove }: any) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [history, setHistory] = useState([
    { version: 1, image: post.content.image, caption: post.content.caption }
  ]);
  const [currentVersion, setCurrentVersion] = useState(0);

  const current = history[currentVersion];

  const handleMagicEdit = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    const basePrompt = 'social media marketing post, premium product photography, ';
    const enhancedPrompt = basePrompt + prompt;
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=800&height=800&nologo=true&seed=${Math.floor(Math.random() * 10000)}`;

    setTimeout(() => {
      const newVersion = {
        version: history.length + 1,
        image: imageUrl,
        caption: current.caption,
      };
      setHistory([...history, newVersion]);
      setCurrentVersion(history.length);
      setPrompt('');
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="absolute inset-0 bg-[#16123F]/70 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-5xl bg-white rounded-2xl border border-[#C7DDCC] shadow-2xl overflow-hidden flex flex-col md:flex-row h-full max-h-[85vh] z-10 text-[#16123F]">
        {/* Left: Preview (Phone Mockup) */}
        <div className="w-full md:w-[45%] bg-[#FAFAFA] p-6 flex flex-col items-center justify-center border-r border-[#C7DDCC]">
          {/* Mock Phone Frame */}
          <div className="w-full max-w-[320px] bg-white rounded-[2rem] border-4 border-[#16123F] overflow-hidden relative shadow-lg">
            {/* Header */}
            <div className="bg-[#FAFAFA] px-4 py-2.5 flex items-center justify-between border-b border-[#F0F6F2]">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-[#16123F] flex items-center justify-center text-[#FFE26A] text-[10px] font-black">
                  DS
                </div>
                <span className="text-[#16123F] text-xs font-bold">DropShipHub</span>
              </div>
              <MoreHorizontal className="w-4 h-4 text-[#555279]" />
            </div>

            {/* Media */}
            <div className="relative aspect-square w-full bg-[#F0F6F2]">
              {isGenerating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80">
                  <div className="w-8 h-8 border-3 border-[#75C9B7] border-t-transparent rounded-full animate-spin mb-2" />
                  <p className="text-[#16123F] text-xs font-bold animate-pulse">Generating New Creative...</p>
                </div>
              ) : (
                <img src={current.image} alt="Preview" className="w-full h-full object-cover" />
              )}
            </div>

            {/* Engagement */}
            <div className="p-3.5 space-y-2">
              <div className="flex items-center space-x-3 text-[#16123F]">
                <Heart className="w-4 h-4" />
                <MessageCircle className="w-4 h-4" />
                <Share2 className="w-4 h-4" />
              </div>
              <p className="text-[#16123F] text-xs leading-snug">
                <span className="font-bold mr-1.5">{post.productName || 'DropShipHub'}</span>
                {current.caption}
              </p>
            </div>
          </div>

          {/* Version History Navigation */}
          {history.length > 1 && (
            <div className="mt-4 flex items-center space-x-3 bg-white rounded-full px-3 py-1 border border-[#C7DDCC]">
              <button
                onClick={() => setCurrentVersion(Math.max(0, currentVersion - 1))}
                disabled={currentVersion === 0}
                className="p-1 text-[#16123F] disabled:opacity-30 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center space-x-1 text-xs font-bold text-[#16123F]">
                <History className="w-3.5 h-3.5 text-[#75C9B7]" />
                <span>Version {currentVersion + 1} of {history.length}</span>
              </div>
              <button
                onClick={() => setCurrentVersion(Math.min(history.length - 1, currentVersion + 1))}
                disabled={currentVersion === history.length - 1}
                className="p-1 text-[#16123F] disabled:opacity-30 cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right: AI Editing Controls */}
        <div className="w-full md:w-[55%] flex flex-col p-6 lg:p-8 h-full overflow-y-auto custom-scrollbar justify-between">
          <div className="space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-[#75C9B7] text-[#16123F] text-[10px] font-black uppercase">
                    {post.platform} • {post.type}
                  </span>
                  <span className="text-[#555279] text-xs flex items-center font-medium">
                    <Clock className="w-3 h-3 mr-1" /> {post.date} at {post.time}
                  </span>
                </div>
                <h2 className="text-base font-extrabold text-[#16123F]">{post.productName || post.topic}</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#FAFAFA] hover:bg-[#F0F6F2] text-[#16123F] border border-[#C7DDCC] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Prompt Editor */}
            <div className="bg-[#FAFAFA] border border-[#C7DDCC] rounded-xl p-4 relative space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#16123F] uppercase tracking-wider">AI Creative Refinement</h3>
                <Sparkles className="w-4 h-4 text-[#75C9B7]" />
              </div>
              <p className="text-[11px] text-[#555279]">
                Provide simple instructions to adjust the visual creative for this product.
              </p>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Add lifestyle background, brighten studio lighting, highlight features..."
                rows={2}
                className="w-full bg-white border border-[#C7DDCC] rounded-xl p-2.5 text-xs text-[#16123F] outline-none resize-none"
              />

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleMagicEdit}
                  disabled={isGenerating || !prompt.trim()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#F0F6F2] hover:bg-[#C7DDCC]/40 text-xs font-bold text-[#16123F] border border-[#C7DDCC] transition-all cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#75C9B7]" />
                  <span>{isGenerating ? 'Refining...' : 'Regenerate Creative'}</span>
                </button>
              </div>
            </div>

            {/* Storyboard / Script Outline */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#16123F] uppercase tracking-wider">Post Execution Outline</h4>
              <div className="space-y-1.5">
                {(post.content.storyboard || []).map((step: string, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[#FAFAFA] border border-[#C7DDCC]/40 text-xs text-[#16123F] flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#FFE26A] text-[#16123F] text-[10px] font-black flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-[#F0F6F2] flex items-center justify-end gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#FAFAFA] hover:bg-[#F0F6F2] text-xs font-bold text-[#16123F] border border-[#C7DDCC] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onApprove}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#16123F] hover:bg-[#25205F] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-[#FFE26A]" />
              <span>Approve & Keep in Schedule</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
