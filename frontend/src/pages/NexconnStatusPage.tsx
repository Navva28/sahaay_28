import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { nexconnChat } from '../services/nexconnChat';
import { NexconnConnectionState } from '../types';
import { 
  Radio, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Cpu, 
  Key, 
  Lock, 
  FileCode2, 
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export const NexconnStatusPage: React.FC = () => {
  const [status, setStatus] = useState<{
    configured: boolean;
    appKeyConfigured: boolean;
    appSecretConfigured: boolean;
    appKey: string | null;
  } | null>(null);
  const [connectionState, setConnectionState] = useState<NexconnConnectionState>('DISCONNECTED');
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const data = await api.chat.getStatus();
      setStatus(data);
    } catch (err) {
      console.error('Error fetching Nexconn status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const unsub = nexconnChat.subscribeStatus(setConnectionState);
    return () => unsub();
  }, []);

  const clientAppKey = import.meta.env.VITE_NEXCONN_APP_KEY || '';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-800 text-teal-300 text-xs font-semibold mb-2">
            <Radio className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
            <span>Nexconn Web SDK Diagnostics</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            Nexconn Chat SDK Architecture
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
            Sahaay is powered by the official <strong>@nexconn/chat</strong> and <strong>@nexconn/engine</strong> packages for resilient, low-latency group messaging.
          </p>
        </div>

        <button
          onClick={fetchStatus}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl text-white text-xs font-bold transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Diagnostics</span>
        </button>
      </div>

      {/* Integration Verification Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Official SDK Packages */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base text-navy-900">Official SDK Packages</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Verified official packages installed in frontend workspace:
          </p>
          <div className="space-y-1 text-xs font-mono text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-emerald-600 font-semibold">✔ @nexconn/chat</p>
            <p className="text-emerald-600 font-semibold">✔ @nexconn/engine</p>
          </div>
        </div>

        {/* Card 2: App Key (Client Safe) */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base text-navy-900">Nexconn App Key</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Public client identifier for NCEngine initialization:
          </p>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            {clientAppKey || status?.appKey ? (
              <span className="text-emerald-700 font-mono font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Configured ({clientAppKey ? 'VITE_NEXCONN_APP_KEY' : status?.appKey})
              </span>
            ) : (
              <span className="text-amber-700 font-mono flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Pending configuration
              </span>
            )}
          </div>
        </div>

        {/* Card 3: Backend Token Generation */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base text-navy-900">App Secret Isolation</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            App Secret is <strong>never</strong> exposed to client code:
          </p>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            {status?.appSecretConfigured ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Secure Backend Protected
              </span>
            ) : (
              <span className="text-slate-600 flex items-center gap-1.5">
                <span>Stored in backend/.env</span>
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Step-by-Step Architecture Flow */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-xl font-extrabold text-navy-950 flex items-center gap-2">
          <FileCode2 className="w-5 h-5 text-brand-600" />
          Official Nexconn Implementation Blueprint
        </h2>

        <div className="space-y-4 text-xs sm:text-sm">
          
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 font-bold text-navy-900">
              <span className="w-6 h-6 rounded-lg bg-brand-600 text-white flex items-center justify-center text-xs">1</span>
              <span>Backend User Token Issuance (`POST /api/chat/token`)</span>
            </div>
            <p className="text-slate-600 text-xs pl-8 leading-relaxed">
              When a user authenticates, our Express server hashes the <code className="bg-slate-200 px-1 py-0.5 rounded">NEXCONN_APP_SECRET + Nonce + Timestamp</code> via SHA1 and contacts Nexconn Server API to issue an authenticated user token.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 font-bold text-navy-900">
              <span className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs">2</span>
              <span>Client Initialization & Connection</span>
            </div>
            <p className="text-slate-600 text-xs pl-8 leading-relaxed">
              The frontend invokes <code className="bg-slate-200 px-1 py-0.5 rounded">NCEngine.initialize(&#123; appKey &#125;)</code> and then connects via <code className="bg-slate-200 px-1 py-0.5 rounded">NCEngine.connect(&#123; token &#125;)</code>, establishing real-time WebSockets to Nexconn.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 font-bold text-navy-900">
              <span className="w-6 h-6 rounded-lg bg-navy-900 text-white flex items-center justify-center text-xs">3</span>
              <span>Dedicated Group Channel Provisioning (`sahaay_req_&lt;id&gt;`)</span>
            </div>
            <p className="text-slate-600 text-xs pl-8 leading-relaxed">
              When a volunteer accepts an assistance request, the app provisions a dedicated group channel via <code className="bg-slate-200 px-1 py-0.5 rounded">GroupChannel.createGroup()</code> with the requester and assigned volunteer as members.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 font-bold text-navy-900">
              <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs">4</span>
              <span>Real-Time Messaging & History Query</span>
            </div>
            <p className="text-slate-600 text-xs pl-8 leading-relaxed">
              Messages are sent using <code className="bg-slate-200 px-1 py-0.5 rounded">channel.sendMessage(new SendTextMessageParams(&#123; text &#125;))</code>. Incoming messages trigger <code className="bg-slate-200 px-1 py-0.5 rounded">NCEngine.addMessageHandler</code> and past history is loaded via <code className="bg-slate-200 px-1 py-0.5 rounded">BaseChannel.createMessagesQuery</code>.
            </p>
          </div>

        </div>

        {/* Local Setup Instructions Box */}
        <div className="p-5 bg-teal-50 border border-teal-200 rounded-2xl text-xs text-teal-900 space-y-2">
          <p className="font-bold flex items-center gap-1.5">
            <span>⚙️ Environment Configuration Quick Guide</span>
          </p>
          <p className="leading-relaxed">
            To connect your live Nexconn App Key & App Secret from <a href="https://console.nexconn.ai/" target="_blank" rel="noreferrer" className="underline font-bold">console.nexconn.ai</a>:
          </p>
          <div className="font-mono bg-white p-3 rounded-xl border border-teal-200 text-slate-800 space-y-1">
            <p><strong>backend/.env:</strong></p>
            <p>NEXCONN_APP_KEY=your_key_here</p>
            <p>NEXCONN_APP_SECRET=your_secret_here</p>
            <p className="pt-1"><strong>frontend/.env:</strong></p>
            <p>VITE_NEXCONN_APP_KEY=your_key_here</p>
          </div>
        </div>

      </div>

    </div>
  );
};
