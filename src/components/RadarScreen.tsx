import React, { useState } from 'react';
import { Friend, ProximityStatus } from '../types';
import { CrownLogo } from './CrownLogo';
import { 
  Wifi, 
  Bluetooth, 
  Radio, 
  MessageSquare, 
  ShieldCheck, 
  Share2, 
  UserPlus, 
  Cpu, 
  FolderGit2,
  ChevronRight,
  Info
} from 'lucide-react';

interface RadarScreenProps {
  friends: Friend[];
  onSelectFriend: (friend: Friend) => void;
  onOpenAddFriend: () => void;
  onOpenCharter: () => void;
  onOpenSimulator: () => void;
  onOpenFlutterCode: () => void;
  relayQueueCount: number;
  myPhone: string;
  myName: string;
}

export const RadarScreen: React.FC<RadarScreenProps> = ({
  friends,
  onSelectFriend,
  onOpenAddFriend,
  onOpenCharter,
  onOpenSimulator,
  onOpenFlutterCode,
  relayQueueCount,
  myPhone,
  myName,
}) => {
  const [selectedBlip, setSelectedBlip] = useState<Friend | null>(null);

  const getStatusBadge = (status: ProximityStatus) => {
    switch (status) {
      case 'online':
        return {
          color: 'text-[#00E676]',
          bg: 'bg-[#00E676]/10 border-[#00E676]/30',
          dot: 'bg-[#00E676]',
          label: 'Online Direct (WiFi Direct)',
          icon: Wifi,
        };
      case 'nearby':
        return {
          color: 'text-[#FFD600]',
          bg: 'bg-[#FFD600]/10 border-[#FFD600]/30',
          dot: 'bg-[#FFD600]',
          label: 'Nearby Bluetooth (~20m)',
          icon: Bluetooth,
        };
      case 'out_of_range':
        return {
          color: 'text-[#FF1744]',
          bg: 'bg-[#FF1744]/10 border-[#FF1744]/30',
          dot: 'bg-[#FF1744]',
          label: 'Out of Range (Relayed A->B->C)',
          icon: Radio,
        };
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0D0D0D] text-[#E5E5E5] overflow-y-auto">
      {/* Top Royal App Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#111111]/95 backdrop-blur-md border-b border-[#2A2412]">
        <div className="flex items-center space-x-3">
          <CrownLogo size={38} showGlow={true} />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-black tracking-wider gold-text-gradient font-royal">
                BENSALMAN
              </h1>
              <span className="text-xs">👑</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse"></span>
              <span className="text-[10px] font-mono tracking-wider text-emerald-400 uppercase font-semibold">
                Offline P2P Cluster Active
              </span>
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenSimulator}
            title="Interactive Multi-Hop Mesh Simulator (A -> B -> C)"
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#1C180E] border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-all text-xs font-medium"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mesh Simulator</span>
          </button>

          <button
            onClick={onOpenFlutterCode}
            title="View Complete Flutter Source & Export ZIP"
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#141414] border border-[#2A2412] text-white/90 hover:border-[#D4AF37]/50 transition-all text-xs font-medium"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="hidden sm:inline">Flutter Code</span>
          </button>

          <button
            onClick={onOpenAddFriend}
            title="Add Friend by Phone (Mutual Consent)"
            className="p-1.5 rounded-lg bg-[#141414] border border-[#2A2412] text-[#D4AF37] hover:border-[#D4AF37]/50 transition-all"
          >
            <UserPlus className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Background Relay Banner if packets are in Store-and-Forward queue */}
      {relayQueueCount > 0 && (
        <div className="flex items-center justify-between px-4 py-2 bg-[#261E0A] border-b border-[#D4AF37]/30 text-[#F3E5AB] text-xs">
          <div className="flex items-center space-x-2">
            <Share2 className="w-3.5 h-3.5 text-[#D4AF37] animate-spin" />
            <span>
              Store-and-Forward: <strong>{relayQueueCount} packet(s)</strong> buffered in local Hive storage waiting for relay hops (A➔B➔C).
            </span>
          </div>
          <button
            onClick={onOpenSimulator}
            className="text-[11px] underline font-semibold text-[#D4AF37] hover:text-[#FFF1B0]"
          >
            Inspect
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 p-4 max-w-2xl mx-auto w-full flex flex-col items-center">
        {/* Radar Scanning Visualizer */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 my-2 flex items-center justify-center">
          {/* Radar Background Circle */}
          <div className="absolute inset-0 rounded-full bg-[#111111] border-2 border-[#D4AF37]/30 shadow-[0_0_35px_rgba(212,175,55,0.12)] overflow-hidden">
            {/* Concentric Gold Rings */}
            <div className="absolute inset-[18%] rounded-full border border-[#D4AF37]/20"></div>
            <div className="absolute inset-[38%] rounded-full border border-[#D4AF37]/25"></div>
            <div className="absolute inset-[58%] rounded-full border border-[#D4AF37]/30"></div>
            <div className="absolute inset-[78%] rounded-full border border-[#D4AF37]/35"></div>

            {/* Radar Crosshairs */}
            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-[#D4AF37]/15"></div>
            <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-[#D4AF37]/15"></div>

            {/* Rotating Radar Sweep Gradient */}
            <div 
              className="absolute inset-0 animate-radar-sweep pointer-events-none"
              style={{
                background: 'conic-gradient(from 0deg, rgba(212,175,55,0.4) 0deg, rgba(212,175,55,0.05) 55deg, transparent 90deg, transparent 360deg)',
              }}
            ></div>

            {/* Center Sonar Pulse Wave */}
            <div className="absolute inset-[40%] rounded-full border border-[#D4AF37]/40 animate-radar-ping pointer-events-none"></div>

            {/* Friend Blips on Radar */}
            {friends.map((friend, idx) => {
              // Calculate radar coordinates based on status distance and angle
              const total = friends.length || 1;
              const angle = (idx * (2 * Math.PI / total)) + 0.45;
              let radiusFraction = 0.35; // online (close)
              let blipColor = '#00E676'; // green
              if (friend.status === 'nearby') {
                radiusFraction = 0.65;
                blipColor = '#FFD600'; // yellow
              } else if (friend.status === 'out_of_range') {
                radiusFraction = 0.88;
                blipColor = '#FF1744'; // red
              }

              const leftPct = 50 + Math.cos(angle) * (radiusFraction * 46);
              const topPct = 50 + Math.sin(angle) * (radiusFraction * 46);

              return (
                <button
                  key={friend.id}
                  onClick={() => setSelectedBlip(friend)}
                  title={`${friend.name} - ${friend.status}`}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-20 focus:outline-none"
                  style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                >
                  <div className="relative flex items-center justify-center">
                    <span
                      className="absolute w-5 h-5 rounded-full opacity-60 animate-ping"
                      style={{ backgroundColor: blipColor }}
                    ></span>
                    <span
                      className="w-3.5 h-3.5 rounded-full border-2 border-[#0D0D0D] shadow-md transition-transform group-hover:scale-150"
                      style={{ backgroundColor: blipColor }}
                    ></span>
                    <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold tracking-tight text-white/80 whitespace-nowrap bg-black/70 px-1 py-0.5 rounded pointer-events-none border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                      {friend.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Central Crown Core */}
          <div className="relative z-10 flex flex-col items-center justify-center w-14 h-14 rounded-full bg-[#1A160D] border-2 border-[#D4AF37] shadow-[0_0_18px_rgba(212,175,55,0.4)]">
            <span className="text-xl">👑</span>
            <span className="text-[8px] font-bold text-[#F3E5AB] uppercase tracking-tighter">
              YOU
            </span>
          </div>
        </div>

        {/* Selected Blip Quick Preview Card */}
        {selectedBlip && (
          <div className="w-full mt-2 p-3 rounded-xl bg-[#161616] border border-[#D4AF37]/50 flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#201C12] border border-[#D4AF37] flex items-center justify-center text-sm font-bold text-[#F3E5AB]">
                {selectedBlip.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center space-x-1.5">
                  <span>{selectedBlip.name}</span>
                  <span className={`w-2 h-2 rounded-full ${getStatusBadge(selectedBlip.status).dot}`}></span>
                </h4>
                <p className="text-xs text-white/50">{selectedBlip.phone}</p>
                <p className="text-[11px] font-medium mt-0.5" style={{ color: getStatusBadge(selectedBlip.status).color.replace('text-[', '').replace(']', '') }}>
                  {getStatusBadge(selectedBlip.status).label}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onSelectFriend(selectedBlip)}
                className="px-3 py-1.5 rounded-lg bg-[#D4AF37] text-black font-bold text-xs hover:bg-[#FFF1B0] transition-colors flex items-center space-x-1"
              >
                <span>Chat</span>
                <MessageSquare className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setSelectedBlip(null)}
                className="text-white/40 hover:text-white text-xs px-1"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Status Legend (Strict specification: Green=Online, Yellow=Nearby Bluetooth, Red=Out of range) */}
        <div className="w-full mt-4 p-3 rounded-xl bg-[#141414] border border-[#2A2412] grid grid-cols-3 gap-2 text-center">
          <div className="flex flex-col items-center p-1.5 rounded-lg bg-black/40">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#00E676]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00E676]"></span>
              <span>Green</span>
            </div>
            <span className="text-[10px] text-white/60 mt-0.5">Online Direct (WiFi)</span>
          </div>

          <div className="flex flex-col items-center p-1.5 rounded-lg bg-black/40">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#FFD600]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFD600]"></span>
              <span>Yellow</span>
            </div>
            <span className="text-[10px] text-white/60 mt-0.5">Nearby BLE (~20m)</span>
          </div>

          <div className="flex flex-col items-center p-1.5 rounded-lg bg-black/40">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#FF1744]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF1744]"></span>
              <span>Red</span>
            </div>
            <span className="text-[10px] text-white/60 mt-0.5">Out of Range (Relay)</span>
          </div>
        </div>

        {/* Green Safe Charter & Mutual Consent Badges */}
        <div className="w-full mt-3 flex items-center justify-between text-xs px-1">
          <button
            onClick={onOpenCharter}
            className="flex items-center space-x-1.5 text-emerald-400/90 hover:text-emerald-300 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold underline">Green Content Charter: Accepted</span>
          </button>
          <span className="text-white/40 text-[11px] font-mono">
            {myPhone}
          </span>
        </div>

        {/* Mutual Friends Section */}
        <div className="w-full mt-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold tracking-wider text-[#D4AF37] uppercase font-royal">
              Mutually Paired Friends ({friends.length})
            </h3>
            <button
              onClick={onOpenAddFriend}
              className="text-xs text-[#D4AF37] hover:text-[#FFF1B0] flex items-center space-x-1 font-medium"
            >
              <span>+ Add Friend</span>
            </button>
          </div>

          <div className="space-y-2">
            {friends.map((friend) => {
              const badge = getStatusBadge(friend.status);
              const BadgeIcon = badge.icon;

              return (
                <div
                  key={friend.id}
                  onClick={() => onSelectFriend(friend)}
                  className="group flex items-center justify-between p-3 rounded-xl bg-[#141414] hover:bg-[#1A1A1A] border border-[#222222] hover:border-[#D4AF37]/40 transition-all cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-11 h-11 rounded-full bg-[#1C180E] border border-[#D4AF37]/50 flex items-center justify-center text-sm font-bold text-[#F3E5AB]">
                        {friend.name.charAt(0)}
                      </div>
                      <span
                        className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#141414] ${badge.dot}`}
                      ></span>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-white text-sm group-hover:text-[#F3E5AB] transition-colors">
                          {friend.name}
                        </span>
                        {friend.consent === 'accepted' ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            Mutual Pair
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            Pending
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1.5 mt-0.5 text-xs text-white/50">
                        <BadgeIcon className="w-3 h-3 text-white/40" />
                        <span className={badge.color}>{badge.label}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {friend.unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-[#D4AF37] text-black text-[10px] font-bold">
                        {friend.unreadCount}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-[#D4AF37] transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
