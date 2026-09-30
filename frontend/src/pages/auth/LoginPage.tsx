import React, { useState, useCallback, memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { loginUser } from '../../store/slices/authSlice';
import { addToast } from '../../store/slices/uiSlice';
import { isValidEmail } from '../../utils/validation';
import { FormField } from '../../components/common/FormField';
import { Input } from '../../components/common/Input';
import { FormAlert } from '../../components/common/FormAlert';
import {
  Mail,
  Lock,
  LogIn,
  Eye,
  EyeOff,
  ShieldCheck,
  Truck,
  Megaphone,
  Users,
  Sparkles,
  ArrowRight,
  Zap,
} from 'lucide-react';

const DEMO_ROLES = [
  {
    email: 'admin@dropship.com',
    label: 'Admin',
    icon: ShieldCheck,
    activeBg: 'bg-[#75C9B7]/25 border-[#75C9B7] text-[#16123F]',
    iconColor: 'text-[#16123F]',
  },
  {
    email: 'dealer@supplier.com',
    label: 'Supplier',
    icon: Truck,
    activeBg: 'bg-[#ABD699]/35 border-[#ABD699] text-[#16123F]',
    iconColor: 'text-emerald-700',
  },
  {
    email: 'marketing@growth.com',
    label: 'Marketing',
    icon: Megaphone,
    activeBg: 'bg-[#FFE26A]/40 border-[#FFE26A] text-[#16123F]',
    iconColor: 'text-amber-700',
  },
  {
    email: 'sales@dropship.com',
    label: 'Sales',
    icon: Users,
    activeBg: 'bg-[#818CF8]/30 border-[#818CF8] text-[#16123F]',
    iconColor: 'text-indigo-700',
  },
] as const;

interface DemoRoleButtonProps {
  role: (typeof DEMO_ROLES)[number];
  isSelected: boolean;
  onSelect: (email: string) => void;
}

const DemoRoleButton = memo<DemoRoleButtonProps>(({ role, isSelected, onSelect }) => {
  const RoleIcon = role.icon;
  return (
    <button
      type="button"
      onClick={() => onSelect(role.email)}
      className={`p-2.5 rounded-2xl border text-left transition-all text-xs flex flex-col items-center justify-center gap-1 cursor-pointer ${
        isSelected
          ? `${role.activeBg} font-bold shadow-xs ring-2 ring-[#75C9B7]/40`
          : 'bg-[#F8FAF8] border-[#C7DDCC]/80 text-[#16123F] hover:border-[#75C9B7] hover:bg-[#F0F6F2]'
      }`}
    >
      <RoleIcon className={`w-4 h-4 ${role.iconColor}`} />
      <span className="text-[11px] font-bold">{role.label}</span>
    </button>
  );
});
DemoRoleButton.displayName = 'DemoRoleButton';

const HERO_SLIDES = [
  {
    tagline: 'Capturing Opportunities, Scaling Commerce',
    subtitle: 'Automated multi-tenant fulfillment with real-time telemetry.',
  },
  {
    tagline: 'Unified Supplier & Dealer Network',
    subtitle: 'Zero-latency inventory synchronization and SLA tracking.',
  },
  {
    tagline: 'AI-Powered Margin & Catalog Intelligence',
    subtitle: 'Dynamic repricing, profit protection, and campaign automation.',
  },
];

export const LoginPageComponent: React.FC = () => {
  const [email, setEmail] = useState('admin@dropship.com');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);

  // Field-level inline errors
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [generalError, setGeneralError] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  // Slide rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const validateForm = useCallback(() => {
    let hasError = false;
    setEmailError(undefined);
    setPasswordError(undefined);
    setGeneralError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError('Email address is required.');
      hasError = true;
    } else if (!isValidEmail(trimmedEmail)) {
      setEmailError('Please enter a valid email address (e.g. name@company.com).');
      hasError = true;
    }

    if (!password) {
      setPasswordError('Password is required.');
      hasError = true;
    }

    return !hasError;
  }, [email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const result = await dispatch(loginUser({ email: email.trim(), password }));

    if (loginUser.fulfilled.match(result)) {
      const role = result.payload.user.role;
      dispatch(addToast({ type: 'success', message: `Welcome back, ${result.payload.user.name}!` }));

      if (role === 'DEALER') navigate('/dealer');
      else if (role === 'MARKETING') navigate('/marketing');
      else if (role === 'SALES') navigate('/sales/orders');
      else navigate('/admin');
    } else {
      const errMsg = (result?.payload as unknown as string) || error || 'Invalid email or password. Please verify credentials.';
      setGeneralError(errMsg);
    }
  };

  const handleSelectDemoRole = useCallback((roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('Password123!');
    setEmailError(undefined);
    setPasswordError(undefined);
    setGeneralError(null);
  }, []);

  const handleTogglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-[#F0F4F8] text-[#16123F] relative overflow-hidden selection:bg-[#75C9B7]/30 selection:text-[#16123F]">
      {/* Soft Ambient Background Highlights */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#75C9B7]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#FFE26A]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#C7DDCC]/30 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Split Authentication Card */}
      <div className="w-full max-w-5xl bg-white rounded-[36px] border border-[#C7DDCC] p-4 sm:p-6 lg:p-8 shadow-xl shadow-slate-200/60 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
        
        {/* ─── LEFT HERO VISUAL CONTAINER (Deep Navy & Mint Accent) ─── */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-between h-full min-h-[560px] rounded-[28px] p-8 relative overflow-hidden bg-[#16123F] text-white shadow-lg">
          {/* Subtle Atmospheric Decorative Curves */}
          <div className="absolute inset-0 opacity-25 pointer-events-none">
            <svg
              className="w-full h-full object-cover"
              viewBox="0 0 500 700"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMidYMid slice"
            >
              <path
                d="M-50 450 C 120 380, 250 520, 550 350 L 550 700 L -50 700 Z"
                fill="#75C9B7"
                opacity="0.3"
              />
              <path
                d="M-50 520 C 150 460, 300 600, 550 470 L 550 700 L -50 700 Z"
                fill="#FFE26A"
                opacity="0.15"
              />
            </svg>
          </div>

          {/* Top Brand Logo & Pill */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#75C9B7] to-[#ABD699] text-[#16123F] flex items-center justify-center shadow-md shadow-[#75C9B7]/30 font-black text-lg">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-white tracking-tight block">
                  DropShip<span className="text-[#75C9B7]">Hub</span>
                </span>
                <span className="text-[10px] text-slate-300 font-semibold tracking-wide uppercase">
                  B2B Commerce OS
                </span>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-slate-200 bg-white/10 border border-white/15 backdrop-blur-md">
              <span>Enterprise Edition</span>
              <Sparkles className="w-3 h-3 text-[#FFE26A]" />
            </span>
          </div>

          {/* Center 3D Isometric Crystal Prism Graphic (Matching Dashboard Aesthetic) */}
          <div className="my-auto text-center relative z-10 py-6 flex items-center justify-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Soft Ambient Glow */}
              <div className="absolute inset-0 rounded-full bg-[#75C9B7]/25 blur-2xl" />
              
              {/* 3D Geometric Isometric Prism Icon */}
              <svg
                className="w-28 h-28 relative z-10 drop-shadow-xl"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Top Polygon */}
                <polygon points="50,15 82,32 50,49 18,32" fill="#ABD699" />
                {/* Left Facet */}
                <polygon points="18,32 50,49 50,85 18,68" fill="#75C9B7" />
                {/* Right Facet */}
                <polygon points="50,49 82,32 82,68 50,85" fill="#FFE26A" />
                {/* Base Shadow */}
                <polygon points="50,85 82,68 50,75 18,68" fill="#16123F" opacity="0.4" />
              </svg>
            </div>
          </div>

          {/* Bottom Captions & Carousel Indicators */}
          <div className="relative z-10 space-y-3">
            <div className="transition-all duration-500">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                {HERO_SLIDES[activeSlide].tagline}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
                {HERO_SLIDES[activeSlide].subtitle}
              </p>
            </div>

            {/* Carousel Navigation Bars */}
            <div className="flex items-center gap-2 pt-1">
              {HERO_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    activeSlide === idx
                      ? 'w-7 bg-[#75C9B7]'
                      : 'w-2 bg-white/25 hover:bg-white/40'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ─── RIGHT AUTHENTICATION FORM (Crisp Light Theme) ─── */}
        <div className="lg:col-span-6 flex flex-col justify-center px-2 sm:px-4 lg:px-6 py-2">
          
          {/* Header Title */}
          <div className="space-y-1 mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16123F] tracking-tight">
              Sign in to Portal
            </h1>
            <p className="text-xs sm:text-sm text-[#555279]">
              Access wholesale orders, real-time inventory, and supplier operations.
            </p>
          </div>

          {generalError && (
            <div className="mb-4">
              <FormAlert message={generalError} onClose={() => setGeneralError(null)} />
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <FormField
              label="Work Email Address"
              htmlFor="login-email"
              required
              error={emailError}
            >
              <div className="relative">
                <Input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  hasError={Boolean(emailError)}
                  icon={Mail}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(undefined);
                    if (generalError) setGeneralError(null);
                  }}
                  placeholder="name@company.com"
                  className="!bg-[#F8FAF8] !border-[#C7DDCC] !text-[#16123F] placeholder:text-slate-400 focus:!border-[#75C9B7] focus:!ring-2 focus:!ring-[#75C9B7]/20 rounded-2xl h-11 text-xs"
                />
              </div>
            </FormField>

            <FormField
              label="Account Password"
              htmlFor="login-password"
              required
              error={passwordError}
            >
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  hasError={Boolean(passwordError)}
                  icon={Lock}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError(undefined);
                    if (generalError) setGeneralError(null);
                  }}
                  placeholder="••••••••••••"
                  className="!bg-[#F8FAF8] !border-[#C7DDCC] !text-[#16123F] placeholder:text-slate-400 focus:!border-[#75C9B7] focus:!ring-2 focus:!ring-[#75C9B7]/20 rounded-2xl h-11 text-xs"
                  suffix={
                    <button
                      type="button"
                      onClick={handleTogglePassword}
                      className="text-[#555279] hover:text-[#16123F] transition-colors p-1 cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
              </div>
            </FormField>

            {/* Checkbox and Forgot Options */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[#16123F] font-semibold">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-md bg-white border-[#C7DDCC] text-[#16123F] focus:ring-[#75C9B7]/40 focus:ring-offset-0 cursor-pointer"
                />
                <span>Remember this workstation</span>
              </label>
              <span className="text-[#75C9B7] hover:underline cursor-pointer font-bold transition-colors">
                Forgot password?
              </span>
            </div>

            {/* Submit Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#75C9B7] hover:bg-[#62BCA9] text-[#16123F] font-extrabold text-sm shadow-md shadow-[#75C9B7]/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
              >
                <LogIn className="w-4 h-4 text-[#16123F]" />
                <span>{isLoading ? 'Authenticating Credentials...' : 'Sign In to Portal'}</span>
                {!isLoading && <ArrowRight className="w-4 h-4 text-[#16123F]" />}
              </button>
            </div>
          </form>

          {/* Quick Demo Fast-Switch Grid */}
          <div className="mt-6 pt-5 border-t border-[#C7DDCC]/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#555279]">
                Fast-Switch Demo Personas
              </span>
              <span className="text-[10px] text-[#16123F] bg-[#FFE26A] px-2 py-0.5 rounded-full font-bold">
                1-Click Autofill
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DEMO_ROLES.map((role) => (
                <DemoRoleButton
                  key={role.email}
                  role={role}
                  isSelected={email === role.email}
                  onSelect={handleSelectDemoRole}
                />
              ))}
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-5 text-center">
            <p className="text-[11px] text-[#555279]">
              Invited supplier or team member?{' '}
              <span className="text-[#16123F] font-bold underline cursor-pointer">
                Use your private invitation link
              </span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export const LoginPage = memo(LoginPageComponent);
export default LoginPage;



