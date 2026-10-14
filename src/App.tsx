import React, { useState, useEffect } from 'react';
import { Friend, Message, MediaType, ProximityStatus, ConsentStatus } from './types';
import { RadarScreen } from './components/RadarScreen';
import { ChatModal } from './components/ChatModal';
import { GreenCharterModal } from './components/GreenCharterModal';
import { AuthModal } from './components/AuthModal';
import { FriendsModal } from './components/FriendsModal';
import { MeshSimulatorView } from './components/MeshSimulatorView';
import { FlutterExplorerModal } from './components/FlutterExplorerModal';

// Initial preloaded friends representing the 3 status levels and mutual consent:
// Green = Online Direct, Yellow = Nearby BLE, Red = Out of range
const INITIAL_FRIENDS: Friend[] = [
  {
    id: 'friend-1',
    phone: '+966 50 111 2233',
    name: 'Fatima Al-Sayed',
    status: 'online', // Green
    consent: 'accepted',
    distanceMeters: 6,
    unreadCount: 0,
    lastSeen: 'Now',
    avatarSeed: 'fatima',
  },
  {
    id: 'friend-2',
    phone: '+966 50 222 3344',
    name: 'Karim (Relay Node)',
    status: 'nearby', // Yellow
    consent: 'accepted',
    distanceMeters: 22,
    unreadCount: 0,
    lastSeen: '2m ago',
    avatarSeed: 'karim',
  },
  {
    id: 'friend-3',
    phone: '+966 50 333 4455',
    name: 'Zaid (Out of Range)',
    status: 'out_of_range', // Red (Triggers Store-and-Forward relay A->B->C)
    consent: 'accepted',
    distanceMeters: 180,
    unreadCount: 0,
    lastSeen: 'Offline (>100m)',
    avatarSeed: 'zaid',
  },
  {
    id: 'friend-4',
    phone: '+966 50 444 5566',
    name: 'Omar Mansour',
    status: 'nearby',
    consent: 'pending_incoming', // Requires mutual consent
    distanceMeters: 18,
    unreadCount: 1,
    lastSeen: '5m ago',
    avatarSeed: 'omar',
  },
];

const INITIAL_MESSAGES: Record<string, Message[]> = {
  'friend-1': [
    {
      id: 'm1',
      senderPhone: '+966 50 111 2233',
      recipientPhone: '+966 50 823 4567',
      content: 'Salam Salman! WiFi Direct direct connection is fast and crystal clear.',
      type: 'text',
      timestamp: Date.now() - 1000 * 60 * 12,
      isOutgoing: false,
      status: 'delivered',
      relayPath: 'Direct WiFi Direct',
      safetyPassed: true,
    },
    {
      id: 'm2',
      senderPhone: '+966 50 823 4567',
      recipientPhone: '+966 50 111 2233',
      content: 'Wa alaykum assalam! Completely offline with zero internet.',
      type: 'text',
      timestamp: Date.now() - 1000 * 60 * 8,
      isOutgoing: true,
      status: 'delivered',
      relayPath: 'Direct WiFi Direct',
      safetyPassed: true,
    },
  ],
  'friend-2': [
    {
      id: 'm3',
      senderPhone: '+966 50 222 3344',
      recipientPhone: '+966 50 823 4567',
      content: 'I am nearby via Bluetooth Low Energy (~20m). Ready to act as Store-and-Forward relay custodian for Zaid!',
      type: 'text',
      timestamp: Date.now() - 1000 * 60 * 15,
      isOutgoing: false,
      status: 'delivered',
      relayPath: 'BLE Proximity Hop',
      safetyPassed: true,
    },
  ],
  'friend-3': [
    {
      id: 'm4',
      senderPhone: '+966 50 823 4567',
      recipientPhone: '+966 50 333 4455',
      content: 'Hello Zaid! Sending this through the mesh relay (A -> Karim -> Zaid).',
      type: 'text',
      timestamp: Date.now() - 1000 * 60 * 30,
      isOutgoing: true,
      status: 'relayed',
      relayPath: 'You ➔ Karim ➔ Zaid',
      safetyPassed: true,
    },
  ],
};

export default function App() {
  // Persistence state
  const [isRegistered, setIsRegistered] = useState<boolean>(() => {
    return localStorage.getItem('bensalman_registered') === 'true';
  });

  const [isCharterAccepted, setIsCharterAccepted] = useState<boolean>(() => {
    return localStorage.getItem('bensalman_charter') === 'true';
  });

  const [myPhone, setMyPhone] = useState<string>(() => {
    return localStorage.getItem('bensalman_phone') || '+966 50 823 4567';
  });

  const [myName, setMyName] = useState<string>(() => {
    return localStorage.getItem('bensalman_name') || 'Salman Bah';
  });

  const [friends, setFriends] = useState<Friend[]>(() => {
    const saved = localStorage.getItem('bensalman_friends');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) {}
    }
    return INITIAL_FRIENDS;
  });

  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem('bensalman_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) {}
    }
    return INITIAL_MESSAGES;
  });

  // Relay Buffer (Store-and-Forward packets waiting for hops)
  const [relayQueue, setRelayQueue] = useState<any[]>([
    {
      packetId: 'pkt-relay-01',
      sender: '+966 50 823 4567',
      target: '+966 50 333 4455',
      ttl: 4,
      hops: ['Node A (You)'],
    },
  ]);

  // Modal Views
  const [activeChatFriend, setActiveChatFriend] = useState<Friend | null>(null);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [showCharterModal, setShowCharterModal] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [showFlutterCode, setShowFlutterCode] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('bensalman_registered', String(isRegistered));
    localStorage.setItem('bensalman_charter', String(isCharterAccepted));
    localStorage.setItem('bensalman_phone', myPhone);
    localStorage.setItem('bensalman_name', myName);
    localStorage.setItem('bensalman_friends', JSON.stringify(friends));
    localStorage.setItem('bensalman_messages', JSON.stringify(messages));
  }, [isRegistered, isCharterAccepted, myPhone, myName, friends, messages]);

  // Handlers
  const handleRegisterSuccess = (phone: string, name: string) => {
    setMyPhone(phone);
    setMyName(name);
    setIsRegistered(true);
    // Proceed to Green Charter
  };

  const handleCharterAccept = () => {
    setIsCharterAccepted(true);
    setShowCharterModal(false);
  };

  const handleSendMessage = (
    friendId: string,
    content: string,
    type: MediaType,
    audioDuration?: number
  ) => {
    const friend = friends.find((f) => f.id === friendId);
    if (!friend) return;

    const isDirect = friend.status === 'online';
    const isNearby = friend.status === 'nearby';

    let relayPath = 'Direct WiFi Direct';
    let deliveryStatus: Message['status'] = 'delivered';

    if (friend.status === 'out_of_range') {
      relayPath = 'Mesh Relay: You ➔ Karim ➔ ' + friend.name;
      deliveryStatus = 'pending_relay';

      // Push to Store-and-Forward queue
      setRelayQueue((prev) => [
        ...prev,
        {
          packetId: 'pkt-' + Date.now(),
          sender: myPhone,
          target: friend.phone,
          ttl: 4,
          hops: ['You'],
        },
      ]);
    } else if (isNearby) {
      relayPath = 'Direct BLE Proximity';
      deliveryStatus = 'delivered';
    }

    const newMsg: Message = {
      id: 'msg-' + Date.now(),
      senderPhone: myPhone,
      recipientPhone: friend.phone,
      content,
      type,
      timestamp: Date.now(),
      isOutgoing: true,
      status: deliveryStatus,
      audioDurationSec: audioDuration,
      relayPath,
      safetyPassed: true,
    };

    setMessages((prev) => ({
      ...prev,
      [friendId]: [...(prev[friendId] || []), newMsg],
    }));
  };

  const handleInviteFriend = (phone: string, name: string) => {
    const newFriend: Friend = {
      id: 'friend-' + Date.now(),
      phone,
      name,
      status: 'nearby',
      consent: 'pending_outgoing',
      distanceMeters: 25,
      unreadCount: 0,
      lastSeen: 'Just now',
      avatarSeed: name.toLowerCase(),
    };
    setFriends((prev) => [newFriend, ...prev]);
  };

  const handleAcceptInvite = (friendId: string) => {
    setFriends((prev) =>
      prev.map((f) =>
        f.id === friendId ? { ...f, consent: 'accepted', unreadCount: 0 } : f
      )
    );
  };

  const handleDeclineInvite = (friendId: string) => {
    setFriends((prev) => prev.filter((f) => f.id !== friendId));
  };

  return (
    <div className="h-screen w-screen bg-[#0D0D0D] text-[#E5E5E5] flex flex-col font-sans select-none overflow-hidden">
      {/* 1. Initial One-Time Firebase Phone Auth Step */}
      {!isRegistered && <AuthModal onSuccess={handleRegisterSuccess} />}

      {/* 2. Mandatory Green Content Charter Step */}
      {isRegistered && !isCharterAccepted && (
        <GreenCharterModal onAccept={handleCharterAccept} />
      )}

      {/* 3. Main Offline Radar Mesh Home Screen */}
      <RadarScreen
        friends={friends}
        onSelectFriend={(friend) => setActiveChatFriend(friend)}
        onOpenAddFriend={() => setShowFriendsModal(true)}
        onOpenCharter={() => setShowCharterModal(true)}
        onOpenSimulator={() => setShowSimulator(true)}
        onOpenFlutterCode={() => setShowFlutterCode(true)}
        relayQueueCount={relayQueue.length}
        myPhone={myPhone}
        myName={myName}
      />

      {/* Modal: Chat Screen */}
      {activeChatFriend && (
        <ChatModal
          friend={activeChatFriend}
          messages={messages[activeChatFriend.id] || []}
          onSendMessage={(content, type, duration) =>
            handleSendMessage(activeChatFriend.id, content, type, duration)
          }
          onClose={() => setActiveChatFriend(null)}
          onOpenSimulator={() => {
            setActiveChatFriend(null);
            setShowSimulator(true);
          }}
        />
      )}

      {/* Modal: Mutual Consent Friends Management */}
      {showFriendsModal && (
        <FriendsModal
          friends={friends}
          onInviteFriend={handleInviteFriend}
          onAcceptInvite={handleAcceptInvite}
          onDeclineInvite={handleDeclineInvite}
          onClose={() => setShowFriendsModal(false)}
        />
      )}

      {/* Modal: Re-view Green Content Charter */}
      {showCharterModal && (
        <GreenCharterModal
          onAccept={() => setShowCharterModal(false)}
          onClose={() => setShowCharterModal(false)}
          canDismiss={true}
        />
      )}

      {/* Modal: Store-and-Forward Multi-Hop Mesh Simulator (A -> B -> C) */}
      {showSimulator && (
        <MeshSimulatorView onClose={() => setShowSimulator(false)} />
      )}

      {/* Modal: Complete Flutter Project Code Explorer & APK Ready Bundle */}
      {showFlutterCode && (
        <FlutterExplorerModal onClose={() => setShowFlutterCode(false)} />
      )}
    </div>
  );
}
