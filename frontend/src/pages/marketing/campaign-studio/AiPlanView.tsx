import React, { useEffect, useState } from 'react';
import { Sparkles, Check, Edit2, RefreshCw, ArrowRight, ArrowLeft, AlignLeft, Hash, Clock, ListChecks } from 'lucide-react';

export const AiPlanView = ({ config, aiPlan, setAiPlan, onBack, onNext }: any) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editablePlan, setEditablePlan] = useState<any>(null);

  useEffect(() => {
    if (!aiPlan) {
      generateMockPlan();
    } else {
      setEditablePlan(aiPlan);
    }
  }, [aiPlan]);

  const generateMockPlan = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const mockPlan = {
        strategy: `Leverage the ${config.objective || 'Brand Awareness'} objective by targeting ${config.audience || 'target buyers'} on ${config.platforms?.length ? config.platforms.join(', ') : 'Instagram & Facebook'}. Focus on high-converting product highlights combined with lifestyle aesthetics.`,
        pillars: ['Educational Showcases', 'Lifestyle Integration', 'User-Generated Content', 'Promotional Urgency'],
        hashtags: ['#' + (config.name?.replace(/\s+/g, '') || 'DropshipBrand'), '#TrendingNow', '#MustHave', '#BestDeals', '#ViralFinds'],
        frequency: '1 Daily Post & 1 Story across selected channels',
        times: '10:00 AM IST, 7:00 PM IST',
        ctaStrategy: 'Soft value proposition on educational posts, direct purchase incentives on promo drops.'
      };
      setAiPlan(mockPlan);
      setEditablePlan(mockPlan);
      setIsGenerating(false);
    }, 1200);
  };

  const handleApprove = () => {
    setIsGeneratingContent(true);
    setTimeout(() => {
      setIsGeneratingContent(false);
      onNext();
    }, 1200);
  };

  if (isGenerating || !editablePlan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] bg-white rounded-2xl border border-[#C7DDCC] p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#F0F6F2] border border-[#C7DDCC] flex items-center justify-center mb-4">
          <Sparkles className="w-6 h-6 text-[#75C9B7] animate-spin" />
        </div>
        <h3 className="text-base font-extrabold text-[#16123F] mb-1">Architecting Campaign Strategy...</h3>
        <p className="text-xs text-[#555279] max-w-sm">
          Analyzing {config.audience || 'demographics'}, optimizing for {config.objective || 'growth'}, and generating high-converting content pillars.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5 font-sans">
      {/* ─── UNIFIED SINGLE-PANEL STRATEGY DOCUMENT ─── */}
      <div className="bg-white rounded-2xl p-7 border border-[#C7DDCC] shadow-xs space-y-6 text-[#16123F]">
        
        {/* Top Header Row with Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#F0F6F2]">
          <div>
            <h2 className="text-base font-extrabold text-[#16123F]">AI Strategy Plan</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={generateMockPlan}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F0F6F2] hover:bg-[#C7DDCC]/40 text-xs font-bold text-[#16123F] border border-[#C7DDCC] transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate</span>
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F0F6F2] hover:bg-[#C7DDCC]/40 text-xs font-bold text-[#16123F] border border-[#C7DDCC] transition-all cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Done Editing' : 'Edit Strategy'}</span>
            </button>
          </div>
        </div>

        {/* 1. Core Positioning */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlignLeft className="w-4 h-4 text-[#75C9B7]" />
            <h3 className="text-xs font-bold text-[#16123F] uppercase tracking-wider">Core Positioning</h3>
          </div>
          {isEditing ? (
            <textarea
              value={editablePlan.strategy}
              onChange={(e) => setEditablePlan({ ...editablePlan, strategy: e.target.value })}
              rows={3}
              className="w-full bg-[#FAFAFA] border border-[#C7DDCC] rounded-xl p-3 text-xs text-[#16123F] outline-none"
            />
          ) : (
            <p className="text-xs leading-relaxed text-[#16123F] bg-[#FAFAFA] p-4 rounded-xl border border-[#C7DDCC]/40 font-medium">
              {editablePlan.strategy}
            </p>
          )}
        </div>

        {/* 2. Content Pillars & Cadence Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Content Pillars */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-[#75C9B7]" />
              <h3 className="text-xs font-bold text-[#16123F] uppercase tracking-wider">Content Pillars</h3>
            </div>
            <div className="space-y-2">
              {editablePlan.pillars.map((pillar: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#FAFAFA] border border-[#C7DDCC]/40">
                  <span className="w-5 h-5 rounded-full bg-[#FFE26A] text-[#16123F] text-[10px] font-black flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-[#16123F]">{pillar}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cadence & Logistics */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#75C9B7]" />
              <h3 className="text-xs font-bold text-[#16123F] uppercase tracking-wider">Publishing Cadence</h3>
            </div>
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#C7DDCC]/40">
                <span className="text-[11px] text-[#555279] block mb-0.5 font-medium">Frequency</span>
                <span className="text-xs font-bold text-[#16123F]">{editablePlan.frequency}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#C7DDCC]/40">
                <span className="text-[11px] text-[#555279] block mb-0.5 font-medium">Optimal Times</span>
                <span className="text-xs font-bold text-[#16123F]">{editablePlan.times}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Hashtags & SEO */}
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-[#75C9B7]" />
            <h3 className="text-xs font-bold text-[#16123F] uppercase tracking-wider">Hashtags & SEO</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {editablePlan.hashtags.map((tag: string, idx: number) => (
              <span key={idx} className="px-3 py-1 bg-[#F0F6F2] text-[#16123F] text-xs font-bold rounded-lg border border-[#C7DDCC]">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 4. Bottom Action Row */}
        <div className="pt-5 border-t border-[#F0F6F2] flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F0F6F2] hover:bg-[#C7DDCC]/40 text-xs font-bold text-[#16123F] border border-[#C7DDCC] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Brief</span>
          </button>

          <button
            onClick={() => {
              setAiPlan(editablePlan);
              handleApprove();
            }}
            disabled={isGeneratingContent}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#16123F] hover:bg-[#25205F] text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {isGeneratingContent ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating Content Calendar...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5 text-[#FFE26A]" />
                <span>Approve & Schedule Content</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
