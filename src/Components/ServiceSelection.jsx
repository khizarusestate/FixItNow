import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { servicesService } from '../services/api';

export default function ServiceSelection({ selectedServices, onChange, maxSelection = 5 }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const res = await servicesService.getAll();
      setServices(res?.data?.services || []);
      setError('');
    } catch (err) {
      console.error('Error loading services:', err);
      setError('Failed to load services');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleService = (service) => {
    const serviceId = String(service._id);
    const isSelected = selectedServices.some(
      (s) => String(s.serviceId) === serviceId,
    );
    
    if (isSelected) {
      onChange(selectedServices.filter(s => s.serviceId !== serviceId));
    } else if (selectedServices.length < maxSelection) {
      onChange([...selectedServices, {
        serviceId,
        serviceName: service.name,
        serviceCategory: service.category,
      }]);
    }
  };

  if (loading) return <div className="text-sm text-slate-500">Loading services...</div>;
  if (error) return <div className="text-sm text-red-500">{error}</div>;
  if (services.length === 0) return <div className="text-sm text-slate-500">No services available</div>;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {services.map(service => {
          const isSelected = selectedServices.some(
            (s) => String(s.serviceId) === String(service._id),
          );
          return (
            <button
              key={service._id}
              onClick={() => toggleService(service)}
              className={`p-3 rounded-lg border-2 transition-all text-sm font-medium flex items-center justify-between ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
              }`}
            >
              <span>{service.name}</span>
              {isSelected && <Check size={16} />}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-slate-500">
        Selected: {selectedServices.length} / {maxSelection}
      </p>
    </div>
  );
}
