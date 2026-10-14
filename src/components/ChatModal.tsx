import React, { useState, useRef, useEffect } from 'react';
import { Friend, Message, MediaType } from '../types';
import { validateGreenContent } from '../utils/greenFilter';
import { 
  ArrowLeft, 
  Send, 
  Mic, 
  Square, 
  Image as ImageIcon, 
  ShieldCheck, 
  AlertTriangle, 
  Play, 
  Pause, 
  CheckCheck, 
  Clock, 
  Radio, 
  Share2,
  Lock
} from 'lucide-react';

interface ChatModalProps {
  friend: Friend;
  messages: Message[];
  onSendMessage: (content: string, type: MediaType, audioDuration?: number) => void;
  onClose: () => void;
  onOpenSimulator: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  friend,
  messages,
  onSendMessage,
  onClose,
  onOpenSimulator,
}) => {
  const [inputText, setInputText] = useState('');
  const [safetyWarning, setSafetyWarning] = useState<string | null>(null);

  // Voice note recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  // Audio playback state
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Photo upload ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clean up recording timer on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  const getStatusColor = () => {
    switch (friend.status) {
      case 'online':
        return { dot: 'bg-[#00E676]', text: 'text-[#00E676]', label: 'Online Direct (WiFi)' };
      case 'nearby':
        return { dot: 'bg-[#FFD600]', text: 'text-[#FFD600]', label: 'Nearby BLE (~20m)' };
      case 'out_of_range':
        return { dot: 'bg-[#FF1744]', text: 'text-[#FF1744]', label: 'Out of Range (Relayed A->B->C)' };
    }
  };

  const handleSendText = () => {
    if (!inputText.trim()) return;

    // Strict Green Content Charter validation
    const validation = validateGreenContent(inputText);
    if (!validation.isValid) {
      setSafetyWarning(validation.violationReason || 'Non-green content detected.');
      return;
    }

    setSafetyWarning(null);
    onSendMessage(inputText.trim(), 'text');
    setInputText('');
  };

  // Browser Microphone Recording
  const startRecording = async () => {
    try {
      setSafetyWarning(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          onSendMessage(base64Audio, 'voice', Math.max(1, recordingDuration));
        };
        // Stop audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      recordingTimerRef.current = window.setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone permission not granted, using simulated audio note', err);
      // Fallback simulated voice note if mic permission denied in iframe
      setIsRecording(true);
      setRecordingDuration(1);
      setTimeout(() => {
        setIsRecording(false);
        onSendMessage('simulated_audio_note_pcm_bytes', 'voice', 4);
      }, 2500);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecording(false);
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    audioChunksRef.current = [];
    setIsRecording(false);
    setRecordingDuration(0);
  };

  // Play / Pause voice note
  const handlePlayVoice = (msgId: string, audioDataUrl: string) => {
    if (playingMessageId === msgId) {
      audioPlayerRef.current?.pause();
      setPlayingMessageId(null);
      return;
    }

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }

    if (audioDataUrl.startsWith('data:audio')) {
      const audio = new Audio(audioDataUrl);
      audioPlayerRef.current = audio;
      setPlayingMessageId(msgId);
      audio.play();
      audio.onended = () => setPlayingMessageId(null);
    } else {
      // Simulated tone playback
      setPlayingMessageId(msgId);
      setTimeout(() => setPlayingMessageId(null), 3500);
    }
  };

  // Handle Photo attachment
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      onSendMessage(base64, 'photo');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const status = getStatusColor();

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0D0D0D] text-[#E5E5E5]">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#121212] border-b border-[#2A2412]">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-[#1C180E] border border-[#D4AF37] flex items-center justify-center font-bold text-[#F3E5AB]">
              {friend.name.charAt(0)}
            </div>
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#121212] ${status.dot}`}
            ></span>
          </div>

          <div>
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>{friend.name}</span>
              <span className="text-[10px] text-emerald-400 border border-emerald-500/30 px-1 py-0.2 rounded bg-emerald-500/10">
                Paired 🤝
              </span>
            </h2>
            <div className="flex items-center space-x-1.5 text-xs">
              <span className={`font-medium ${status.text}`}>{status.label}</span>
              {friend.status === 'out_of_range' && (
                <button
                  onClick={onOpenSimulator}
                  className="text-[10px] text-[#D4AF37] underline font-medium hover:text-[#FFF1B0]"
                >
                  (Relay A➔B➔C active)
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Security / Green badge */}
        <div className="flex items-center space-x-2">
          <div className="hidden sm:flex items-center space-x-1 px-2 py-1 rounded bg-[#161B14] border border-emerald-500/30 text-emerald-400 text-[11px] font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Green Safe</span>
          </div>
          <div className="flex items-center space-x-1 px-2 py-1 rounded bg-[#1C180E] border border-[#D4AF37]/30 text-[#D4AF37] text-[11px] font-medium">
            <Lock className="w-3.5 h-3.5" />
            <span>AES-256 E2E</span>
          </div>
        </div>
      </div>

      {/* Encryption & Mesh Relay Status Ribbon */}
      <div className="px-4 py-1.5 bg-[#141414] border-b border-[#222222] text-[11px] text-white/60 flex items-center justify-between">
        <div className="flex items-center space-x-1.5 truncate">
          <Lock className="w-3 h-3 text-[#D4AF37] shrink-0" />
          <span className="truncate">
            Zero Internet • Zero SIM • End-to-End Encrypted via P2P Mesh Cluster
          </span>
        </div>
        {friend.status === 'out_of_range' && (
          <span className="text-[#FFD600] text-[10px] shrink-0 font-semibold flex items-center space-x-1">
            <Share2 className="w-3 h-3" />
            <span>Store-and-Forward Active</span>
          </span>
        )}
      </div>

      {/* Safety Alert Banner */}
      {safetyWarning && (
        <div className="p-3 bg-red-950/80 border-b border-red-500/50 text-red-200 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{safetyWarning}</span>
          </div>
          <button
            onClick={() => setSafetyWarning(null)}
            className="text-red-400 hover:text-white font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-white/40">
            <div className="w-16 h-16 rounded-full bg-[#181818] border border-[#2A2412] flex items-center justify-center mb-3">
              <Radio className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">
              Offline Mesh Chat with {friend.name}
            </h3>
            <p className="text-xs max-w-sm mb-3">
              Messages are transferred directly over Bluetooth & WiFi Direct. If {friend.name} is out of range, intermediate friends will relay packets securely!
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Green Content Charter strictly enforced</span>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.isOutgoing;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[70%] p-3 rounded-2xl ${
                    isMe
                      ? 'bg-[#241E0F] border border-[#D4AF37]/40 text-[#F5F5F5] rounded-tr-none'
                      : 'bg-[#181818] border border-[#282828] text-[#EEEEEE] rounded-tl-none'
                  }`}
                >
                  {/* TEXT MESSAGE */}
                  {msg.type === 'text' && (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                  )}

                  {/* VOICE NOTE */}
                  {msg.type === 'voice' && (
                    <div className="flex items-center space-x-3 py-1">
                      <button
                        onClick={() => handlePlayVoice(msg.id, msg.content)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                          playingMessageId === msg.id
                            ? 'bg-[#00E676] text-black shadow-lg shadow-emerald-500/20'
                            : 'bg-[#D4AF37] text-black hover:bg-[#FFF1B0]'
                        }`}
                      >
                        {playingMessageId === msg.id ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4 ml-0.5" />
                        )}
                      </button>

                      <div className="flex-1">
                        <div className="flex items-center space-x-1 h-5">
                          {/* Simulated audio waveform bars */}
                          {[40, 70, 95, 60, 85, 45, 90, 75, 50, 80, 65, 40].map((h, i) => (
                            <span
                              key={i}
                              className={`w-1 rounded-full transition-all duration-200 ${
                                playingMessageId === msg.id
                                  ? 'bg-[#00E676] animate-pulse'
                                  : 'bg-[#D4AF37]/60'
                              }`}
                              style={{ height: `${h}%` }}
                            ></span>
                          ))}
                        </div>
                        <div className="flex justify-between text-[10px] text-white/50 mt-1">
                          <span>Offline Voice Note</span>
                          <span>00:{String(msg.audioDurationSec || 4).padStart(2, '0')}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PHOTO */}
                  {msg.type === 'photo' && (
                    <div className="space-y-1.5">
                      <div className="rounded-lg overflow-hidden border border-black/40 max-h-60 bg-black flex items-center justify-center">
                        <img
                          src={msg.content}
                          alt="Offline Mesh Photo"
                          className="max-h-60 object-contain w-full"
                        />
                      </div>
                      <span className="text-[10px] text-white/60 block">
                        Offline Compressed Photo (Transferred via WiFi Direct / BLE chunking)
                      </span>
                    </div>
                  )}

                  {/* Footer metadata: Timestamp, Relay Path, Status */}
                  <div className="flex items-center justify-end space-x-1.5 mt-1.5 pt-1 border-t border-white/5 text-[10px] text-white/40">
                    {msg.relayPath && (
                      <span className="flex items-center space-x-1 text-[#D4AF37]/80 mr-1 font-mono">
                        <Share2 className="w-2.5 h-2.5" />
                        <span>{msg.relayPath}</span>
                      </span>
                    )}

                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    {isMe && (
                      <span>
                        {msg.status === 'delivered' ? (
                          <CheckCheck className="w-3.5 h-3.5 text-[#00E676]" />
                        ) : msg.status === 'relayed' ? (
                          <CheckCheck className="w-3.5 h-3.5 text-[#FFD600]" />
                        ) : (
                          <Clock className="w-3 h-3 text-[#FF1744]" />
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status caption for relay visibility */}
                {isMe && msg.status === 'pending_relay' && (
                  <span className="text-[10px] text-[#FF1744] mt-0.5 mr-1 font-medium">
                    Buffered in Hive • Waiting for intermediate relay node
                  </span>
                )}
                {isMe && msg.status === 'relayed' && (
                  <span className="text-[10px] text-[#FFD600] mt-0.5 mr-1 font-medium">
                    Forwarded via Mesh Relay
                  </span>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Recording Drawer if active */}
      {isRecording && (
        <div className="px-4 py-3 bg-[#1C160E] border-t border-[#D4AF37]/50 flex items-center justify-between text-xs animate-in slide-in-from-bottom">
          <div className="flex items-center space-x-3">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
            <span className="font-bold text-white">
              Recording Voice Note: 00:{String(recordingDuration).padStart(2, '0')}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={cancelRecording}
              className="px-3 py-1 rounded bg-black/50 text-white/70 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={stopRecording}
              className="flex items-center space-x-1.5 px-3 py-1 rounded bg-[#D4AF37] text-black font-bold hover:bg-[#FFF1B0]"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Send Voice</span>
            </button>
          </div>
        </div>
      )}

      {/* Input Bar */}
      <div className="p-3 bg-[#121212] border-t border-[#2A2412] flex items-center space-x-2">
        {/* Hidden file input */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handlePhotoSelect}
        />

        {/* Photo Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Send Offline Photo (Encrypted Mesh)"
          className="p-2.5 rounded-xl bg-[#1A1A1A] border border-[#2A2412] text-[#D4AF37] hover:border-[#D4AF37]/60 hover:bg-[#201C12] transition-all"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        {/* Mic / Voice Note Button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          title="Record Offline Voice Note"
          className={`p-2.5 rounded-xl border transition-all ${
            isRecording
              ? 'bg-red-500 text-white border-red-400 animate-pulse'
              : 'bg-[#1A1A1A] border-[#2A2412] text-[#D4AF37] hover:border-[#D4AF37]/60 hover:bg-[#201C12]'
          }`}
        >
          <Mic className="w-4 h-4" />
        </button>

        {/* Text Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
            placeholder="Type Green / family-safe offline message..."
            className="w-full bg-[#181818] border border-[#282828] focus:border-[#D4AF37] rounded-xl px-3.5 py-2 text-sm text-white placeholder-white/30 focus:outline-none transition-colors"
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSendText}
          disabled={!inputText.trim()}
          className="p-2.5 rounded-xl bg-[#D4AF37] text-black font-bold disabled:opacity-40 disabled:pointer-events-none hover:bg-[#FFF1B0] transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
