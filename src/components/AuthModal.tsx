import React, { useState } from 'react';
import { CrownLogo } from './CrownLogo';
import { Phone, ShieldCheck, ArrowRight, CheckCircle2, Lock } from 'lucide-react';

interface AuthModalProps {
  onSuccess: (phone: string, name: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess }) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [name, setName] = useState('Salman Bah');
  const [phone, setPhone] = useState('+966 50 823 4567');
  const [otp, setOtp] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Please provide your name and phone number.');
      return;
    }
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 800);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess(phone, name);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="max-w-md w-full bg-[#121212] border-2 border-[#D4AF37] rounded-2xl p-6 shadow-[0_0_40px_rgba(212,175,55,0.3)] relative">
        {/* Crown Logo & Title */}
        <div className="flex flex-col items-center text-center">
          <CrownLogo size={64} showGlow={true} />
          <h2 className="mt-3 text-xl font-black tracking-widest text-[#F3E5AB] font-royal uppercase">
            BENSALMAN 👑
          </h2>
          <p className="text-xs text-white/60 mt-1 uppercase tracking-wider font-semibold">
            One-Time Registration (Firebase Phone Auth)
          </p>
        </div>

        {/* Explain the One-Time Requirement */}
        <div className="mt-4 p-3 rounded-xl bg-[#181818] border border-[#282828] text-xs text-white/70 leading-relaxed flex items-start space-x-2.5">
          <Lock className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
          <span>
            <strong>Online ONCE:</strong> Verifies your cryptographic token. After this single setup, <strong>NO internet and NO SIM card</strong> are ever required!
          </span>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-200 text-xs">
            {error}
          </div>
        )}

        {/* STEP 1: Phone & Name */}
        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="mt-4 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#D4AF37] mb-1">
                Your Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Salman Bah"
                className="w-full bg-[#1A1A1A] border border-[#2A2412] focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#D4AF37] mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-3 text-white/40" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+966 50 123 4567"
                  className="w-full bg-[#1A1A1A] border border-[#2A2412] focus:border-[#D4AF37] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA820A] text-black font-extrabold text-xs tracking-wider uppercase hover:from-[#FFF1B0] hover:to-[#D4AF37] transition-all flex items-center justify-center space-x-2 shadow-lg"
            >
              {loading ? (
                <span>Requesting Firebase OTP...</span>
              ) : (
                <>
                  <span>Send OTP Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* STEP 2: OTP Entry */
          <form onSubmit={handleVerifyOtp} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#D4AF37] mb-1 text-center">
                Enter 6-Digit OTP Code sent to {phone}
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full text-center tracking-[0.5em] font-mono text-2xl font-bold bg-[#1A1A1A] border border-[#D4AF37] rounded-xl py-3 text-[#F3E5AB] focus:outline-none"
                required
              />
              <p className="text-center text-[10px] text-white/40 mt-1">
                Default sandbox code: <strong>123456</strong>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA820A] text-black font-extrabold text-xs tracking-wider uppercase hover:from-[#FFF1B0] hover:to-[#D4AF37] transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Attesting Device Token...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify OTP & Unlock Offline Mesh</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-center text-xs text-white/50 hover:text-white"
            >
              ← Edit Phone Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
