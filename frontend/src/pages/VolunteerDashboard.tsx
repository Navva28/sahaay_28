import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { AssistanceRequest, RequestCategory, RequestPriority } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { CategoryIcon, getCategoryLabel } from '../components/CategoryIcon';
import { 
  HeartHandshake, 
  MessageSquare, 
  CheckCircle, 
  MapPin, 
  Clock, 
  Filter, 
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search
} from 'lucide-react';

interface VolunteerDashboardProps {
  setCurrentTab: (tab: string) => void;
  onOpenChat: (request: AssistanceRequest) => void;
}

export const VolunteerDashboard: React.FC<VolunteerDashboardProps> = ({
  setCurrentTab,
  onOpenChat,
}) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'available' | 'my_assignments'>('available');
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [myAssignments, setMyAssignments] = useState<AssistanceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAcceptingId, setIsAcceptingId] = useState<string | null>(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch available open requests
      const openReqs = await api.requests.getRequests({ status: 'OPEN' });
      setRequests(openReqs);

      // 2. Fetch my accepted assignments
      if (currentUser) {
        const myTasks = await api.requests.getRequests({ volunteerId: currentUser.id });
        setMyAssignments(myTasks);
      }
    } catch (err) {
      console.error('Error loading volunteer requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentUser?.id]);

  // Handle volunteer accepting a request
  const handleAcceptRequest = async (request: AssistanceRequest) => {
    if (!currentUser) return;
    setIsAcceptingId(request.id);

    try {
      const accepted = await api.requests.acceptRequest(request.id, currentUser.id);
      
      // Update local state
      setRequests((prev) => prev.filter((r) => r.id !== request.id));
      setMyAssignments((prev) => [accepted, ...prev]);

      // Automatically open coordination chat!
      onOpenChat(accepted);
    } catch (err: any) {
      alert(`Could not accept request: ${err.message}`);
    } finally {
      setIsAcceptingId(null);
    }
  };

  const categories: { key: string; label: string }[] = [
    { key: 'ALL', label: 'All Categories' },
    { key: 'medicine_delivery', label: 'Medicine' },
    { key: 'grocery_assistance', label: 'Groceries' },
    { key: 'transportation', label: 'Transport' },
    { key: 'senior_citizen_support', label: 'Senior Support' },
    { key: 'emergency_community_support', label: 'Community' },
  ];

  const filteredAvailable = requests.filter((r) => {
    if (categoryFilter !== 'ALL' && r.category !== categoryFilter) return false;
    if (priorityFilter !== 'ALL' && r.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800">
            Volunteer Community Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            Volunteer Dashboard • {currentUser?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Accept assistance requests from your neighbors. Each accepted request connects you in a private, real-time coordination chat room powered by Nexconn.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 text-center">
            <p className="text-xs text-slate-300 font-medium">My Active Tasks</p>
            <p className="text-xl font-black text-emerald-400 mt-0.5">
              {myAssignments.filter((a) => a.status !== 'COMPLETED').length}
            </p>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 text-center">
            <p className="text-xs text-slate-300 font-medium">Completed</p>
            <p className="text-xl font-black text-white mt-0.5">
              {myAssignments.filter((a) => a.status === 'COMPLETED').length}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Available Feed vs My Accepted Assignments */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('available')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'available'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
            }`}
          >
            Available Community Requests ({requests.length})
          </button>

          <button
            onClick={() => setActiveTab('my_assignments')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'my_assignments'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
            }`}
          >
            My Accepted Tasks ({myAssignments.length})
          </button>
        </div>

        <button
          onClick={fetchRequests}
          title="Refresh Feed"
          className="p-2 text-slate-500 hover:text-navy-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* TAB 1: AVAILABLE FEED */}
      {activeTab === 'available' && (
        <div className="space-y-6">
          
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search requests or location..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setCategoryFilter(cat.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    categoryFilter === cat.key
                      ? 'bg-navy-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="urgent">Urgent Only</option>
              <option value="high">High & Above</option>
              <option value="medium">Medium</option>
              <option value="low">Standard</option>
            </select>
          </div>

          {/* Cards Grid */}
          {isLoading ? (
            <div className="py-16 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-brand-600" />
              <p className="text-sm font-medium">Scanning community requests...</p>
            </div>
          ) : filteredAvailable.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-lg font-bold text-navy-900">All caught up!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No open assistance requests match your current filters. Check back soon or switch categories.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAvailable.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    {/* Header tags */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CategoryIcon category={req.category} />
                        <span className="text-xs font-semibold text-slate-600">
                          {getCategoryLabel(req.category)}
                        </span>
                      </div>
                      <PriorityBadge priority={req.priority} />
                    </div>

                    <h3 className="font-extrabold text-base text-navy-950 mb-2 leading-snug">
                      {req.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
                      {req.description}
                    </p>

                    <div className="space-y-1.5 text-xs text-slate-500">
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{req.location}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          Posted by{' '}
                          <strong className="text-navy-900">
                            {req.requester?.name || 'Community Member'}
                          </strong>
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Accept CTA Button with atomic lock */}
                  <div className="pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleAcceptRequest(req)}
                      disabled={isAcceptingId === req.id}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow transition-all hover:scale-[1.01]"
                    >
                      <HeartHandshake className="w-4 h-4" />
                      <span>
                        {isAcceptingId === req.id
                          ? 'Assigning & Creating Channel...'
                          : 'Accept & Open Chat'}
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* TAB 2: MY ACCEPTED TASKS */}
      {activeTab === 'my_assignments' && (
        <div className="space-y-4">
          {myAssignments.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
              <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-navy-900">No accepted tasks yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore the Available Community Requests tab and accept a neighbor in need.
              </p>
              <button
                onClick={() => setActiveTab('available')}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow transition-all"
              >
                Browse Open Requests
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myAssignments.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CategoryIcon category={task.category} />
                        <span className="text-xs font-semibold text-slate-600">
                          {getCategoryLabel(task.category)}
                        </span>
                      </div>
                      <StatusBadge status={task.status} />
                    </div>

                    <h3 className="font-extrabold text-base text-navy-950 mb-1.5">
                      {task.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                      {task.description}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {task.location}
                      </span>
                      <span>•</span>
                      <span>Requester: {task.requester?.name}</span>
                    </div>
                  </div>

                  {/* Enter Chat Button */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-brand-700">
                      Nexconn Channel Active
                    </span>

                    <button
                      onClick={() => onOpenChat(task)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
                      <span>Enter Coordination Chat</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
