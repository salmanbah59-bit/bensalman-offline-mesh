import React, { useState } from 'react';
import { CrownLogo } from './CrownLogo';
import { ShieldCheck, Check, Sparkles, AlertCircle } from 'lucide-react';

interface GreenCharterModalProps {
  onAccept: () => void;
  onClose?: () => void;
  canDismiss?: boolean;
}

export const GreenCharterModal: React.FC<GreenCharterModalProps> = ({
  onAccept,
  onClose,
  canDismiss = false,
}) => {
  const [pledge1, setPledge1] = useState(false);
  const [pledge2, setPledge2] = useState(false);
  const [pledge3, setPledge3] = useState(false);
  const [pledge4, setPledge4] = useState(false);

  const allAccepted = pledge1 && pledge2 && pledge3 && pledge4;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="max-w-md w-full bg-[#121212] border-2 border-[#D4AF37] rounded-2xl p-6 shadow-[0_0_40px_rgba(212,175,55,0.25)] relative max-h-[90vh] overflow-y-auto">
        {canDismiss && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/40 hover:text-white"
          >
            ✕
          </button>
        )}

        {/* Crown Logo & Header */}
        <div className="flex flex-col items-center text-center">
          <CrownLogo size={56} showGlow={true} />
          <h2 className="mt-3 text-lg font-black tracking-wider text-[#F3E5AB] font-royal uppercase">
            Green Content Charter 🌿👑
          </h2>
          <p className="text-xs text-white/60 mt-1">
            Family-Safe Oath for Zero-Internet Offline Communication
          </p>
        </div>

        {/* Sacred Oath Box */}
        <div className="mt-4 p-3.5 rounded-xl bg-[#1A160E] border border-[#D4AF37]/40 text-xs italic text-[#FFF8DC]/90 leading-relaxed text-center">
          "I solemnly pledge to honor the sanctity of family-safe communication.
          No vulgarity, no profanity, no hate, and no harassment.
          Decentralized freedom is protected by mutual respect."
        </div>

        {/* 4 Pillars with Checkboxes */}
        <div className="mt-4 space-y-2.5">
          <label className="flex items-start space-x-3 p-2.5 rounded-lg bg-[#181818] border border-[#282828] cursor-pointer hover:border-[#D4AF37]/50 transition-colors">
            <input
              type="checkbox"
              checked={pledge1}
              onChange={(e) => setPledge1(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded accent-[#D4AF37]"
            />
            <div className="text-xs">
              <span className="font-bold text-white block">1. 100% Family-Safe Content</span>
              <span className="text-white/50 text-[11px]">
                Zero profanity, vulgarity, explicit media, or toxic rhetoric. Suitable for all generations.
              </span>
            </div>
          </label>

          <label className="flex items-start space-x-3 p-2.5 rounded-lg bg-[#181818] border border-[#282828] cursor-pointer hover:border-[#D4AF37]/50 transition-colors">
            <input
              type="checkbox"
              checked={pledge2}
              onChange={(e) => setPledge2(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded accent-[#D4AF37]"
            />
            <div className="text-xs">
              <span className="font-bold text-white block">2. Mutual Consent Requirement</span>
              <span className="text-white/50 text-[11px]">
                Both peers must reciprocally accept pairing. No forced or unsolicited contact.
              </span>
            </div>
          </label>

          <label className="flex items-start space-x-3 p-2.5 rounded-lg bg-[#181818] border border-[#282828] cursor-pointer hover:border-[#D4AF37]/50 transition-colors">
            <input
              type="checkbox"
              checked={pledge3}
              onChange={(e) => setPledge3(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded accent-[#D4AF37]"
            />
            <div className="text-xs">
              <span className="font-bold text-white block">3. Relay Custodian Honor</span>
              <span className="text-white/50 text-[11px]">
                Store-and-forward relay nodes honor end-to-end encryption and will never attempt to forge packets.
              </span>
            </div>
          </label>

          <label className="flex items-start space-x-3 p-2.5 rounded-lg bg-[#181818] border border-[#282828] cursor-pointer hover:border-[#D4AF37]/50 transition-colors">
            <input
              type="checkbox"
              checked={pledge4}
              onChange={(e) => setPledge4(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded accent-[#D4AF37]"
            />
            <div className="text-xs">
              <span className="font-bold text-white block">4. Automated Safety Heuristics</span>
              <span className="text-white/50 text-[11px]">
                Offline on-device safety models inspect outgoing messages before mesh dispatch.
              </span>
            </div>
          </label>
        </div>

        {/* Accept Button */}
        <div className="mt-5">
          <button
            onClick={onAccept}
            disabled={!allAccepted}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA820A] text-black font-extrabold text-xs tracking-wider uppercase disabled:opacity-40 disabled:cursor-not-allowed hover:from-[#FFF1B0] hover:to-[#D4AF37] transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center justify-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>I Accept the Charter & Enter Mesh 👑</span>
          </button>

          {!allAccepted && (
            <p className="text-center text-[10px] text-amber-400/80 mt-2">
              * Please check all 4 commitments to proceed into BENSALMAN
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
