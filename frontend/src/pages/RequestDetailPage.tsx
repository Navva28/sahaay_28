import React, { useState } from 'react';
import { AssistanceRequest } from '../types';
import { ChatWindow } from '../components/ChatWindow';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { CategoryIcon, getCategoryLabel } from '../components/CategoryIcon';
import { ArrowLeft, MapPin, Clock, ShieldCheck, HeartHandshake, Phone, Mail } from 'lucide-react';

interface RequestDetailPageProps {
  request: AssistanceRequest;
  setCurrentTab: (tab: string) => void;
  onRequestUpdated: (updated: AssistanceRequest) => void;
}

export const RequestDetailPage: React.FC<RequestDetailPageProps> = ({
  request: initialRequest,
  setCurrentTab,
  onRequestUpdated,
}) => {
  const [request, setRequest] = useState<AssistanceRequest>(initialRequest);

  const handleUpdate = (updated: AssistanceRequest) => {
    setRequest(updated);
    onRequestUpdated(updated);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Back button */}
      <button
        onClick={() => setCurrentTab('dashboard')}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Main Grid: Left Details Card, Right Live Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Request Details & Participants (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-5">
            {/* Header tags */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CategoryIcon category={request.category} />
                <span className="text-xs font-bold text-slate-600">
                  {getCategoryLabel(request.category)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <PriorityBadge priority={request.priority} />
                <StatusBadge status={request.status} />
              </div>
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950 leading-tight">
                {request.title}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Request ID: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{request.id}</code>
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
              {request.description}
            </div>

            {request.notes && (
              <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl text-xs text-amber-900">
                <strong>Special Notes:</strong> {request.notes}
              </div>
            )}

            <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
                <span><strong>Location:</strong> {request.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-600 shrink-0" />
                <span>
                  <strong>Posted:</strong> {new Date(request.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Participants Card */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Coordination Participants
              </h4>

              {/* Requester Profile */}
              <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100 flex items-center gap-3">
                <img
                  src={
                    request.requester?.avatar_url ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${request.requester?.name || 'Requester'}`
                  }
                  alt={request.requester?.name || 'Requester'}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-400"
                />
                <div className="text-xs">
                  <p className="font-bold text-navy-900 leading-none">
                    {request.requester?.name || 'Community Member'}
                  </p>
                  <p className="text-[11px] text-amber-800 font-medium mt-0.5">Requester</p>
                </div>
              </div>

              {/* Volunteer Profile */}
              {request.volunteer ? (
                <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-3">
                  <img
                    src={
                      request.volunteer.avatar_url ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${request.volunteer.name || 'Volunteer'}`
                    }
                    alt={request.volunteer.name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-400"
                  />
                  <div className="text-xs">
                    <p className="font-bold text-navy-900 leading-none">
                      {request.volunteer.name}
                    </p>
                    <p className="text-[11px] text-emerald-800 font-medium mt-0.5">
                      Assigned Volunteer • {request.volunteer.phone || 'Phone verified'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center text-xs text-slate-500">
                  Waiting for volunteer acceptance...
                </div>
              )}
            </div>

            <div className="pt-2 text-center">
              <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Protected by Nexconn End-to-End Chat Transport</span>
              </span>
            </div>

          </div>

        </div>

        {/* Right Column: Official Nexconn Real-Time Chat (7 cols) */}
        <div className="lg:col-span-7">
          <ChatWindow
            request={request}
            onRequestUpdated={handleUpdate}
          />
        </div>

      </div>

    </div>
  );
};
