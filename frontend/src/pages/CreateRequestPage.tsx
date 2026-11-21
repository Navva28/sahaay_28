import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { api } from '../services/api';
import { RequestCategory, RequestPriority } from '../types';
import { 
  PlusCircle, 
  Mic, 
  MicOff, 
  Pill, 
  ShoppingBag, 
  Car, 
  HeartHandshake, 
  AlertTriangle, 
  ArrowLeft,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface CreateRequestPageProps {
  setCurrentTab: (tab: string) => void;
  onRequestCreated: (requestId: string) => void;
}

export const CreateRequestPage: React.FC<CreateRequestPageProps> = ({
  setCurrentTab,
  onRequestCreated,
}) => {
  const { currentUser } = useAuth();
  const { isSpeechSupported, listenToSpeech } = useAccessibility();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<RequestCategory>('medicine_delivery');
  const [location, setLocation] = useState(currentUser?.location || 'Indiranagar, Bengaluru');
  const [priority, setPriority] = useState<RequestPriority>('medium');
  const [contactPreference, setContactPreference] = useState('chat');
  const [notes, setNotes] = useState('');
  
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories: { key: RequestCategory; label: string; icon: any }[] = [
    { key: 'medicine_delivery', label: 'Medicine Delivery', icon: Pill },
    { key: 'grocery_assistance', label: 'Grocery Assistance', icon: ShoppingBag },
    { key: 'transportation', label: 'Transportation Aid', icon: Car },
    { key: 'senior_citizen_support', label: 'Senior Citizen Support', icon: HeartHandshake },
    { key: 'emergency_community_support', label: 'Community Support', icon: AlertTriangle },
    { key: 'other', label: 'Other Assistance', icon: HelpCircle },
  ];

  const handleVoiceInput = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      listenToSpeech(
        (transcript) => {
          setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
        },
        (err) => {
          console.warn('Speech error:', err);
          setIsRecording(false);
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('Please sign in or select a demo user persona first.');
      return;
    }

    if (!title.trim() || !description.trim() || !location.trim()) {
      setError('Please fill in title, description, and location.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const created = await api.requests.createRequest({
        requester_id: currentUser.id,
        title: title.trim(),
        description: description.trim(),
        category,
        location: location.trim(),
        priority,
        contact_preference: contactPreference,
        notes: notes.trim(),
      });

      onRequestCreated(created.id);
    } catch (err: any) {
      setError(err.message || 'Failed to submit assistance request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Back button */}
      <button
        onClick={() => setCurrentTab('dashboard')}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-6 bg-gradient-to-r from-navy-900 to-navy-950 text-white">
          <div className="flex items-center gap-2 text-brand-400 text-xs font-bold uppercase tracking-wider mb-1">
            <PlusCircle className="w-4 h-4" />
            <span>Community Assistance Request</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Ask for Assistance
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Fill in the details below. Once a verified volunteer accepts, a private Nexconn chat room will be created for coordination.
          </p>
        </div>

        {error && (
          <div className="mx-6 mt-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Category Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Select Assistance Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setCategory(cat.key)}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/70 text-brand-900 font-bold shadow-sm ring-1 ring-brand-500'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${isSelected ? 'text-brand-600' : 'text-slate-400'}`} />
                    <span className="text-xs">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Request Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Request Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Urgent BP prescription pickup from Apollo Pharmacy"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-navy-900"
              required
            />
          </div>

          {/* Description with Voice Dictation */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Detailed Description *
              </label>
              {isSpeechSupported && (
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isRecording
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-brand-600" />}
                  <span>{isRecording ? 'Listening...' : 'Dictate by Voice'}</span>
                </button>
              )}
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe what you need, specific pharmacy/store address, timing constraints, or any special instructions..."
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-navy-900"
              required
            />
          </div>

          {/* Location & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Location / Neighborhood *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Indiranagar, 12th Main, Bengaluru"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-navy-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Urgency / Priority *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as RequestPriority)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-navy-900 bg-white"
              >
                <option value="low">Standard / Low (Within next few days)</option>
                <option value="medium">Medium (Needed today)</option>
                <option value="high">High (Needed in next 2-4 hours)</option>
                <option value="urgent">Urgent (Immediate attention)</option>
              </select>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Additional Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Gate code is 4421; prescription bill will be paid via UPI."
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-navy-900"
            />
          </div>

          {/* Submit CTA */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 text-center sm:text-left">
              🔒 Your request is saved securely. A dedicated Nexconn chat will open upon volunteer acceptance.
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-2xl shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Posting Request...' : 'Publish Assistance Request'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
