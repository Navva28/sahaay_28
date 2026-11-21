import React from 'react';
import { HeartHandshake, ShieldAlert, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-950 text-slate-300 border-t border-navy-900 mt-auto">
      {/* Non-emergency advisory notice */}
      <div className="bg-amber-950/40 border-b border-amber-900/40 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-xs md:text-sm text-amber-200 text-center font-medium">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Advisory Notice:</strong> Sahaay is a humanitarian coordination platform connecting community volunteers. It is <strong>NOT</strong> an emergency response service. In life-threatening emergencies, dial 112 / 911 immediately.
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">Sahaay</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Connecting people. Empowering communities. Built for the <strong>Nexconn Hackathon Build Challenge 2026</strong> in the Humanitarian & Social Good track.
            </p>
            <div className="flex items-center gap-2 text-xs text-teal-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Group Coordination powered by <strong>Nexconn Chat SDK</strong></span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Core Scenarios
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>• Prescription & Medicine Delivery</li>
              <li>• Elderly Grocery Assistance</li>
              <li>• Hospital OPD Transportation</li>
              <li>• Senior Citizen Accompaniment</li>
              <li>• Community Crisis Support</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Architecture & Stack
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>• Nexconn Chat Web SDK</li>
              <li>• React 18 & TypeScript & Vite</li>
              <li>• Tailwind CSS & shadcn/ui</li>
              <li>• Node.js & Express API</li>
              <li>• Supabase PostgreSQL</li>
            </ul>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-navy-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Sahaay. Open-source humanitarian MVP under MIT License.</p>
          <p className="flex items-center gap-1.5">
            Crafted for <span className="text-teal-400 font-semibold">Nexconn Build Challenge</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
