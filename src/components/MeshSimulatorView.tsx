import React, { useState } from 'react';
import { 
  Cpu, 
  ArrowRight, 
  RefreshCw, 
  ShieldCheck, 
  Lock, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Radio,
  Share2
} from 'lucide-react';
import { CrownLogo } from './CrownLogo';

interface PacketTrace {
  step: number;
  title: string;
  desc: string;
  activeNode: 'A' | 'B' | 'C' | 'ALL';
  packetData?: any;
}

export const MeshSimulatorView: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  // Simulator State
  const [distanceBFromA, setDistanceBFromA] = useState<'green' | 'yellow' | 'red'>('yellow');
  const [distanceCFromB, setDistanceCFromB] = useState<'yellow' | 'green' | 'red'>('red');
  const [relayBufferB, setRelayBufferB] = useState<any[]>([]);
  const [deliveredMessagesC, setDeliveredMessagesC] = useState<any[]>([]);
  const [simulationLog, setSimulationLog] = useState<PacketTrace[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [testMessage, setTestMessage] = useState('Peace and blessings! Family-safe check in.');

  const runRelaySimulation = async () => {
    setIsSimulating(true);
    setSimulationLog([]);

    const newPacket = {
      packetId: 'pkt-' + Math.random().toString(36).substring(2, 8),
      sender: '+966-50-SALMAN (Node A)',
      recipient: '+966-50-ZAID (Node C)',
      ttl: 5,
      hops: ['Node A (You)'],
      payloadCipher: 'AES256:iv941:U2FsbWFuIFNlY3JldCBDaGF0IE1lc2g=',
      plainText: testMessage,
    };

    // Step 1: A checks direct connection to C
    const step1: PacketTrace = {
      step: 1,
      title: 'Node A Checks Routing to Node C',
      desc: 'Node C is RED (Out of direct physical range > 100m). Direct transmission impossible.',
      activeNode: 'A',
      packetData: { target: 'Node C', status: 'RED (Out of range)' },
    };
    setSimulationLog([step1]);
    await new Promise((r) => setTimeout(r, 1200));

    // Step 2: A discovers B nearby
    const step2: PacketTrace = {
      step: 2,
      title: 'Node A Detects Intermediate Relay (Node B)',
      desc: `Node B (Karim) is in ${distanceBFromA.toUpperCase()} range (BLE/WiFi Cluster). Packaging packet for Store-and-Forward relay.`,
      activeNode: 'A',
      packetData: newPacket,
    };
    setSimulationLog((prev) => [...prev, step2]);
    await new Promise((r) => setTimeout(r, 1200));

    // Step 3: Transmission to B
    newPacket.hops.push('Node B (Relay)');
    newPacket.ttl = 4;
    setRelayBufferB((prev) => [...prev, newPacket]);

    const step3: PacketTrace = {
      step: 3,
      title: 'Node B Receives & Buffers Encrypted Packet',
      desc: 'Node B is NOT the target recipient. Node B CANNOT decrypt payload (AES-256 E2E). Node B stores packet in local Hive buffer.',
      activeNode: 'B',
      packetData: {
        bufferState: 'Saved to Hive Box [mesh_relay_buffer]',
        packetId: newPacket.packetId,
        ttlRemaining: 4,
        ciphertext: newPacket.payloadCipher,
      },
    };
    setSimulationLog((prev) => [...prev, step3]);
    await new Promise((r) => setTimeout(r, 1400));

    // Step 4: Check if B can reach C
    if (distanceCFromB === 'red') {
      const step4: PacketTrace = {
        step: 4,
        title: 'Node B Awaiting Proximity to Node C',
        desc: 'Node C is still RED relative to Node B. Packet stays in Node B local storage until Node B moves closer to Node C (Store-and-Forward waiting state).',
        activeNode: 'B',
      };
      setSimulationLog((prev) => [...prev, step4]);
      setIsSimulating(false);
      return;
    }

    // Step 5: B delivers to C
    await new Promise((r) => setTimeout(r, 1200));
    newPacket.hops.push('Node C (Destination)');
    newPacket.ttl = 3;

    setRelayBufferB((prev) => prev.filter((p) => p.packetId !== newPacket.packetId));
    setDeliveredMessagesC((prev) => [...prev, newPacket]);

    const step5: PacketTrace = {
      step: 5,
      title: 'Node B Discovers Node C & Flushes Relay Buffer',
      desc: 'Node B moves into range of Node C. Packet forwarded over WiFi Direct P2P_CLUSTER link!',
      activeNode: 'C',
      packetData: {
        delivery: 'Success',
        hopsTraversed: newPacket.hops.join(' ➔ '),
      },
    };
    setSimulationLog((prev) => [...prev, step5]);
    await new Promise((r) => setTimeout(r, 1000));

    // Step 6: C decrypts & verifies Green Charter
    const step6: PacketTrace = {
      step: 6,
      title: 'Node C Decrypts & Verifies Green Safe Charter',
      desc: `Node C derives pairwise AES-256 key with Node A. Payload decrypted: "${testMessage}". Green filter passed!`,
      activeNode: 'C',
      packetData: {
        decrypted: testMessage,
        greenValidation: '100% Passed (Family-Safe)',
      },
    };
    setSimulationLog((prev) => [...prev, step6]);
    setIsSimulating(false);
  };

  const getStatusBadge = (status: 'green' | 'yellow' | 'red') => {
    switch (status) {
      case 'green':
        return { label: 'Green (WiFi Direct)', color: 'text-[#00E676] bg-[#00E676]/10 border-[#00E676]/30', dot: 'bg-[#00E676]' };
      case 'yellow':
        return { label: 'Yellow (Nearby BLE)', color: 'text-[#FFD600] bg-[#FFD600]/10 border-[#FFD600]/30', dot: 'bg-[#FFD600]' };
      case 'red':
        return { label: 'Red (Out of Range)', color: 'text-[#FF1744] bg-[#FF1744]/10 border-[#FF1744]/30', dot: 'bg-[#FF1744]' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0D0D0D] text-[#E5E5E5] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#121212] border-b border-[#2A2412]">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-[#1C180E] border border-[#D4AF37]">
            <Cpu className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <h2 className="text-base font-black text-white font-royal tracking-wider flex items-center space-x-2">
              <span>STORE-AND-FORWARD MULTI-HOP TESTBED</span>
              <span className="text-xs text-[#D4AF37]">A ➔ B ➔ C</span>
            </h2>
            <p className="text-xs text-white/50">
              Simulating nearby_connections P2P_CLUSTER & Hive relay queue
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded-lg bg-[#181818] border border-[#333333] hover:text-white text-xs font-semibold"
        >
          Close Simulator ✕
        </button>
      </div>

      <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
        {/* Topology Visualizer */}
        <div className="p-6 rounded-2xl bg-[#121212] border-2 border-[#D4AF37]/40 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
              Mesh Network Nodes Physical Topology
            </h3>
            <span className="text-[11px] text-white/40">
              Interactive 3-Node P2P Cluster
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
            {/* NODE A (You) */}
            <div className="p-4 rounded-xl bg-[#161616] border border-[#D4AF37] relative flex flex-col items-center text-center">
              <span className="text-2xl mb-1">👑</span>
              <h4 className="text-sm font-bold text-[#F3E5AB]">Node A (You)</h4>
              <p className="text-xs text-white/50 font-mono">+966 50 SALMAN</p>
              <div className="mt-2 text-[10px] px-2 py-0.5 rounded bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 font-semibold">
                Origin Sender
              </div>
            </div>

            {/* NODE B (Relay) */}
            <div className="p-4 rounded-xl bg-[#161616] border border-[#333333] relative flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-full bg-[#241E0F] border border-[#D4AF37] flex items-center justify-center text-xs font-bold text-[#D4AF37] mb-1">
                B
              </div>
              <h4 className="text-sm font-bold text-white">Node B (Karim)</h4>
              <p className="text-xs text-white/50 font-mono">+966 50 KARIM</p>
              <div className="mt-2 text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold flex items-center space-x-1">
                <Database className="w-3 h-3" />
                <span>Hive Relay Custodian</span>
              </div>
              <div className="mt-2 text-[11px] text-white/70">
                Buffer: <strong>{relayBufferB.length} packet(s)</strong>
              </div>
            </div>

            {/* NODE C (Destination) */}
            <div className="p-4 rounded-xl bg-[#161616] border border-[#333333] relative flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-full bg-[#181818] border border-white/20 flex items-center justify-center text-xs font-bold text-white mb-1">
                C
              </div>
              <h4 className="text-sm font-bold text-white">Node C (Zaid)</h4>
              <p className="text-xs text-white/50 font-mono">+966 50 ZAID</p>
              <div className="mt-2 text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30 font-semibold">
                Out of Range of Node A
              </div>
              <div className="mt-2 text-[11px] text-white/70">
                Received: <strong>{deliveredMessagesC.length} message(s)</strong>
              </div>
            </div>
          </div>

          {/* Interactive Proximity Controls */}
          <div className="mt-6 p-4 rounded-xl bg-[#181818] border border-[#282828] grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#D4AF37] block mb-2">
                Distance between Node A ➔ Node B:
              </label>
              <div className="flex space-x-2">
                {(['green', 'yellow', 'red'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setDistanceBFromA(lvl)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                      distanceBFromA === lvl
                        ? getStatusBadge(lvl).color
                        : 'bg-black/30 border-white/10 text-white/50'
                    }`}
                  >
                    {lvl.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#D4AF37] block mb-2">
                Distance between Node B ➔ Node C:
              </label>
              <div className="flex space-x-2">
                {(['green', 'yellow', 'red'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setDistanceCFromB(lvl)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                      distanceCFromB === lvl
                        ? getStatusBadge(lvl).color
                        : 'bg-black/30 border-white/10 text-white/50'
                    }`}
                  >
                    {lvl.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Test Dispatch Button */}
          <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Test packet content..."
              className="flex-1 bg-[#1A1A1A] border border-[#333333] focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
            />
            <button
              onClick={runRelaySimulation}
              disabled={isSimulating}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#D4AF37] text-black font-extrabold text-xs tracking-wider uppercase disabled:opacity-40 hover:bg-[#FFF1B0] transition-colors flex items-center justify-center space-x-2 shrink-0"
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Transmitting Hops...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send A ➔ B ➔ C Relay Packet</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Packet Trace & Store-and-Forward Inspection */}
        <div className="p-6 rounded-2xl bg-[#121212] border border-[#2A2412] space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] flex items-center space-x-2">
            <Share2 className="w-4 h-4" />
            <span>Multi-Hop Protocol Execution Log (Live Packet Inspection)</span>
          </h3>

          {simulationLog.length === 0 ? (
            <p className="text-xs text-white/40 italic">
              Press "Send A ➔ B ➔ C Relay Packet" above to watch the packet hop across intermediate nodes!
            </p>
          ) : (
            <div className="space-y-3">
              {simulationLog.map((log) => (
                <div
                  key={log.step}
                  className="p-3.5 rounded-xl bg-[#161616] border border-[#282828] animate-in fade-in slide-in-from-left-2"
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-black text-xs font-black flex items-center justify-center">
                      {log.step}
                    </span>
                    <h5 className="text-xs font-bold text-white">{log.title}</h5>
                  </div>
                  <p className="text-xs text-white/70 mt-1 pl-7">{log.desc}</p>
                  {log.packetData && (
                    <pre className="mt-2 ml-7 p-2.5 rounded-lg bg-black/60 border border-white/5 font-mono text-[10px] text-[#F3E5AB] overflow-x-auto">
                      {JSON.stringify(log.packetData, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
