import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  HeartHandshake, 
  Pill, 
  ShoppingBag, 
  Car, 
  MessageSquare, 
  ShieldCheck, 
  Users, 
  ArrowRight, 
  Sparkles,
  CheckCircle,
  Radio,
  Clock,
  Heart
} from 'lucide-react';

interface LandingPageProps {
  setCurrentTab: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setCurrentTab }) => {
  const { currentUser, switchUser, availableUsers } = useAuth();

  const handleStartRequest = () => {
    // Switch to requester if currently volunteer, or open create request
    if (currentUser?.role !== 'requester') {
      const requester = availableUsers.find((u) => u.role === 'requester');
      if (requester) switchUser(requester);
    }
    setCurrentTab('create-request');
  };

  const handleStartVolunteer = () => {
    // Switch to volunteer persona
    if (currentUser?.role !== 'volunteer') {
      const volunteer = availableUsers.find((u) => u.role === 'volunteer');
      if (volunteer) switchUser(volunteer);
    }
    setCurrentTab('dashboard');
  };

  return (
    <div className="space-y-16 py-8">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-6 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-semibold">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>Nexconn Hackathon 2026 • Humanitarian & Social Good</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-950 tracking-tight leading-tight">
                Connecting people. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-teal-500">
                  Empowering communities.
                </span>
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                Sahaay bridges neighbors who need assistance with compassionate local volunteers through <strong>dedicated real-time chat rooms powered by Nexconn</strong>. No lost messages, no uncertainty.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <button
                  onClick={handleStartRequest}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30 transition-all text-base"
                >
                  <Heart className="w-5 h-5 fill-white/20" />
                  Request Assistance
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleStartVolunteer}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-navy-900 font-bold rounded-2xl border border-slate-300 shadow-sm transition-all text-base"
                >
                  <Users className="w-5 h-5 text-brand-600" />
                  Become a Volunteer
                </button>
              </div>

              {/* Quick Trust Highlights */}
              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-200/80 max-w-lg">
                <div>
                  <p className="text-xl font-extrabold text-navy-900">100%</p>
                  <p className="text-xs text-slate-500">Free & Community-Powered</p>
                </div>
                <div>
                  <p className="text-xl font-extrabold text-brand-600 flex items-center gap-1">
                    <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                    Real-Time
                  </p>
                  <p className="text-xs text-slate-500">Nexconn Web Chat SDK</p>
                </div>
                <div>
                  <p className="text-xl font-extrabold text-navy-900">Verified</p>
                  <p className="text-xs text-slate-500">Dedicated Chat Rooms</p>
                </div>
              </div>
            </div>

            {/* Hero Graphic / Interactive Persona Card */}
            <div className="lg:col-span-5">
              <div className="relative bg-gradient-to-br from-brand-500/10 via-teal-500/5 to-navy-900/5 p-6 sm:p-8 rounded-3xl border border-brand-200/50 shadow-2xl backdrop-blur-sm">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                      Live Coordination Demo
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-brand-100 text-brand-800">
                    2-Session Ready
                  </span>
                </div>

                <div className="py-4 space-y-3">
                  {/* Persona 1 */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"
                        alt="Anjali"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-xs font-bold text-navy-950">Anjali Sharma</p>
                        <p className="text-[11px] text-amber-700 font-medium">Requester • Indiranagar</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const anjali = availableUsers.find((u) => u.id === 'usr_req_anjali');
                        if (anjali) switchUser(anjali);
                        setCurrentTab('dashboard');
                      }}
                      className="px-3 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 transition-colors"
                    >
                      Act as Requester
                    </button>
                  </div>

                  {/* Persona 2 */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
                        alt="Rahul"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-xs font-bold text-navy-950">Rahul Verma</p>
                        <p className="text-[11px] text-emerald-700 font-medium">Volunteer • Koramangala</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const rahul = availableUsers.find((u) => u.id === 'usr_vol_rahul');
                        if (rahul) switchUser(rahul);
                        setCurrentTab('dashboard');
                      }}
                      className="px-3 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors"
                    >
                      Act as Volunteer
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-brand-50/80 rounded-2xl border border-brand-100 text-xs text-brand-900 leading-relaxed">
                  💡 <strong>Tip for Hackathon Judges:</strong> Open two separate browser tabs or an incognito window. Act as <em>Requester</em> in one and <em>Volunteer</em> in the other to see instant real-time Nexconn chat sync and status lifecycle!
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* The Problem vs Solution Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-navy-950">
            Why Sahaay? Solving the Coordination Dilemma
          </h2>
          <p className="text-slate-600 mt-3 text-base">
            In emergencies and daily struggles, social media groups fail because messages get buried and nobody knows who is taking responsibility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Problem Card */}
          <div className="p-8 rounded-3xl bg-rose-50/60 border border-rose-200/70 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xl">
              ❌
            </div>
            <h3 className="text-xl font-bold text-navy-900">The Problem: WhatsApp & Group Chaos</h3>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span>Urgent requests get lost beneath hundreds of chit-chat messages.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span>No atomic assignment: multiple volunteers may buy medicine, or none at all.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span>Senior citizens struggle with complex or inaccessible interfaces.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span>Requesters are left anxious with zero status updates.</span>
              </li>
            </ul>
          </div>

          {/* Solution Card */}
          <div className="p-8 rounded-3xl bg-brand-50/60 border border-brand-200/70 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xl">
              ✨
            </div>
            <h3 className="text-xl font-bold text-navy-900">The Sahaay Solution: 1 Request = 1 Dedicated Chat</h3>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <span><strong>Dedicated Nexconn Group Channel:</strong> Every accepted task creates an isolated, real-time coordination room.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <span><strong>Atomic Volunteer Claiming:</strong> Backend locks ensure exactly one verified volunteer handles each need.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <span><strong>Full Accessibility:</strong> Large font mode, high contrast, and voice-to-text dictation for senior citizens.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <span><strong>Lifecycle Transparency:</strong> Track Open → Accepted → In Progress → Completed seamlessly.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works (3 Steps) */}
      <section className="bg-white py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              Simple 3-Step Coordination
            </span>
            <h2 className="text-3xl font-extrabold text-navy-950 mt-3">
              How Sahaay Coordinates Community Aid
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white font-black flex items-center justify-center">
                1
              </div>
              <h3 className="font-bold text-lg text-navy-900">Post Assistance Need</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Requesters enter title, location, category (medicine, groceries, transport), priority, or dictate via microphone.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-black flex items-center justify-center">
                2
              </div>
              <h3 className="font-bold text-lg text-navy-900">Volunteer Accepts</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Nearby volunteers review the request details and accept with one click. The backend reserves the request and initializes a channel.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-navy-900 text-white font-black flex items-center justify-center">
                3
              </div>
              <h3 className="font-bold text-lg text-navy-900">Coordinate over Nexconn Chat</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Both enter the dedicated Nexconn chat room, send real-time updates, track progress, and mark the assistance completed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Assistance Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl font-extrabold text-navy-950">
            Assistance Categories Supported
          </h2>
          <p className="text-slate-600 mt-2 text-sm">
            Designed for everyday neighborhood humanitarian support.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm text-left hover:border-brand-500 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <Pill className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-navy-900">Medicine Delivery</h4>
            <p className="text-xs text-slate-500 mt-1">Pharmacy pickups, prescription refills, and medical supplies.</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm text-left hover:border-brand-500 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-navy-900">Grocery Assistance</h4>
            <p className="text-xs text-slate-500 mt-1">Pantry staples, fresh produce, and elder grocery runs.</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm text-left hover:border-brand-500 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Car className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-navy-900">Transportation Aid</h4>
            <p className="text-xs text-slate-500 mt-1">Hospital OPD escorts, clinic visits, and safe rides.</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm text-left hover:border-brand-500 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-navy-900">Senior Citizen Care</h4>
            <p className="text-xs text-slate-500 mt-1">Accompaniment, reading assistance, and wellness check-ins.</p>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-gradient-to-r from-navy-900 to-navy-950 text-white rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to experience Sahaay?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Explore the live MVP now. Post an assistance request or accept one as a volunteer to see official Nexconn real-time messaging in action.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                onClick={handleStartRequest}
                className="w-full sm:w-auto px-6 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl shadow-lg transition-all"
              >
                Create Assistance Request
              </button>
              <button
                onClick={handleStartVolunteer}
                className="w-full sm:w-auto px-6 py-3.5 bg-navy-800 hover:bg-navy-700 text-slate-200 font-bold rounded-2xl border border-navy-700 transition-all"
              >
                View Available Requests
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
