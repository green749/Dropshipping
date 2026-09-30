import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store';
import { closeModal, addToast } from '../../store/slices/uiSlice';
import { invitationApi } from '../../api/invitationApi';
import { isValidEmail } from '../../utils/validation';
import { FormField } from '../common/FormField';
import { FormAlert } from '../common/FormAlert';
import { Select } from '../common/Select';
import { X, Send, Copy, Check, Sparkles, Building2, Mail } from 'lucide-react';

export const InviteModal: React.FC = () => {
  const { activeModal } = useAppSelector((state) => state.ui);
  const { businesses, selectedBusiness } = useAppSelector((state) => state.business);
  const dispatch = useAppDispatch();
  const location = useLocation();

  const [role, setRole] = useState<'DEALER' | 'MARKETING' | 'SALES'>('DEALER');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [businessId, setBusinessId] = useState(selectedBusiness?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (activeModal === 'invite') {
      if (location.pathname.includes('digital-marketers') || location.pathname.includes('marketing')) {
        setRole('MARKETING');
      } else if (location.pathname.includes('sales')) {
        setRole('SALES');
      } else if (location.pathname.includes('dealers')) {
        setRole('DEALER');
      }
      setBusinessId(selectedBusiness?.id || (businesses.length > 0 ? businesses[0].id : ''));
      setFormError(null);
      setFieldErrors({});
    }
  }, [activeModal, location.pathname, selectedBusiness, businesses]);

  if (activeModal !== 'invite') return null;

  const targetBizId = businessId || selectedBusiness?.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!email.trim()) {
      errors.email = 'Please enter an invitee email address.';
    } else if (!isValidEmail(email)) {
      errors.email = 'Please enter a valid email address (e.g. partner@example.com).';
    }

    if (!targetBizId) {
      errors.businessId = 'Please select a business storefront.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError('Please resolve the highlighted issues before sending the invite.');
      return;
    }

    setFieldErrors({});
    setFormError(null);

    setIsSubmitting(true);
    setGeneratedLink(null);

    try {
      let res;
      if (role === 'DEALER') {
        res = await invitationApi.inviteDealer({
          email,
          business_id: targetBizId,
          company_name: companyName || undefined,
        });
      } else if (role === 'SALES') {
        res = await invitationApi.inviteSales({
          email,
          business_id: targetBizId,
        });
      } else {
        res = await invitationApi.inviteMarketer({
          email,
          business_id: targetBizId,
        });
      }

      const rawLink = res.data.inviteLink || '';
      const cleanLink = rawLink.startsWith('http')
        ? rawLink.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, window.location.origin)
        : `${window.location.origin}${rawLink.startsWith('/') ? '' : '/'}${rawLink}`;

      setGeneratedLink(cleanLink);
      dispatch(
        addToast({
          type: 'success',
          message: `${role === 'DEALER' ? 'Dealer' : role === 'SALES' ? 'Sales Team' : 'Digital Marketer'} invitation created!`,
        })
      );
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to generate invitation';
      setFormError(msg);
      if (msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('email')) {
        setFieldErrors((prev) => ({ ...prev, email: msg }));
      }
      dispatch(
        addToast({
          type: 'error',
          message: msg,
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      dispatch(addToast({ type: 'info', message: 'Invitation link copied to clipboard!' }));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setGeneratedLink(null);
    setEmail('');
    setCompanyName('');
    setBusinessId('');
    dispatch(closeModal());
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Explicit Dark Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        className="relative w-full max-w-lg my-auto rounded-[28px] bg-white border border-[#C7DDCC] p-6 shadow-2xl z-10"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#C7DDCC]/60 pb-4 mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-full bg-[#FFE26A] text-[#16123F] flex items-center justify-center shadow-md shadow-[#FFE26A]/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#16123F] tracking-tight">Generate Partner Invitation</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-[#555279] hover:text-[#16123F] transition-colors p-2 rounded-full hover:bg-[#F0F6F2] focus:outline-none cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {generatedLink ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#16123F] uppercase tracking-wider">
                Direct Shareable Invitation Link
              </label>
              <div className="flex items-center space-x-2 p-3 rounded-2xl bg-[#F8FAF8] border border-[#C7DDCC]">
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  className="bg-transparent text-xs text-[#16123F] w-full outline-none font-mono selection:bg-[#75C9B7]/30"
                />
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="px-3.5 py-2 rounded-xl bg-[#16123F] hover:bg-[#16123F]/90 text-white text-xs font-bold flex items-center space-x-1.5 shrink-0 transition-colors cursor-pointer shadow-xs active:scale-98"
                >
                  {copied ? <Check className="w-4 h-4 text-[#ABD699]" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-[11px] text-[#555279]">
                Share this secure, one-time link with your {role === 'DEALER' ? 'wholesale dealer' : role === 'SALES' ? 'sales representative' : 'digital marketer'} to complete onboarding.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <FormAlert message={formError} onClose={() => setFormError(null)} />

            <div>
              <label className="block text-xs font-bold text-[#16123F] mb-2">
                Invitation Role
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRole('DEALER')}
                  className={`p-3 rounded-2xl border text-left flex flex-col transition-all cursor-pointer ${
                    role === 'DEALER'
                      ? 'border-[#FFE26A] bg-[#FFE26A]/20 text-[#16123F] shadow-sm ring-2 ring-[#FFE26A]'
                      : 'border-[#C7DDCC] bg-[#F8FAF8] text-[#555279] hover:border-[#75C9B7]'
                  }`}
                >
                  <span className="text-xs font-bold text-[#16123F]">Dealer</span>
                  <span className="text-[10px] text-[#555279] mt-0.5 leading-tight">Supplier / Inventory</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('MARKETING')}
                  className={`p-3 rounded-2xl border text-left flex flex-col transition-all cursor-pointer ${
                    role === 'MARKETING'
                      ? 'border-[#FFE26A] bg-[#FFE26A]/20 text-[#16123F] shadow-sm ring-2 ring-[#FFE26A]'
                      : 'border-[#C7DDCC] bg-[#F8FAF8] text-[#555279] hover:border-[#75C9B7]'
                  }`}
                >
                  <span className="text-xs font-bold text-[#16123F]">Marketer</span>
                  <span className="text-[10px] text-[#555279] mt-0.5 leading-tight">Campaigns & Ads</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('SALES')}
                  className={`p-3 rounded-2xl border text-left flex flex-col transition-all cursor-pointer ${
                    role === 'SALES'
                      ? 'border-[#FFE26A] bg-[#FFE26A]/20 text-[#16123F] shadow-sm ring-2 ring-[#FFE26A]'
                      : 'border-[#C7DDCC] bg-[#F8FAF8] text-[#555279] hover:border-[#75C9B7]'
                  }`}
                >
                  <span className="text-xs font-bold text-[#16123F]">Sales Team</span>
                  <span className="text-[10px] text-[#555279] mt-0.5 leading-tight">Orders, Customers, Dealers</span>
                </button>
              </div>
            </div>

            <FormField
              label="Recipient Email Address"
              htmlFor="invite-email-input"
              required
              error={fieldErrors.email}
            >
              <div className="relative flex items-center">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-[#555279]/70 z-10">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="invite-email-input"
                  type="email"
                  placeholder="partner@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  className={`input-field !pl-10 ${fieldErrors.email ? 'border-rose-400 focus:ring-rose-200' : ''}`}
                />
              </div>
            </FormField>

            {role === 'DEALER' && (
              <FormField
                label="Company or Store Name (Optional)"
                htmlFor="invite-company-input"
              >
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-[#555279]/70 z-10">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <input
                    id="invite-company-input"
                    type="text"
                    placeholder="Apex Supplies LLC"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="input-field !pl-10"
                  />
                </div>
              </FormField>
            )}

            <FormField
              label="Assign Access to Business"
              htmlFor="invite-business-select"
              required
              error={fieldErrors.businessId}
            >
              <Select
                id="invite-business-select"
                value={businessId}
                onChange={(e) => {
                  setBusinessId(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, businessId: '' }));
                }}
                placeholder="-- Select Business Storefront * --"
                className={fieldErrors.businessId ? 'border-rose-400 focus:ring-rose-200' : ''}
              >
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </FormField>

            <div className="flex justify-end space-x-2.5 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary text-xs"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Generating...' : 'Generate Invite Link'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
};
