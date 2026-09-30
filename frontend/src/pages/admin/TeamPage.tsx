import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { addToast, openModal } from '../../store/slices/uiSlice';
import { invitationApi } from '../../api/invitationApi';
import type { DealerInvitation } from '../../types';
import { UserPlus, Mail, Copy, Check, LogIn, Loader2 } from 'lucide-react';
import { useImpersonate } from '../../hooks/useImpersonate';

import { chatApi } from '../../api/chatApi';

export const TeamPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const isDigitalMarketerRoute = location.pathname.includes('digital-marketers');
  const isSalesRoute = location.pathname.includes('sales-team') || location.pathname.includes('sales');

  const { selectedBusiness } = useAppSelector((state) => state.business);
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === 'DROPSHIPPER';
  const { handleLoginAsUser, isSwitching } = useImpersonate();
  const [invitations, setInvitations] = useState<DealerInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACCEPTED' | 'PENDING'>('ALL');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'MARKETING' | 'DEALER' | 'SALES'>(
    isDigitalMarketerRoute ? 'MARKETING' : isSalesRoute ? 'SALES' : 'ALL'
  );

  useEffect(() => {
    if (isDigitalMarketerRoute) {
      setRoleFilter('MARKETING');
    } else if (isSalesRoute) {
      setRoleFilter('SALES');
    }
  }, [isDigitalMarketerRoute, isSalesRoute]);

  useEffect(() => {
    setLoading(true);
    const busParam = selectedBusiness?.id && selectedBusiness.id !== 'all' ? { business_id: selectedBusiness.id } : undefined;

    Promise.all([
      invitationApi.getAllInvitations(busParam).catch(() => ({ data: [] })),
      chatApi.getContacts(busParam).catch(() => ({ data: [] })),
    ])
      .then(([invRes, contactsRes]) => {
        const invList: DealerInvitation[] = invRes.data || [];
        const contactList = contactsRes.data || [];

        // Convert active user contacts (role: MARKETING, SALES, DEALER) into team member entries
        const activeUsers: DealerInvitation[] = contactList
          .filter((c: any) => c.role && c.role !== 'DROPSHIPPER' && !c.isPlatformAdmin)
          .map((c: any) => ({
            id: c.id,
            email: c.email,
            role: c.role,
            company_name: c.name || c.company_name || 'Team Member',
            status: 'ACCEPTED',
            token: '',
            invited_by: '',
            business_id: selectedBusiness?.id !== 'all' ? selectedBusiness?.id : undefined,
            created_at: new Date().toISOString(),
            expires_at: new Date().toISOString(),
          }));

        // Merge and deduplicate by email (active user takes precedence if existing)
        const emailMap = new Map<string, DealerInvitation>();
        activeUsers.forEach((u) => emailMap.set(u.email.toLowerCase().trim(), u));
        invList.forEach((inv) => {
          const key = (inv.email || '').toLowerCase().trim();
          if (key && !emailMap.has(key)) {
            emailMap.set(key, inv);
          }
        });

        setInvitations(Array.from(emailMap.values()));
      })
      .catch(() => setInvitations([]))
      .finally(() => setLoading(false));
  }, [selectedBusiness]);

  const displayInvitations = useMemo(() => {
    let result = invitations;
    if (selectedBusiness && selectedBusiness.id !== 'all') {
      result = result.filter(
        (inv) => !inv.business_id || inv.business_id === selectedBusiness.id
      );
    }
    if (roleFilter !== 'ALL') {
      result = result.filter((inv) => inv.role === roleFilter);
    }
    if (statusFilter !== 'ALL') {
      result = result.filter((inv) => inv.status === statusFilter);
    }
    return result;
  }, [invitations, selectedBusiness, roleFilter, statusFilter]);

  const copyLink = (token: string, id: string) => {
    const link = `${window.location.origin}/accept-invite?token=${token}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    dispatch(addToast({
      type: 'info',
      message: '📋 Invitation link copied to clipboard!',
    }));
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Context Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold text-[#051747] tracking-tight">
            {isSalesRoute
              ? 'Sales Team & Invitations'
              : isDigitalMarketerRoute
              ? 'Digital Marketing Team & Invitations'
              : 'Team & Partner Onboarding Invitations'}
          </h1>
        </div>

        <button
          onClick={() => dispatch(openModal('invite'))}
          className="btn-primary shrink-0 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Generate New Invitation</span>
        </button>
      </div>

      {/* Top Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Role Filters (visible when on general team page) */}
        {!isDigitalMarketerRoute && !isSalesRoute && (
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            {(['ALL', 'SALES', 'MARKETING', 'DEALER'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  roleFilter === r
                    ? 'bg-[#16123F] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r === 'ALL' ? 'All Roles' : r === 'SALES' ? 'Sales Team' : r === 'MARKETING' ? 'Marketers' : 'Dealers'}
              </button>
            ))}
          </div>
        )}

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          {(['ALL', 'ACCEPTED', 'PENDING'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === status
                  ? 'bg-[#16123F] text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {status === 'ALL'
                ? 'All Invitations'
                : status === 'ACCEPTED'
                ? 'Accepted'
                : 'Pending (Not Accepted)'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-14 text-[#535F80] text-sm">Loading invitations...</div>
      ) : displayInvitations.length === 0 ? (
        <div className="text-center py-16 surface-card rounded-xl border border-[rgba(5,23,71,0.08)]">
          <Mail className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-[#535F80] text-sm font-semibold">No invitations found</p>
          <p className="text-[#535F80] text-xs mt-1">
            {statusFilter !== 'ALL'
              ? `No ${statusFilter.toLowerCase()} invitations match the current filter.`
              : 'Click "Generate New Invitation" to onboard dealers or marketing partners.'}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-white text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 select-none">
                  <th className="py-4 pl-6 px-4 font-semibold">Recipient Email</th>
                  <th className="py-4 px-4 font-semibold">Authorized Role</th>
                  <th className="py-4 px-4 font-semibold">Company / Partner Name</th>
                  <th className="py-4 px-4 font-semibold">Token Status</th>
                  <th className="py-4 px-4 font-semibold">Expiration Date</th>
                  <th className="py-4 pr-6 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {displayInvitations.map((inv: DealerInvitation) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors duration-150 group">
                    <td className="py-4 pl-6 px-4 font-semibold text-[#0F172A] text-sm">{inv.email}</td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-semibold text-slate-800">
                        {inv.role === 'MARKETING' ? 'Digital Marketer' : inv.role === 'SALES' ? 'Sales Team' : inv.role === 'DEALER' ? 'Wholesale Dealer' : inv.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-600 font-normal">{inv.company_name || 'Individual'}</td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-slate-700 font-normal">
                        {inv.status === 'ACCEPTED' ? 'Accepted' : inv.status === 'PENDING' ? 'Pending' : inv.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-500 font-normal">
                      {new Date(inv.expires_at || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="py-4 pr-6 px-4 text-right">
                      {inv.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => copyLink(inv.token, inv.id)}
                            className="btn-secondary !text-xs !py-1 !px-2.5 inline-flex items-center gap-1.5 hover:border-slate-300"
                            title="Copy Invitation Link"
                          >
                            {copiedId === inv.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-600 font-semibold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>
                        </div>
                      ) : isAdmin ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleLoginAsUser(inv.email, inv.role)}
                            disabled={isSwitching === inv.email}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-[#16123F] bg-[#75C9B7]/20 hover:bg-[#75C9B7]/35 border border-[#75C9B7]/40 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                            title={`Log in as ${inv.email}`}
                          >
                            {isSwitching === inv.email ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <LogIn className="w-3.5 h-3.5 text-[#16123F]" />
                            )}
                            <span>Login as User</span>
                          </button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
