import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { apiRequest } from '../lib/api';

export default function AdvertisementForm({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    service: '',
    category: '',
    budget: '',
    location: '',
    phoneNumber: '',
    email: '',
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (e) => {
    // Max 5 images limit
    const newImages = [...images, ...Array.from(e.target.files)];
    if (newImages.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }
    setImages(newImages);
  };

  const handleImageRemove = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Trim and validate all required fields
      const title = form.title.trim();
      const description = form.description.trim();
      const service = form.service.trim();

      if (!title) {
        setError('Title is required.');
        setLoading(false);
        return;
      }
      
      if (!description) {
        setError('Description is required.');
        setLoading(false);
        return;
      }
      
      if (!service) {
        setError('Service is required.');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('service', service);
      formData.append('category', form.category || '');
      formData.append('budget', form.budget || '0');
      formData.append('location', form.location || '');
      formData.append('phoneNumber', form.phoneNumber || '');
      formData.append('email', form.email || '');

      images.forEach((img) => formData.append('images', img));

      const response = await apiRequest('/advertisements', {
        method: 'POST',
        body: formData,
      });

      if (response.success) {
        setSuccess('Advertisement posted successfully!');
        setForm({ title: '', description: '', service: '', category: '', budget: '', location: '', phoneNumber: '', email: '' });
        setImages([]);
        setTimeout(() => onSuccess?.(), 1500);
      }
    } catch (err) {
      setError(err.message || 'Failed to post advertisement');
      console.error('Advertisement error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Post Advertisement</h2>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Title *</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleInputChange}
              placeholder="Brief title for your advertisement"
              maxLength={100}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleInputChange}
              placeholder="Detailed description of what you need..."
              maxLength={1000}
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Service *</label>
              <input
                type="text"
                name="service"
                value={form.service}
                onChange={handleInputChange}
                placeholder="e.g., Plumbing, Electrical"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Budget</label>
              <input
                type="number"
                name="budget"
                value={form.budget}
                onChange={handleInputChange}
                placeholder="Budget (optional)"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleInputChange}
              placeholder="Location"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
              <input
                type="tel"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleInputChange}
                placeholder="Phone number"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                placeholder="Email address"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Images {images.length > 0 && <span className="text-slate-500">({images.length}/5)</span>}
            </label>
            {images.length < 5 && (
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload"
              />
            )}
            {images.length > 0 && images.length < 5 && (
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload-more"
              />
            )}
            
            {images.length < 5 ? (
              <label
                htmlFor="image-upload"
                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                <Upload size={20} className="text-slate-500" />
                <span className="text-slate-600">Upload Images</span>
              </label>
            ) : (
              <div className="px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 text-center text-sm text-slate-500">
                Maximum 5 images reached
              </div>
            )}

            {images.length > 0 && (
              <div className="mt-3">
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={URL.createObjectURL(img)}
                        alt={`Preview ${idx}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleImageRemove(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                {images.length < 5 && (
                  <label
                    htmlFor="image-upload-more"
                    className="block text-center px-3 py-2 border border-dashed border-blue-300 rounded-lg text-sm text-blue-600 hover:bg-blue-50 cursor-pointer font-medium"
                  >
                    + Add more images ({images.length}/5)
                  </label>
                )}
              </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Posting...' : 'Post Advertisement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
