import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { useAppSelector } from '../../../store';
import type { DealerPerformance } from '../../../types';
import {
  Scale,
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertTriangle,
  Boxes,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Building2,
  Calendar,
  X,
  Plus,
} from 'lucide-react';

interface DealerComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  dealers?: DealerPerformance[];
  initialSelectedIds?: string[];
}

export const DealerComparisonModal: React.FC<DealerComparisonModalProps> = ({
  isOpen,
  onClose,
  dealers = [],
  initialSelectedIds = [],
}) => {
  const safeDealers = Array.isArray(dealers) ? dealers : [];
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialSelectedIds.length >= 2 ? initialSelectedIds : safeDealers.slice(0, 3).map((d) => d.id)
  );

  const selectedDealers = safeDealers.filter((d) => selectedIds.includes(d.id));

  const toggleDealer = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length <= 1) return; // Keep at least one
      setSelectedIds(selectedIds.filter((dId) => dId !== id));
    } else {
      if (selectedIds.length >= 4) return; // Max 4 for readability
      setSelectedIds([...selectedIds, id]);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Multi-Supplier Performance Comparison"
      size="xl"
    >
      <div className="space-y-6">
        {/* Supplier Selector Chips */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-[#16123F]" />
              Select Suppliers to Compare (Up to 4)
            </label>
            <span className="text-[11px] text-slate-400 font-medium">
              {selectedIds.length} of {safeDealers.length} selected
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {safeDealers.map((d) => {
              const isSelected = selectedIds.includes(d.id);
              return (
                <button
                  key={d.id}
                  onClick={() => toggleDealer(d.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    isSelected
                      ? 'bg-[#16123F] text-white border-[#16123F] shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSelected ? 'bg-[#75C9B7]' : 'bg-slate-300'
                    }`}
                  />
                  <span>{d.company_name}</span>
                  {isSelected ? (
                    <X className="w-3 h-3 text-white/70 hover:text-white ml-0.5" />
                  ) : (
                    <Plus className="w-3 h-3 text-slate-400 ml-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Side-by-Side Comparison Matrix Table */}
        <div className="border border-slate-100 rounded-2xl overflow-x-auto shadow-xs bg-white custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="py-3.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-48">
                  Operational Metric
                </th>
                {selectedDealers.map((d) => (
                  <th key={d.id} className="py-3.5 px-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-slate-900 text-sm">{d.company_name}</span>
                      <span className="text-[11px] text-slate-400 font-medium">{d.contact_name}</span>
                      <span
                        className={`mt-1 inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-bold ${
                          d.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                        }`}
                      >
                        {d.status}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {/* Order Volume */}
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Total Orders Assigned
                </td>
                {selectedDealers.map((d) => (
                  <td key={d.id} className="py-3 px-4 text-center font-bold text-slate-900 tabular-nums">
                    {d.total_orders}
                  </td>
                ))}
              </tr>

              {/* Fulfillment Rate */}
              <tr className="bg-slate-50/40">
                <td className="py-3 px-4 font-semibold text-slate-700 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Order Fulfillment Rate
                </td>
                {selectedDealers.map((d) => (
                  <td key={d.id} className="py-3 px-4 text-center tabular-nums">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-bold ${
                        (d.fulfillment_rate || 0) >= 90
                          ? 'bg-emerald-50 text-emerald-700'
                          : (d.fulfillment_rate || 0) >= 75
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {Number(d.fulfillment_rate || 0).toFixed(1)}%
                    </span>
                  </td>
                ))}
              </tr>

              {/* Dispatch Speed */}
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  Avg. Dispatch Time
                </td>
                {selectedDealers.map((d) => (
                  <td key={d.id} className="py-3 px-4 text-center font-semibold text-slate-800 tabular-nums">
                    {d.avg_dispatch_hours != null ? `${Number(d.avg_dispatch_hours).toFixed(1)} hrs` : 'N/A'}
                  </td>
                ))}
              </tr>

              {/* SLA Compliance */}
              <tr className="bg-slate-50/40">
                <td className="py-3 px-4 font-semibold text-slate-700 flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                  SLA Compliance %
                </td>
                {selectedDealers.map((d) => (
                  <td key={d.id} className="py-3 px-4 text-center tabular-nums">
                    <span
                      className={`font-bold ${
                        (d.sla_compliance_rate || 0) >= 90 ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {Number(d.sla_compliance_rate || 0).toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      ({d.sla_breaches || 0} breaches)
                    </span>
                  </td>
                ))}
              </tr>

              {/* Cancellation Rate */}
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  Supplier Cancellation Rate
                </td>
                {selectedDealers.map((d) => (
                  <td key={d.id} className="py-3 px-4 text-center tabular-nums font-semibold text-slate-700">
                    {Number(d.dealer_cancellation_rate || 0).toFixed(1)}%
                  </td>
                ))}
              </tr>

              {/* RTO Rate */}
              <tr className="bg-slate-50/40">
                <td className="py-3 px-4 font-semibold text-slate-700 flex items-center gap-2">
                  <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                  RTO Rate (Courier / Non-Delivery)
                </td>
                {selectedDealers.map((d) => (
                  <td key={d.id} className="py-3 px-4 text-center tabular-nums">
                    <span
                      className={`font-semibold ${
                        (d.rto_rate || 0) > 15 ? 'text-rose-600' : 'text-slate-700'
                      }`}
                    >
                      {Number(d.rto_rate || 0).toFixed(1)}%
                    </span>
                  </td>
                ))}
              </tr>

              {/* Return Rate */}
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 flex items-center gap-2">
                  <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                  Customer Return Rate
                </td>
                {selectedDealers.map((d) => (
                  <td key={d.id} className="py-3 px-4 text-center tabular-nums font-semibold text-slate-700">
                    {Number(d.return_rate || 0).toFixed(1)}%
                  </td>
                ))}
              </tr>

              {/* Stock Availability */}
              <tr className="bg-slate-50/40">
                <td className="py-3 px-4 font-semibold text-slate-700 flex items-center gap-2">
                  <Boxes className="w-3.5 h-3.5 text-teal-500" />
                  Stock Availability Rate
                </td>
                {selectedDealers.map((d) => (
                  <td key={d.id} className="py-3 px-4 text-center tabular-nums">
                    <span className="font-bold text-slate-900">
                      {Number(d.stock_availability_rate || 0).toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      ({d.out_of_stock_products || 0} out of stock)
                    </span>
                  </td>
                ))}
              </tr>

              {/* Lead Time */}
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Configured Lead Time
                </td>
                {selectedDealers.map((d) => (
                  <td key={d.id} className="py-3 px-4 text-center font-semibold text-slate-700 tabular-nums">
                    {d.average_lead_time_days} days
                  </td>
                ))}
              </tr>

              {/* Revenue */}
              <tr className="bg-slate-50/40">
                <td className="py-3 px-4 font-semibold text-slate-700 flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  Total Realized Revenue
                </td>
                {selectedDealers.map((d) => (
                  <td key={d.id} className="py-3 px-4 text-center font-bold text-slate-900 tabular-nums">
                    {formatCurrency(d.revenue)}
                  </td>
                ))}
              </tr>

              {/* Gross Profit */}
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-[#16123F]" />
                  Net Operating Profit
                </td>
                {selectedDealers.map((d) => (
                  <td key={d.id} className="py-3 px-4 text-center font-extrabold text-emerald-600 tabular-nums">
                    {formatCurrency(d.profit)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Note / Disclaimer */}
        <p className="text-xs text-slate-400 text-center italic">
          Metrics are generated dynamically from audited database records. No subjective weighting or arbitrary score is applied.
        </p>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-xs px-5 py-2.5"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </Modal>
  );
};
