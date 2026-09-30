import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store';
import { setAuth } from '../../store/slices/authSlice';
import { addToast } from '../../store/slices/uiSlice';
import { invitationApi } from '../../api/invitationApi';
import { FormField } from '../../components/common/FormField';
import { FormAlert } from '../../components/common/FormAlert';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import { isValidPhone, sanitizePhoneInput } from '../../utils/validation';
import type { DealerInvitation } from '../../types';
import { CheckCircle2, AlertTriangle, UserCheck, Lock, Phone, Building2, User } from 'lucide-react';

export const AcceptInvitePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [invitation, setInvitation] = useState<DealerInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!token) {
      setError('No invitation token provided in URL.');
      setLoading(false);
      return;
    }

    invitationApi
      .getByToken(token)
      .then((res) => {
        setInvitation(res.data);
        if (res.data.company_name) {
          setCompanyName(res.data.company_name);
        }
      })
      .catch((err) => {
        setError(err.message || 'Invalid or expired invitation token');
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const errors: Record<string, string> = {};
    if (!name.trim()) {
      errors.name = 'Full name is required.';
    }
    if (!password || password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }
    if (phone.trim() && !isValidPhone(phone)) {
      errors.phone = 'Please enter a valid phone number (7 to 15 digits).';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError('Please resolve the highlighted issues before continuing.');
      return;
    }

    setFieldErrors({});
    setFormError(null);

    setIsSubmitting(true);
    try {
      const res = await invitationApi.acceptInvitation({
        token,
        name: name.trim(),
        password,
        phone: phone.trim() || undefined,
        company_name: companyName.trim() || undefined,
      });

      dispatch(
        setAuth({
          user: res.data.user,
          token: res.data.token,
          accessToken: res.data.accessToken || res.data.token,
          refreshToken: res.data.refreshToken,
        })
      );
      dispatch(addToast({ type: 'success', message: res.message || 'Account activated successfully!' }));

      const role = res.data.user.role;
      if (role === 'DEALER') navigate('/dealer');
      else if (role === 'MARKETING') navigate('/marketing');
      else if (role === 'SALES') navigate('/sales/orders');
      else navigate('/admin');
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to accept invitation';
      setFormError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b0f17] text-white">
        <Spinner size="lg" />
        <p className="text-[#535F80] text-xs font-semibold mt-4 tracking-wider uppercase">
          Validating invitation token...
        </p>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0b0f17]">
        <div className="w-full max-w-md surface-card p-8 text-center rounded-2xl border border-rose-500/30 shadow-2xl space-y-4">
          <div className="inline-flex p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-white">Invitation Expired or Invalid</h2>
          <p className="text-sm text-[#535F80]">
            {error || 'This invitation link has expired or has already been redeemed.'}
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/login')}
              className="btn-secondary w-full"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const roleLabel = invitation.role === 'MARKETING' ? 'Digital Marketer' : invitation.role === 'SALES' ? 'Sales Team' : 'Supplier / Dealer';

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#16123F] relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 15%, rgba(117, 201, 183, 0.15) 0%, transparent 60%), radial-gradient(circle at 85% 85%, rgba(255, 226, 106, 0.08) 0%, transparent 50%)',
        }}
      />

      <div className="w-full max-w-md bg-white p-6 sm:p-7 rounded-[32px] border border-[#C7DDCC] shadow-2xl relative z-10 space-y-4 my-auto animate-scale-up">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-[#75C9B7] to-[#ABD699] text-[#16123F] mb-1 shadow-md shadow-[#75C9B7]/30">
            <UserCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-[#16123F] tracking-tight">
            Accept Partner Invitation
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-3">
          <FormAlert message={formError} onClose={() => setFormError(null)} />

          <FormField
            label="Full Name"
            htmlFor="invite-name"
            required
            error={fieldErrors.name}
          >
            <Input
              id="invite-name"
              type="text"
              value={name}
              icon={User}
              onChange={(e) => {
                setName(e.target.value);
                setFieldErrors((prev) => ({ ...prev, name: '' }));
              }}
              placeholder="Jane Doe"
              error={fieldErrors.name}
            />
          </FormField>

          <FormField
            label="Set Password"
            htmlFor="invite-password"
            required
            error={fieldErrors.password}
          >
            <Input
              id="invite-password"
              type="password"
              value={password}
              icon={Lock}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors((prev) => ({ ...prev, password: '' }));
              }}
              placeholder="At least 6 characters"
              error={fieldErrors.password}
            />
          </FormField>

          <FormField
            label="Contact Phone"
            htmlFor="invite-phone"
            error={fieldErrors.phone}
          >
            <Input
              id="invite-phone"
              type="tel"
              value={phone}
              icon={Phone}
              onChange={(e) => {
                setPhone(sanitizePhoneInput(e.target.value));
                setFieldErrors((prev) => ({ ...prev, phone: '' }));
              }}
              placeholder="+91 98765 43210"
              error={fieldErrors.phone}
            />
          </FormField>

          {invitation.role === 'DEALER' && (
            <FormField label="Company or Supplier Name" htmlFor="invite-company">
              <Input
                id="invite-company"
                type="text"
                value={companyName}
                icon={Building2}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Apex Wholesale Supplies"
              />
            </FormField>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-2.5 flex items-center justify-center space-x-2 text-xs font-bold disabled:opacity-50 cursor-pointer shadow-md"
            >
              <span>{isSubmitting ? 'Submitting...' : 'Submit'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
