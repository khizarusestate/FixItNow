import { useState, useEffect, useRef } from 'react'
import { X, Save, User, Mail, Phone, MapPin, Camera, Briefcase, ShieldCheck, Calendar, DollarSign } from 'lucide-react'
import { apiRequestWithAuth } from '../lib/api'
import { resolveUploadMediaUrl } from '../utils/mediaUrl.js'
import { servicesService } from '../services/api.js'
import { setUserData } from '../utils/jwt.js'
import LocationPicker from './LocationPicker.jsx'
import { geoFromUser } from '../utils/location.js'
import {
  uploadUserProfilePicture,
  isInlineImageValue,
} from '../utils/profilePictureUpload.js'

const FALLBACK_SERVICES = ['Cleaning', 'Home Repair', 'Electrical', 'Plumbing', 'Automotive', 'IT Support', 'Other'];

export default function EditProfile({ isOpen, onClose, userData, onProfileUpdate }) {
  const isWorker = userData?.type === 'worker'
  
  const [geo, setGeo] = useState(() => geoFromUser(userData));
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    cnic: '',
    serviceCategory: '',
    availability: true,
    profilePicture: '',
  });
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const [serviceOptions, setServiceOptions] = useState(FALLBACK_SERVICES);
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  useEffect(() => {
    if (userData) {
      setGeo(geoFromUser(userData));
      setForm({
        fullName: userData.fullName || '',
        email: userData.email || userData.emailAddress || '',
        phone: userData.phone || userData.phoneNumber || '',
        cnic: userData.cnicNumber || userData.cnic || '',
        serviceCategory: userData.serviceCategory || userData.primaryServiceCategory || '',
        availability: userData.availability ?? true,
        profilePicture: userData.profilePicture || '',
      });
      setPreviewImage(userData.profilePicture ? resolveUploadMediaUrl(userData.profilePicture) : null);
    }
  }, [userData])

  useEffect(() => {
    if (!isWorker || !isOpen) return;

    const loadServices = async () => {
      try {
        const response = await servicesService.getAll();
        const services = response?.data?.services || [];
        const names = services.map(service => service.name).filter(Boolean);
        setServiceOptions(names.length ? names : FALLBACK_SERVICES);
      } catch {
        setServiceOptions(FALLBACK_SERVICES);
      }
    };

    loadServices();
  }, [isWorker, isOpen])

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setMessage('')
    setError('')
  }

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        setPreviewImage(result);
        setForm(prev => ({ ...prev, profilePicture: result }));
        setMessage('');
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!form.fullName || !form.phone || !geo.location?.trim() || (isWorker && !form.serviceCategory)) {
      setError(isWorker ? 'Full name, phone, service category and location are required' : 'Full name, phone and location are required')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const endpoint = isWorker ? '/worker/profile' : '/auth/customer/profile'
      
      // Build request body based on user type
      const locationPayload = {
        location: geo.location.trim(),
        latitude: geo.latitude,
        longitude: geo.longitude,
        placeId: geo.placeId,
      };
      let uploadedPicturePath = null
      if (isInlineImageValue(form.profilePicture)) {
        uploadedPicturePath = await uploadUserProfilePicture(
          form.profilePicture,
          userData?.type,
        )
      }

      const requestBody = isWorker ? {
        fullName: form.fullName,
        emailAddress: form.email,
        phoneNumber: form.phone,
        primaryServiceCategory: form.serviceCategory,
        ...locationPayload,
        availability: form.availability,
        ...(uploadedPicturePath ? { profilePicture: uploadedPicturePath } : {}),
      } : {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        ...locationPayload,
        ...(uploadedPicturePath ? { profilePicture: uploadedPicturePath } : {}),
      }

      const response = await apiRequestWithAuth(endpoint, {
        method: 'PUT',
        body: JSON.stringify(requestBody),
      })

      const apiProfile = response?.data || {}
      const category = isWorker
        ? (apiProfile.primaryServiceCategory ||
            apiProfile.serviceCategory ||
            form.serviceCategory)
        : form.serviceCategory

      // Update local storage and parent component
      const updatedUserData = {
        ...userData,
        ...apiProfile,
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        emailAddress: form.email,
        phoneNumber: form.phone,
        cnicNumber: form.cnic,
        ...(isWorker && {
          primaryServiceCategory: category,
          serviceCategory: category,
        }),
        ...locationPayload,
        address: geo.location,
        availability: form.availability,
        profilePicture:
          uploadedPicturePath ||
          (isInlineImageValue(form.profilePicture)
            ? userData?.profilePicture
            : form.profilePicture) ||
          apiProfile.profilePicture,
        type: userData?.type,
      }
      if (userData?.type) {
        setUserData(updatedUserData, userData.type)
      }
      onProfileUpdate(updatedUserData)
      
      setMessage('Profile updated successfully!')
      
      // Auto close after success
      setTimeout(() => {
        onClose()
        setMessage('')
      }, 2000)
      
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4" style={{ paddingTop: '100px' }}>
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div></div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-6">
            <div
              onClick={handleImageClick}
              className="relative w-24 h-24 rounded-full overflow-hidden cursor-pointer group border-4 border-orange-100 hover:border-orange-200 transition-all"
            >
              {previewImage ? (
                <img src={previewImage} alt="Profile Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-3xl font-bold">
                  {form.fullName?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={24} className="text-white" />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <p className="text-xs text-gray-500 mt-2">Click to change photo</p>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User size={16} className="inline mr-1" />
              Full Name
            </label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail size={16} className="inline mr-1" />
              Email Address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone size={16} className="inline mr-1" />
              Phone Number
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
              placeholder="Enter your phone number"
              required
            />
          </div>

          {isWorker ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ShieldCheck size={16} className="inline mr-1" />
                  CNIC
                </label>
                <input
                  type="text"
                  value={form.cnic}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  Worker Since
                </label>
                <input
                  type="text"
                  value={formatDate(userData?.joinDate || userData?.createdAt)}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Briefcase size={16} className="inline mr-1" />
                  Select Work
                </label>
                <select
                  value={form.serviceCategory}
                  onChange={(e) => handleInputChange('serviceCategory', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 bg-white"
                  required
                >
                  <option value="">Select work</option>
                  {serviceOptions.map(service => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
              </div>

              <LocationPicker label="Location" required value={geo} onChange={setGeo} />

              <label className="flex items-center gap-3 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.availability}
                  onChange={(e) => handleInputChange('availability', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-orange-500"
                />
                Available for work
              </label>

            </>
          ) : (
            <LocationPicker label="Location" required value={geo} onChange={setGeo} />
          )}

          {/* Messages */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              {message}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 border border-slate-300 text-orange-600 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save size={16} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
