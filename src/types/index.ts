export type ProximityStatus = 'online' | 'nearby' | 'out_of_range'; // Green, Yellow, Red

export type ConsentStatus = 'pending_incoming' | 'pending_outgoing' | 'accepted' | 'declined';

export type MediaType = 'text' | 'voice' | 'photo';

export interface Friend {
  id: string;
  phone: string;
  name: string;
  status: ProximityStatus;
  consent: ConsentStatus;
  distanceMeters: number; // For simulator
  rssi?: number;
  unreadCount: number;
  lastSeen: string;
  avatarSeed: string;
}

export interface Message {
  id: string;
  senderPhone: string;
  recipientPhone: string;
  content: string; // Text or data URL for voice/photo
  type: MediaType;
  timestamp: number;
  isOutgoing: boolean;
  status: 'pending_relay' | 'relayed' | 'delivered';
  audioDurationSec?: number;
  relayPath?: string;
  safetyPassed: boolean;
}

export interface MeshPacket {
  packetId: string;
  senderPhone: string;
  targetPhone: string;
  type: MediaType | 'ack' | 'handshake' | 'friend_req';
  encryptedCipher: string;
  ttl: number;
  hops: string[];
  timestamp: number;
  meta?: {
    audioDuration?: number;
    fileName?: string;
  };
}

export interface SimulationNode {
  id: 'nodeA' | 'nodeB' | 'nodeC';
  phone: string;
  name: string;
  role: 'sender' | 'relay' | 'destination';
  status: ProximityStatus;
  x: number; // Canvas coordinate %
  y: number;
  buffer: MeshPacket[];
  delivered: Message[];
}
