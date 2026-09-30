import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchBusinesses, createBusiness } from '../../store/slices/businessSlice';
import { addToast } from '../../store/slices/uiSlice';
import { Building2, Plus, Mail, Phone, Globe, Percent, Upload, Image as ImageIcon, Link as LinkIcon, Trash2, Check } from 'lucide-react';
import { FormField } from '../../components/common/FormField';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { FormAlert } from '../../components/common/FormAlert';
import { Modal } from '../../components/common/Modal';
import { ImageUpload } from '../../components/common/ImageUpload';
import { extractFormErrors } from '../../utils/errorParser';
import { isValidEmail, isValidPhone, sanitizePhoneInput } from '../../utils/validation';

const PRESET_LOGOS = [
  { label: 'Nordic Studio', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=120&auto=format&fit=crop&q=80' },
  { label: 'Apex Tech', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=120&auto=format&fit=crop&q=80' },
  { label: 'Luxe Living', url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=120&auto=format&fit=crop&q=80' },
  { label: 'Urban Drift', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&auto=format&fit=crop&q=80' },
  { label: 'Horizon Glow', url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=120&auto=format&fit=crop&q=80' },
];

export const BusinessesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { businesses, isLoading } = useAppSelector((state) => state.business);

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [logo, setLogo] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [profitMargin, setProfitMargin] = useState('20');
  const [isCreating, setIsCreating] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [modalError, setModalError] = useState<string | null>(null);
  const hasAutoOpenedRef = useRef(false);

  useEffect(() => {
    dispatch(fetchBusinesses());
  }, [dispatch]);

  const handleOpenModal = () => {
    setName('');
    setSlug('');
    setLogo('');
    setEmail('');
    setPhone('');
    setProfitMargin('20');
    setFieldErrors({});
    setModalError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (searchParams.get('create')) {
      setSearchParams({}, { replace: true });
    }
  };

  useEffect(() => {
    if (searchParams.get('create') === 'true' && !hasAutoOpenedRef.current) {
      hasAutoOpenedRef.current = true;
      handleOpenModal();
    }
  }, [searchParams]);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: '' }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Business name is required.';
    if (!slug.trim()) errors.slug = 'Slug is required.';
    if (!email.trim()) {
      errors.email = 'Contact email is required.';
    } else if (!isValidEmail(email)) {
      errors.email = 'Please enter a valid email address (e.g. contact@business.com).';
    }

    if (phone.trim() && !isValidPhone(phone)) {
      errors.phone = 'Please enter a valid contact phone number (7 to 15 digits).';
    }

    const marginNum = parseFloat(profitMargin);
    if (isNaN(marginNum) || marginNum < 0 || marginNum > 500) {
      errors.profitMargin = 'Profit margin must be a percentage between 0 and 500.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsCreating(true);
    const result = await dispatch(
      createBusiness({
        name: name.trim(),
        slug: slug.trim(),
        logo: logo.trim() || undefined,
        email: email.trim(),
        phone: phone.trim() || undefined,
        currency,
        profit_margin: marginNum,
      })
    );
    setIsCreating(false);

    if (createBusiness.fulfilled.match(result)) {
      dispatch(addToast({ type: 'success', message: `Business '${name}' created successfully!` }));
      handleCloseModal();
      setName('');
      setSlug('');
      setLogo('');
      setEmail('');
      setPhone('');
      setProfitMargin('20');
      setFieldErrors({});
    } else {
      const parsed = extractFormErrors(result.payload);
      if (parsed.fieldErrors && Object.keys(parsed.fieldErrors).length > 0) {
        setFieldErrors((prev) => ({ ...prev, ...(parsed.fieldErrors as Record<string, string>) }));
      }
      setModalError(parsed.generalError || (result.payload as string) || 'Failed to create business');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Context Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold text-[#16123F] tracking-tight">
            Storefront Business Entities
          </h1>
        </div>

        <button
          onClick={handleOpenModal}
          className="btn-primary shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Business</span>
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-14 text-[#16123F]/60 text-sm font-semibold">Loading businesses...</div>
      ) : businesses.length === 0 ? (
        <div className="text-center py-16 surface-panel bg-white rounded-2xl border border-[#C7DDCC]">
          <Building2 className="w-10 h-10 text-[#16123F]/40 mx-auto mb-2" />
          <p className="text-[#16123F] text-sm font-bold">No businesses registered yet</p>
          <p className="text-[#16123F]/60 text-xs mt-1">
            Click "Add New Business" to configure your first multi-tenant storefront.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {businesses.map((b) => (
            <div
              key={b.id}
              className="surface-panel bg-white rounded-2xl p-5 border border-[#C7DDCC] space-y-4 hover:border-[#75C9B7] hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3 min-w-0">
                  {b.logo ? (
                    <img
                      src={b.logo}
                      alt={b.name}
                      className="w-11 h-11 rounded-full object-cover border border-[#C7DDCC] shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-[#16123F] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                      {b.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-[#16123F] tracking-tight truncate">{b.name}</h3>
                    <span className="text-[11px] font-mono font-semibold text-[#16123F]/60 block truncate">@{b.slug}</span>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-[#16123F] shrink-0">Active</span>
              </div>

              <div className="space-y-2 pt-3 border-t border-[#C7DDCC]/60 text-xs text-[#16123F]/70">
                <div className="flex items-center justify-between pb-2 border-b border-[#C7DDCC]/40">
                  <span className="font-semibold text-[#16123F]">Profit Markup:</span>
                  <span className="font-bold text-[#16123F] font-mono">
                    +{b.profit_margin ? Number(b.profit_margin) : 20}%
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-[#16123F]/50 shrink-0" />
                  <span className="truncate">{b.email || 'No email registered'}</span>
                </div>
                {b.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-[#16123F]/50 shrink-0" />
                    <span>{b.phone}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Globe className="w-3.5 h-3.5 text-[#16123F]/50 shrink-0" />
                  <span>
                    Currency: <strong className="text-[#16123F]">{b.currency || 'USD'}</strong>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Creation Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title="Register New Storefront Business"
        maxWidth="md"
      >
        <div className="space-y-4">
          {modalError && (
            <FormAlert message={modalError} onClose={() => setModalError(null)} />
          )}

          <form onSubmit={handleCreate} noValidate className="space-y-4">
            {/* Neat Brand Logo Picker */}
            <ImageUpload
              value={logo}
              onChange={(newLogo) => {
                setLogo(newLogo);
                if (fieldErrors.logo) setFieldErrors((prev) => ({ ...prev, logo: '' }));
              }}
              onError={(errMsg) => setFieldErrors((prev) => ({ ...prev, logo: errMsg }))}
              label="Business Logo"
              hideTabs={true}
              maxSizeMB={2}
            />
            {fieldErrors.logo && (
              <p className="text-[11px] font-semibold text-rose-500 mt-1">{fieldErrors.logo}</p>
            )}

            <FormField
              label="Business Name"
              htmlFor="biz-name"
              required
              error={fieldErrors.name}
            >
              <Input
                id="biz-name"
                type="text"
                required
                value={name}
                hasError={Boolean(fieldErrors.name)}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Acme Dropship"
              />
            </FormField>

            <FormField
              label="Store Slug"
              htmlFor="biz-slug"
              required
              error={fieldErrors.slug}
            >
              <Input
                id="biz-slug"
                type="text"
                required
                value={slug}
                hasError={Boolean(fieldErrors.slug)}
                onChange={(e) => {
                  setSlug(e.target.value);
                  if (fieldErrors.slug) setFieldErrors((prev) => ({ ...prev, slug: '' }));
                }}
                placeholder="acme-dropship"
                className="font-mono"
              />
            </FormField>

            <FormField
              label="Default Profit Markup (%)"
              htmlFor="biz-margin"
              required
              error={fieldErrors.profitMargin}
            >
              <Input
                id="biz-margin"
                type="number"
                step="1"
                min="0"
                max="500"
                required
                value={profitMargin}
                hasError={Boolean(fieldErrors.profitMargin)}
                onChange={(e) => {
                  setProfitMargin(e.target.value);
                  if (fieldErrors.profitMargin) setFieldErrors((prev) => ({ ...prev, profitMargin: '' }));
                }}
                placeholder="20"
                suffix={<Percent className="w-3.5 h-3.5 text-[#16123F]/50" />}
                className="font-mono tabular-nums text-emerald-600 font-semibold"
              />
            </FormField>

            <FormField label="Contact Email" htmlFor="biz-email" required error={fieldErrors.email}>
              <Input
                id="biz-email"
                type="email"
                required
                value={email}
                hasError={Boolean(fieldErrors.email)}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: '' }));
                }}
                placeholder="contact@acme.com"
                icon={Mail}
              />
            </FormField>

            <FormField label="Contact Phone" htmlFor="biz-phone" error={fieldErrors.phone}>
              <Input
                id="biz-phone"
                type="tel"
                value={phone}
                hasError={Boolean(fieldErrors.phone)}
                onChange={(e) => {
                  setPhone(sanitizePhoneInput(e.target.value));
                  if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: '' }));
                }}
                placeholder="+91 98765 43210"
                icon={Phone}
              />
            </FormField>

            <FormField label="Currency Base">
              <Select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="INR">INR (₹ - Indian Rupee)</option>
                <option value="USD">USD ($ - US Dollar)</option>
                <option value="EUR">EUR (€ - Euro)</option>
                <option value="GBP">GBP (£ - British Pound)</option>
                <option value="CAD">CAD ($ - Canadian Dollar)</option>
                <option value="AUD">AUD ($ - Australian Dollar)</option>
                <option value="AED">AED (د.إ - UAE Dirham)</option>
              </Select>
            </FormField>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleCloseModal}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="btn-primary text-xs"
              >
                {isCreating ? 'Creating...' : 'Register Business'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};
