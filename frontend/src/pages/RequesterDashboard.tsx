import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { AssistanceRequest, RequestStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { CategoryIcon, getCategoryLabel } from '../components/CategoryIcon';
import { 
  PlusCircle, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  User as UserIcon, 
  RefreshCw,
  AlertCircle,
  Radio,
  ExternalLink
} from 'lucide-react';

interface RequesterDashboardProps {
  setCurrentTab: (tab: string) => void;
  onOpenChat: (request: AssistanceRequest) => void;
}

export const RequesterDashboard: React.FC<RequesterDashboardProps> = ({
  setCurrentTab,
  onOpenChat,
}) => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchMyRequests = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const data = await api.requests.getRequests({ requesterId: currentUser.id });
      setRequests(data);
    } catch (err) {
      console.error('Error fetching requester requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, [currentUser?.id]);

  const filteredRequests = requests.filter((r) => {
    if (statusFilter === 'ALL') return true;
    return r.status === statusFilter;
  });

  const countByStatus = (status: RequestStatus) =>
    requests.filter((r) => r.status === status).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-700 via-teal-700 to-navy-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-200 bg-white/10 px-3 py-1 rounded-full border border-white/20">
            Requester Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            Welcome back, {currentUser?.name}
          </h1>
          <p className="text-xs sm:text-sm text-teal-100 mt-1 max-w-xl">
            Track your assistance requests in real time. Whenever a volunteer accepts, you can coordinate directly in your dedicated Nexconn chat room.
          </p>
        </div>

        <button
          onClick={() => setCurrentTab('create-request')}
          className="flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-navy-900 font-bold text-sm rounded-2xl shadow-lg transition-all shrink-0 hover:scale-[1.02]"
        >
          <PlusCircle className="w-5 h-5 text-brand-600" />
          <span>New Assistance Request</span>
        </button>
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          onClick={() => setStatusFilter('ALL')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'ALL' ? 'bg-white border-brand-500 shadow-md ring-1 ring-brand-500' : 'bg-slate-50 border-slate-200 hover:bg-white'
          }`}
        >
          <p className="text-xs text-slate-500 font-medium">Total Requests</p>
          <p className="text-2xl font-black text-navy-900 mt-1">{requests.length}</p>
        </div>

        <div 
          onClick={() => setStatusFilter('OPEN')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'OPEN' ? 'bg-white border-brand-500 shadow-md ring-1 ring-brand-500' : 'bg-slate-50 border-slate-200 hover:bg-white'
          }`}
        >
          <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Waiting for Volunteer
          </p>
          <p className="text-2xl font-black text-navy-900 mt-1">{countByStatus('OPEN')}</p>
        </div>

        <div 
          onClick={() => setStatusFilter('IN_PROGRESS')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'IN_PROGRESS' ? 'bg-white border-brand-500 shadow-md ring-1 ring-brand-500' : 'bg-slate-50 border-slate-200 hover:bg-white'
          }`}
        >
          <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Active / In Progress
          </p>
          <p className="text-2xl font-black text-navy-900 mt-1">
            {countByStatus('ACCEPTED') + countByStatus('IN_PROGRESS')}
          </p>
        </div>

        <div 
          onClick={() => setStatusFilter('COMPLETED')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'COMPLETED' ? 'bg-white border-brand-500 shadow-md ring-1 ring-brand-500' : 'bg-slate-50 border-slate-200 hover:bg-white'
          }`}
        >
          <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
            Fulfilled
          </p>
          <p className="text-2xl font-black text-navy-900 mt-1">{countByStatus('COMPLETED')}</p>
        </div>
      </div>

      {/* Requests Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-navy-900">
            My Assistance Requests ({filteredRequests.length})
          </h2>
          <button
            onClick={fetchMyRequests}
            title="Refresh requests"
            className="p-2 text-slate-500 hover:text-navy-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-brand-600" />
            <p className="text-sm font-medium">Loading your requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 mx-auto flex items-center justify-center">
              <PlusCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-navy-900">No requests found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {statusFilter !== 'ALL'
                ? `You don't have any requests in status "${statusFilter}".`
                : 'Need help with groceries, medications, or hospital accompaniment? Post your first request.'}
            </p>
            <button
              onClick={() => setCurrentTab('create-request')}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow transition-all"
            >
              Post Assistance Request
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top tags */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <CategoryIcon category={req.category} />
                      <span className="text-xs font-semibold text-slate-600">
                        {getCategoryLabel(req.category)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <PriorityBadge priority={req.priority} />
                      <StatusBadge status={req.status} />
                    </div>
                  </div>

                  {/* Title & Desc */}
                  <h3 className="font-extrabold text-base text-navy-900 mb-1.5">
                    {req.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                    {req.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {req.location}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(req.created_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Volunteer & Action Bar */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  {req.volunteer ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={
                          req.volunteer.avatar_url ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${req.volunteer.name}`
                        }
                        alt={req.volunteer.name}
                        className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-400"
                      />
                      <div>
                        <p className="text-xs font-bold text-navy-900 leading-none">
                          {req.volunteer.name}
                        </p>
                        <p className="text-[10px] text-emerald-600 font-semibold">Assigned Volunteer</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full font-medium">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                      <span>Broadcasting to volunteers...</span>
                    </div>
                  )}

                  {/* Open Chat Room Button */}
                  <button
                    onClick={() => onOpenChat(req)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
                    <span>Open Chat</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
