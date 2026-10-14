import React, { useState } from 'react';
import { Friend, ConsentStatus } from '../types';
import { UserPlus, ShieldAlert, Check, X, Clock, Users, ArrowRight } from 'lucide-react';

interface FriendsModalProps {
  friends: Friend[];
  onInviteFriend: (phone: string, name: string) => void;
  onAcceptInvite: (friendId: string) => void;
  onDeclineInvite: (friendId: string) => void;
  onClose: () => void;
}

export const FriendsModal: React.FC<FriendsModalProps> = ({
  friends,
  onInviteFriend,
  onAcceptInvite,
  onDeclineInvite,
  onClose,
}) => {
  const [friendName, setFriendName] = useState('');
  const [friendPhone, setFriendPhone] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const pendingIncoming = friends.filter((f) => f.consent === 'pending_incoming');
  const pendingOutgoing = friends.filter((f) => f.consent === 'pending_outgoing');
  const acceptedFriends = friends.filter((f) => f.consent === 'accepted');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendName.trim() || !friendPhone.trim()) return;

    onInviteFriend(friendPhone.trim(), friendName.trim());
    setNotification(`Pairing request broadcasted to ${friendName} via BLE & WiFi Direct!`);
    setFriendName('');
    setFriendPhone('');
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="max-w-md w-full bg-[#121212] border-2 border-[#D4AF37] rounded-2xl p-6 shadow-[0_0_40px_rgba(212,175,55,0.25)] relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white"
        >
          ✕
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#201C12] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-royal tracking-wide">
              MUTUAL CONSENT FRIENDS
            </h2>
            <p className="text-xs text-white/50">
              No forced adding • Cryptographic handshake
            </p>
          </div>
        </div>

        {/* Mutual Consent Notice */}
        <div className="p-3 rounded-xl bg-[#181818] border border-[#282828] text-xs text-white/70 leading-relaxed mb-4 flex items-start space-x-2">
          <ShieldAlert className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
          <span>
            <strong>Requirement:</strong> When you add a friend by phone number, they <strong>must explicitly accept</strong> before offline messages or voice notes can be decrypted.
          </span>
        </div>

        {notification && (
          <div className="mb-4 p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs animate-in fade-in">
            {notification}
          </div>
        )}

        {/* Invite Form */}
        <form onSubmit={handleInvite} className="p-3.5 rounded-xl bg-[#161616] border border-[#2A2412] mb-5 space-y-3">
          <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center space-x-1.5">
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite Friend by Phone</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Friend's Name"
              value={friendName}
              onChange={(e) => setFriendName(e.target.value)}
              className="bg-[#1F1F1F] border border-[#333333] focus:border-[#D4AF37] rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none"
              required
            />
            <input
              type="tel"
              placeholder="Phone (e.g. +966...)"
              value={friendPhone}
              onChange={(e) => setFriendPhone(e.target.value)}
              className="bg-[#1F1F1F] border border-[#333333] focus:border-[#D4AF37] rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-3 rounded-lg bg-[#D4AF37] text-black font-bold text-xs uppercase hover:bg-[#FFF1B0] transition-colors flex items-center justify-center space-x-1"
          >
            <span>Send Pairing Request</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Pending Incoming Requests */}
        {pendingIncoming.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Incoming Invitations ({pendingIncoming.length})</span>
            </h4>
            <div className="space-y-2">
              {pendingIncoming.map((f) => (
                <div
                  key={f.id}
                  className="p-3 rounded-xl bg-[#1C160E] border border-amber-500/30 flex items-center justify-between"
                >
                  <div>
                    <h5 className="text-xs font-bold text-white">{f.name}</h5>
                    <p className="text-[11px] text-white/50">{f.phone}</p>
                    <span className="text-[10px] text-amber-400">Sent you pairing request</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onDeclineInvite(f.id)}
                      className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/60"
                      title="Decline"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onAcceptInvite(f.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#00E676] text-black font-bold text-xs hover:bg-emerald-400 flex items-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Outgoing */}
        {pendingOutgoing.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
              Awaiting Friend's Acceptance ({pendingOutgoing.length})
            </h4>
            <div className="space-y-1.5">
              {pendingOutgoing.map((f) => (
                <div
                  key={f.id}
                  className="p-2.5 rounded-lg bg-[#181818] border border-[#262626] flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-white">{f.name}</span>
                    <span className="text-white/40 text-[11px] ml-2">({f.phone})</span>
                  </div>
                  <span className="text-amber-400/80 text-[11px] font-mono">Waiting...</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mutually Accepted Friends */}
        <div>
          <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-2">
            Mutual Friends Active ({acceptedFriends.length})
          </h4>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {acceptedFriends.map((f) => (
              <div
                key={f.id}
                className="p-2.5 rounded-lg bg-[#141414] border border-[#222222] flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-white">{f.name}</span>
                  <span className="text-white/40 text-[11px] ml-2 font-mono">{f.phone}</span>
                </div>
                <span className="text-emerald-400 text-[11px] font-semibold flex items-center space-x-1">
                  <Check className="w-3 h-3" />
                  <span>AES-256 Paired</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
