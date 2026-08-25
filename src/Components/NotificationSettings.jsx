import { useState, useEffect } from 'react';
import { Bell, Save, Loader } from 'lucide-react';
import { apiRequestWithAuth } from '../lib/apiRequest';
import { useAuth } from '../context/AuthContext';
import { fetchDevicePushPreference, setDevicePushEnabled, isPushSupported } from '../utils/pushNotifications.js';

const DEFAULT_TYPES = {
  newBooking: true, newWorker: true, newCustomer: true, claimPending: true, newReview: true, newAdvertisement: true, supportChat: true,
  newJob: true, claimApproved: true, customerCompleted: true, claimRejected: true,
  bookingReceived: true, workerAssigned: true, workerOnTheWay: true, workerCompleted: true, jobCompleted: true,
};

export default function NotificationSettings() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [settings, setSettings] = useState({ pushEnabled: false, inAppEnabled: true, emailEnabled: false, notificationTypes: DEFAULT_TYPES });

  const notificationLabels = {
    newBooking: '📅 New Booking Requests', newWorker: '👷 New Worker Registrations', newCustomer: '👤 New Customer Signups', claimPending: '⏳ Worker Claim Reviews', newReview: '⭐ New Reviews', newAdvertisement: '📢 New Advertisements', supportChat: '💬 Support Chat',
    newJob: '🎯 Available Medium/High Priority Jobs', claimApproved: '✅ Claim Approvals', claimRejected: '❌ Claim Rejections', customerCompleted: '✓ Customer Marked Job Done',
    bookingReceived: '✓ Booking Confirmations', workerAssigned: '👷 Worker Assignments', workerOnTheWay: '🚗 Worker On The Way', workerCompleted: '✓✓ Worker Completed Job', jobCompleted: '✓✓ Job Completions',
  };

  const adminNotifications = ['newBooking', 'newWorker', 'newCustomer', 'claimPending', 'newReview', 'newAdvertisement', 'supportChat'];
  const workerNotifications = ['newJob', 'claimApproved', 'claimRejected', 'customerCompleted'];
  const customerNotifications = ['bookingReceived', 'workerAssigned', 'workerOnTheWay', 'workerCompleted'];
  const getRelevantNotifications = () => currentUser?.role === 'admin' ? adminNotifications : currentUser?.type === 'worker' ? workerNotifications : currentUser?.type === 'customer' ? customerNotifications : [];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [result, devicePush] = await Promise.all([
          apiRequestWithAuth('/notifications/settings', { method: 'GET' }),
          fetchDevicePushPreference().catch(() => false),
        ]);
        if (!mounted) return;
        setSettings({
          pushEnabled: Boolean(result?.data?.pushEnabled) && Boolean(devicePush),
          inAppEnabled: result?.data?.inAppEnabled ?? true,
          emailEnabled: result?.data?.emailEnabled ?? false,
          notificationTypes: { ...DEFAULT_TYPES, ...(result?.data?.notificationTypes || {}) },
        });
      } catch (err) {
        if (mounted) setError(err?.message || 'Failed to load settings');
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);

  const handleToggle = (key, value) => {
    setSuccess('');
    if (key === 'pushEnabled' || key === 'inAppEnabled' || key === 'emailEnabled') setSettings((prev) => ({ ...prev, [key]: value }));
    else setSettings((prev) => ({ ...prev, notificationTypes: { ...prev.notificationTypes, [key]: value } }));
  };

  const handlePushToggle = async (enabled) => {
    setSaving(true); setError(''); setSuccess('');
    try {
      if (enabled && !isPushSupported()) throw new Error('Push notifications are not supported by this browser.');
      const result = await setDevicePushEnabled(enabled);
      if (!result?.ok) throw new Error(result.reason === 'denied' ? 'Notifications are blocked in browser settings.' : result.reason === 'disabled' ? 'Push notifications are not configured on the server yet.' : 'Could not change push notifications.');
      const response = await apiRequestWithAuth('/notifications/settings', { method: 'PUT', body: JSON.stringify({ pushEnabled: enabled }) });
      if (!response?.success) throw new Error(response?.message || 'Failed to save push preference.');
      setSettings((prev) => ({ ...prev, pushEnabled: enabled }));
      setSuccess(enabled ? 'Push notifications enabled.' : 'Push notifications disabled.');
    } catch (err) { setError(err?.message || 'Failed to update push notifications'); }
    finally { setSaving(false); }
  };

  const handleSave = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      const result = await apiRequestWithAuth('/notifications/settings', { method: 'PUT', body: JSON.stringify(settings) });
      if (!result?.success) throw new Error(result?.message || 'Failed to save settings');
      setSuccess('Notification settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err?.message || 'Failed to save settings'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-12"><Loader size={24} className="animate-spin text-orange-500" /></div>;
  const relevantNotifications = getRelevantNotifications();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3"><Bell className="text-orange-500" size={24} /><div><h2 className="text-2xl font-bold text-slate-900">Notification Settings</h2><p className="text-sm text-slate-600">Control how and when you receive notifications.</p></div></div>
      {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">{error}</div>}
      {success && <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700 border border-green-200">{success}</div>}

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="font-semibold text-slate-900">Notification Channels</h3>
        <div className="flex items-center justify-between py-3 border-b border-slate-100"><div><p className="font-medium text-slate-900">Push Notifications</p><p className="text-sm text-slate-600">Receive browser/device push notifications.</p></div><input type="checkbox" checked={settings.pushEnabled} disabled={saving} onChange={(e) => { handleToggle('pushEnabled', e.target.checked); handlePushToggle(e.target.checked); }} className="w-5 h-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500" /></div>
        <div className="flex items-center justify-between py-3 border-b border-slate-100"><div><p className="font-medium text-slate-900">In-App Notifications</p><p className="text-sm text-slate-600">See notifications in the bell icon.</p></div><input type="checkbox" checked={settings.inAppEnabled} disabled={saving} onChange={(e) => handleToggle('inAppEnabled', e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500" /></div>
      </div>

      {relevantNotifications.length > 0 && <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6"><h3 className="font-semibold text-slate-900">Notification Types</h3><p className="text-sm text-slate-600">Choose the specific events you want to receive.</p><div className="space-y-3">{relevantNotifications.map((type) => <label key={type} className="flex items-center justify-between gap-3 py-2 cursor-pointer"><span className="text-slate-700">{notificationLabels[type]}</span><input type="checkbox" checked={settings.notificationTypes[type] ?? true} onChange={(e) => handleToggle(type, e.target.checked)} disabled={saving} className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500" /></label>)}</div></div>}

      <div className="flex justify-end"><button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 font-medium text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{saving ? <><Loader size={18} className="animate-spin" />Saving...</> : <><Save size={18} />Save Settings</>}</button></div>
    </div>
  );
}
