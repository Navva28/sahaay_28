import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { nexconnChat } from '../services/nexconnChat';
import { api } from '../services/api';
import { AssistanceRequest, ChatMessage, NexconnConnectionState } from '../types';
import { StatusBadge } from './StatusBadge';
import { 
  Send, 
  Mic, 
  MicOff, 
  Radio, 
  CheckCircle2, 
  PlayCircle, 
  AlertCircle, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface ChatWindowProps {
  request: AssistanceRequest;
  onRequestUpdated?: (updated: AssistanceRequest) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ request, onRequestUpdated }) => {
  const { currentUser } = useAuth();
  const { isSpeechSupported, listenToSpeech } = useAccessibility();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [connectionState, setConnectionState] = useState<NexconnConnectionState>('DISCONNECTED');
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [channelId, setChannelId] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const stopVoiceRef = useRef<(() => void) | null>(null);

  const isRequester = currentUser?.id === request.requester_id;
  const isVolunteer = currentUser?.id === request.accepted_volunteer_id;
  const counterpartUser = isRequester ? request.volunteer : request.requester;

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Subscribe to Nexconn connection state
  useEffect(() => {
    const unsubscribe = nexconnChat.subscribeStatus((state) => {
      setConnectionState(state);
    });
    return () => unsubscribe();
  }, []);

  // Initialize and connect to Nexconn Chat SDK
  useEffect(() => {
    let isMounted = true;

    async function initChat() {
      if (!currentUser) return;

      try {
        setErrorMessage(null);
        // 1. Fetch channel metadata and app key from backend
        const channelData = await api.chat.getChannel(request.id, currentUser.id);
        const resolvedChannelId = channelData.channelId;
        if (!isMounted) return;
        setChannelId(resolvedChannelId);

        // 2. Fetch public appKey (configured in frontend env or passed from backend)
        const appKey = import.meta.env.VITE_NEXCONN_APP_KEY || channelData.appKey;

        // 3. Request official Nexconn access token from secure backend endpoint
        let token = '';
        try {
          const tokenRes = await api.chat.issueToken(currentUser.id, currentUser.name, currentUser.avatar_url);
          token = tokenRes.token;
        } catch (err: any) {
          console.warn('Backend token endpoint warning:', err.message);
          // If Nexconn credentials are still being configured in backend/.env:
          if (err.message?.includes('NEXCONN_CREDENTIALS')) {
            setErrorMessage(
              'Nexconn credentials required. Please configure NEXCONN_APP_KEY and NEXCONN_APP_SECRET in backend/.env'
            );
            return;
          }
        }

        // 4. Initialize Nexconn Engine
        if (appKey) {
          nexconnChat.initialize(appKey);
        }

        // 5. Connect to Nexconn Real-Time Servers
        if (token) {
          const connected = await nexconnChat.connect(token, currentUser.id);
          if (connected && isMounted) {
            // 6. Ensure group channel exists on Nexconn
            const memberIds = [request.requester_id];
            if (request.accepted_volunteer_id) {
              memberIds.push(request.accepted_volunteer_id);
            }
            await nexconnChat.ensureGroupChannel(resolvedChannelId, request.title, memberIds);

            // 7. Load message history via SDK
            const history = await nexconnChat.loadMessageHistory(resolvedChannelId);
            if (isMounted) {
              setMessages(history);
            }
          }
        }

        // 8. Register Real-Time Incoming Message Listener
        const unsub = nexconnChat.registerMessageListener(
          `chat_${resolvedChannelId}`,
          (incomingMsg: ChatMessage) => {
            if (!isMounted) return;
            setMessages((prev) => {
              // Avoid duplicates
              if (prev.some((m) => m.messageId === incomingMsg.messageId)) return prev;
              return [...prev, incomingMsg];
            });
          }
        );

        return () => {
          unsub();
        };
      } catch (err: any) {
        if (isMounted) {
          setErrorMessage(err.message || 'Error connecting to Nexconn chat');
        }
      }
    }

    initChat();

    return () => {
      isMounted = false;
      if (stopVoiceRef.current) stopVoiceRef.current();
    };
  }, [request.id, currentUser?.id]);

  // Handle Send Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || isSending || !channelId) return;

    if (connectionState !== 'CONNECTED') {
      setErrorMessage('Nexconn is still establishing connection to the real-time servers. Please wait a moment...');
      return;
    }

    setIsSending(true);
    setErrorMessage(null);
    const sentText = text;
    setInputText('');

    // Optimistic message placeholder
    const tempId = `temp_${Date.now()}`;
    const tempMsg: ChatMessage = {
      messageId: tempId,
      senderUserId: currentUser?.id || '',
      text: sentText,
      sentTime: Date.now(),
      isMe: true,
      status: 'sending',
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      // Call Nexconn official SDK to send message
      const sent = await nexconnChat.sendTextMessage(channelId, sentText);
      
      // Update optimistic message with real message
      setMessages((prev) =>
        prev.map((m) => (m.messageId === tempId ? { ...sent, isMe: true, status: 'sent' } : m))
      );
    } catch (err: any) {
      console.error('Failed to send Nexconn message:', err);
      setErrorMessage(`Message send failed: ${err.message || 'Unknown error'}`);
      setMessages((prev) =>
        prev.map((m) =>
          m.messageId === tempId ? { ...m, status: 'failed' } : m
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  // Voice to text input
  const handleToggleVoice = () => {
    if (isRecording) {
      if (stopVoiceRef.current) stopVoiceRef.current();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      stopVoiceRef.current = listenToSpeech(
        (transcript) => {
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        },
        (error) => {
          console.warn('Voice error:', error);
          setIsRecording(false);
        }
      );
    }
  };

  // Request Lifecycle Transitions
  const handleStatusChange = async (newStatus: 'IN_PROGRESS' | 'COMPLETED') => {
    if (!currentUser || isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await api.requests.updateStatus(request.id, newStatus, currentUser.id);
      if (onRequestUpdated) {
        onRequestUpdated(updated);
      }
    } catch (err: any) {
      alert(`Could not update status: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="flex flex-col h-[650px] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      
      {/* Chat Room Header */}
      <div className="px-5 py-4 bg-navy-900 text-white flex items-center justify-between border-b border-navy-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={
                counterpartUser?.avatar_url ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${counterpartUser?.name || 'User'}`
              }
              alt={counterpartUser?.name || 'Participant'}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-400"
            />
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-navy-900 ${
                connectionState === 'CONNECTED' ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-white">
                {counterpartUser?.name || 'Coordination Chat'}
              </h3>
              <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-navy-800 text-slate-300">
                {counterpartUser?.role || 'Partner'}
              </span>
            </div>
            <p className="text-xs text-slate-300 truncate max-w-xs md:max-w-md">
              {request.title}
            </p>
          </div>
        </div>

        {/* Nexconn SDK Connection Indicator & Status Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-navy-800/80 border border-navy-700 text-xs font-medium">
            <Radio
              className={`w-3.5 h-3.5 ${
                connectionState === 'CONNECTED'
                  ? 'text-emerald-400 animate-pulse'
                  : 'text-amber-400'
              }`}
            />
            <span className="text-[11px] text-slate-300">
              {connectionState === 'CONNECTED' ? 'Nexconn SDK Live' : connectionState}
            </span>
          </div>

          {/* Lifecycle Action Buttons */}
          {request.status === 'ACCEPTED' && (
            <button
              onClick={() => handleStatusChange('IN_PROGRESS')}
              disabled={isUpdatingStatus}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold text-xs shadow transition-all"
            >
              <PlayCircle className="w-4 h-4" />
              Start Assistance
            </button>
          )}

          {request.status === 'IN_PROGRESS' && (
            <button
              onClick={() => handleStatusChange('COMPLETED')}
              disabled={isUpdatingStatus}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              Complete Assistance
            </button>
          )}

          <StatusBadge status={request.status} />
        </div>
      </div>

      {/* Request Context Summary Strip */}
      <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-4">
          <span>
            📍 <strong>Location:</strong> {request.location}
          </span>
          <span className="hidden sm:inline">
            🚨 <strong>Priority:</strong> {request.priority.toUpperCase()}
          </span>
          <span className="hidden md:inline">
            💬 <strong>Channel:</strong> {channelId || 'Initializing...'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-brand-700 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
          <span>Verified Volunteer Channel</span>
        </div>
      </div>

      {/* Error banner if Nexconn credentials missing */}
      {errorMessage && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <span className="font-semibold text-amber-900 underline">
            Edit backend/.env
          </span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50">
        {/* Coordination Intro Card */}
        <div className="max-w-md mx-auto my-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm text-center">
          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 mx-auto flex items-center justify-center mb-2">
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="text-xs font-semibold text-navy-900">
            Dedicated Coordination Channel
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            This private real-time room connects the requester and volunteer. Discuss timing, landmarks, and drop-off instructions safely.
          </p>
        </div>

        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
            <Clock className="w-8 h-8 mb-2 stroke-1 text-slate-300" />
            <p className="text-sm font-medium">No messages yet</p>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              Say hello and coordinate assistance details. Messages are synced in real time via Nexconn.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderUserId === currentUser?.id || msg.isMe;
            return (
              <div
                key={msg.messageId}
                className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <img
                    src={
                      counterpartUser?.avatar_url ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${counterpartUser?.name || 'Partner'}`
                    }
                    alt="Sender"
                    className="w-7 h-7 rounded-full object-cover mb-1"
                  />
                )}

                <div
                  className={`max-w-[75%] sm:max-w-md px-4 py-2.5 rounded-2xl shadow-sm text-sm ${
                    isMe
                      ? 'bg-brand-600 text-white rounded-br-none'
                      : 'bg-white text-navy-900 border border-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="leading-relaxed break-words whitespace-pre-wrap">
                    {msg.text}
                  </p>
                  <div
                    className={`flex items-center justify-end gap-1 text-[10px] mt-1 font-medium ${
                      isMe ? 'text-brand-100' : 'text-slate-400'
                    }`}
                  >
                    <span>
                      {new Date(msg.sentTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {msg.status === 'sending' && <span>• sending...</span>}
                    {msg.status === 'failed' && (
                      <span className="text-rose-300 font-bold">• failed</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          {/* Accessible Voice Input Button */}
          {isSpeechSupported && (
            <button
              type="button"
              onClick={handleToggleVoice}
              title={isRecording ? 'Listening... click to stop' : 'Voice-to-text input'}
              className={`p-2.5 rounded-xl border transition-all ${
                isRecording
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          )}

          {/* Message Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isRecording
                ? 'Listening to speech... Speak now'
                : 'Type a message to coordinate assistance...'
            }
            className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all text-navy-900"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-sm rounded-xl shadow-sm transition-all"
          >
            {isSending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>

    </div>
  );
};
