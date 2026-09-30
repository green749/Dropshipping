import React, { useEffect, useState } from 'react';
import type { OrderProfitability } from '../../../types';
import { Modal } from '../../../components/common/Modal';
import { financeApi } from '../../../api/financeApi';

interface OrderEconomicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
}

export const OrderEconomicsModal: React.FC<OrderEconomicsModalProps> = ({
  isOpen,
  onClose,
  businessId,
}) => {
  const [orders, setOrders] = useState<OrderProfitability[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      financeApi
        .getOrderProfitability({ business_id: businessId, limit: 30 })
        .then((res) => {
          setOrders(res.data || []);
        })
        .catch((err) => {
          console.error('Failed to load order profitability', err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, businessId]);

  const formatCurrency = (val: number) => {
    return `₹${Number(val || 0).toLocaleString('en-IN')}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Order Unit Economics & Profitability Breakdown" size="xl">
      <div className="space-y-4 pt-2">
        <p className="text-xs text-[#555279] font-medium">
          Detailed unit-level financial analysis across recent completed customer orders
        </p>

        <div className="overflow-x-auto max-h-[60vh] rounded-2xl border border-[#C7DDCC]/60">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F0F6F2] text-[11px] font-black text-[#16123F] uppercase tracking-wider sticky top-0 z-10 border-b border-[#C7DDCC]">
                <th className="py-2.5 px-3">Order</th>
                <th className="py-2.5 px-3">Revenue</th>
                <th className="py-2.5 px-3">COGS</th>
                <th className="py-2.5 px-3">Shipping</th>
                <th className="py-2.5 px-3">Gateway (2%)</th>
                <th className="py-2.5 px-3">Marketing</th>
                <th className="py-2.5 px-3 text-right">Net Profit</th>
                <th className="py-2.5 px-3 text-right">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C7DDCC]/40 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#555279]">
                    Loading order economics...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#555279]">
                    No order records found.
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const isProfitable = o.netProfit >= 0;
                  return (
                    <tr key={o.orderId} className="hover:bg-[#F2F8F4] transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-[#16123F]">
                          #{o.orderNumber}
                        </div>
                        <div className="text-[10px] text-[#555279] font-medium">{o.customerName}</div>
                      </td>
                      <td className="py-2.5 px-3 font-black text-[#16123F]">
                        {formatCurrency(o.revenue)}
                      </td>
                      <td className="py-2.5 px-3 text-[#555279] font-medium">
                        {formatCurrency(o.productCost)}
                      </td>
                      <td className="py-2.5 px-3 text-[#555279] font-medium">
                        {formatCurrency(o.shipping)}
                      </td>
                      <td className="py-2.5 px-3 text-[#555279] font-medium">
                        {formatCurrency(o.gatewayFee)}
                      </td>
                      <td className="py-2.5 px-3 text-[#555279] font-medium">
                        {formatCurrency(o.marketingCost)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black">
                        <span className={isProfitable ? 'text-[#16123F]' : 'text-rose-600'}>
                          {formatCurrency(o.netProfit)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black ${
                            (o.margin || 0) >= 25
                              ? 'bg-[#FFE26A] text-[#16123F]'
                              : (o.margin || 0) >= 15
                              ? 'bg-[#ABD699] text-[#16123F]'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {Number(o.margin || 0).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-3 border-t border-[#C7DDCC]/50">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-[#16123F] bg-[#F0F6F2] hover:bg-[#E2ECE5] border border-[#C7DDCC] rounded-full transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
