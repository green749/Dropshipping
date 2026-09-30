import React, { useEffect, useState, useMemo } from 'react';
import { Calendar as CalendarIcon, Video, Image as ImageIcon, AlertCircle, CheckCircle2, Package } from 'lucide-react';
import { useAppSelector } from '../../../store';
import { ContentReviewModal } from './ContentReviewModal';

export const ContentCalendarView = ({ config, aiPlan, contentCalendar, setContentCalendar, onDashboard }: any) => {
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const { products } = useAppSelector((state) => state.product);

  const selectedProducts = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    if (!config?.products || config.products.length === 0) {
      return list.slice(0, 4);
    }
    const filtered = list.filter((p) => config.products.includes(p.id));
    return filtered.length > 0 ? filtered : list.slice(0, 4);
  }, [products, config?.products]);

  useEffect(() => {
    if (contentCalendar.length === 0 && selectedProducts.length > 0) {
      generateCalendarFromSelectedProducts();
    }
  }, [selectedProducts]);

  const generateCalendarFromSelectedProducts = () => {
    const platforms = config?.platforms?.length ? config.platforms : ['Instagram', 'Facebook', 'TikTok', 'Pinterest'];
    const angles = [
      { type: 'Reel', topic: 'Product Showcase & Unboxing', hookPrefix: 'Ever wonder why everyone is talking about this?' },
      { type: 'Post', topic: 'Problem → Solution Deep Dive', hookPrefix: 'Stop settling for ordinary. Here is how it works.' },
      { type: 'Post', topic: 'Key Features & Quality Highlight', hookPrefix: '3 reasons you need this in your daily rotation.' },
      { type: 'Reel', topic: 'Customer Review & Urgency Drop', hookPrefix: 'POV: You finally found the perfect essential.' }
    ];

    const generated = angles.map((angle, idx) => {
      // Map to selected product in rotation
      const product = selectedProducts[idx % selectedProducts.length];
      const platform = platforms[idx % platforms.length];
      const dayNum = idx + 1;
      const dateStr = new Date(Date.now() + dayNum * 86400000).toISOString().split('T')[0];
      const timeStr = idx % 2 === 0 ? '09:00 AM' : '06:00 PM';

      return {
        id: `post_${dayNum}`,
        day: dayNum,
        platform,
        type: angle.type,
        productId: product?.id,
        productName: product?.name || 'Selected Product',
        productPrice: product?.selling_price || product?.price || '0',
        topic: `${product?.name ? product.name.slice(0, 24) : 'Product'} - ${angle.topic}`,
        hook: `${angle.hookPrefix} Introducing the ${product?.name || 'Exclusive Drop'}.`,
        objective: config?.objective || 'Brand Awareness',
        status: idx === 1 ? 'APPROVED' : 'PENDING',
        date: dateStr,
        time: timeStr,
        content: {
          image: product?.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
          caption: `Elevate your lifestyle with the ${product?.name || 'latest release'}. Special launch pricing ₹${product?.selling_price || product?.price || '0'}. Link in bio to order now! ${(aiPlan?.hashtags || ['#TrendingNow', '#MustHave']).join(' ')}`,
          storyboard: [
            `Scene 1: Hook with ${product?.name || 'product'} showcase`,
            'Scene 2: Highlighting key features and craftsmanship',
            'Scene 3: Call to action with direct storefront link'
          ]
        }
      };
    });

    setContentCalendar(generated);
  };

  const updatePostStatus = (id: string, status: string) => {
    setContentCalendar((prev: any[]) => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="flex items-center gap-1 text-[#16123F] bg-[#FFE26A] px-2 py-0.5 rounded-md text-[10px] font-bold">
            <AlertCircle className="w-3 h-3" /> PENDING
          </span>
        );
      case 'APPROVED':
        return (
          <span className="flex items-center gap-1 text-[#16123F] bg-[#75C9B7] px-2 py-0.5 rounded-md text-[10px] font-bold">
            <CheckCircle2 className="w-3 h-3" /> APPROVED
          </span>
        );
      default:
        return <span className="px-2 py-0.5 rounded bg-[#F0F6F2] text-[#16123F] text-[10px] font-bold">{status}</span>;
    }
  };

  return (
    <div className="w-full space-y-5 font-sans">
      <div className="bg-white rounded-2xl p-7 border border-[#C7DDCC] shadow-xs space-y-6">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0F6F2]">
          <div>
            <h2 className="text-base font-extrabold text-[#16123F]">Schedule Pipeline</h2>
          </div>
          <button
            onClick={onDashboard}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#16123F] hover:bg-[#25205F] text-white text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-[#FFE26A]" />
            <span>Schedule Campaign Plan</span>
          </button>
        </div>

        {/* Pipeline Post Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {contentCalendar.map((item: any) => (
            <div
              key={item.id}
              className="bg-[#FAFAFA] border border-[#C7DDCC] rounded-2xl overflow-hidden hover:shadow-xs transition-all flex flex-col"
            >
              {/* Media Preview - Displays the actual selected product image */}
              <div className="h-36 relative bg-[#C7DDCC]/20 overflow-hidden flex items-center justify-center">
                {item.content?.image ? (
                  <img src={item.content.image} alt={item.productName} className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-8 h-8 text-[#16123F]/40" />
                )}
                <div className="absolute top-2.5 left-2.5">
                  {getStatusBadge(item.status)}
                </div>
                <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center text-white">
                  {item.type === 'Reel' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                </div>
              </div>

              {/* Details */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[10px] font-black text-[#75C9B7] uppercase tracking-wider block mb-1">
                    Day {item.day} • {item.platform}
                  </span>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h4 className="text-xs font-bold text-[#16123F] truncate">{item.productName}</h4>
                    {item.productPrice && (
                      <span className="text-[11px] font-bold text-[#75C9B7] shrink-0">₹{item.productPrice}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#555279] line-clamp-2 italic">"{item.hook}"</p>
                </div>

                <div className="pt-3 border-t border-[#C7DDCC]/50 flex justify-between items-center text-[10px]">
                  <span className="text-[#555279] font-semibold">{item.date} • {item.time}</span>
                  <button
                    onClick={() => setSelectedPost(item)}
                    className="font-bold text-[#16123F] hover:text-[#75C9B7] transition-colors cursor-pointer"
                  >
                    Review →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedPost && (
        <ContentReviewModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onApprove={() => {
            updatePostStatus(selectedPost.id, 'APPROVED');
            setSelectedPost(null);
          }}
        />
      )}
    </div>
  );
};
