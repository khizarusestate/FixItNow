/**
 * FILE: frontend/src/Components/MaintenanceScreen.jsx
 * 
 * Full-screen maintenance mode message
 */

import { AlertTriangle, Wrench, Clock } from 'lucide-react';

export default function MaintenanceScreen({ message }) {
  return (
    <div className="fixed inset-0 z-[999] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-md mx-auto px-6 text-center space-y-6 animate-fadeIn">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="p-6 bg-orange-500/20 rounded-2xl">
            <Wrench className="w-16 h-16 text-orange-400 animate-bounce" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <h1 className="text-3xl font-bold text-white">Maintenance Mode</h1>
            <AlertTriangle className="w-5 h-5 text-orange-400" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <p className="text-lg text-slate-200">{message || 'App is in maintenance'}</p>
          <p className="text-sm text-slate-400">
            We're making improvements to serve you better. Please check back soon!
          </p>
        </div>

        {/* Checking status */}
        <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
          <Clock className="w-4 h-4 animate-spin" />
          <span>Checking status...</span>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-700">
          <p className="text-xs text-slate-500">
            If you have any questions, please contact support
          </p>
        </div>
      </div>
    </div>
  );
}
