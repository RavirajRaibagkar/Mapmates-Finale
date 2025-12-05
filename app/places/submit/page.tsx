'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SubmitPlacePage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Restaurant',
    address: '',
    budget: '',
    lat: '',
    lng: '',
    photos: [] as File[]
  });
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const router = useRouter();
  const supabase = createClient();

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      setFormData(prev => ({
        ...prev,
        lat: position.coords.latitude.toString(),
        lng: position.coords.longitude.toString()
      }));

      toast.success('Location detected!');
    } catch (error) {
      toast.error('Failed to get location. Please enter manually.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + formData.photos.length > 5) {
      toast.error('Maximum 5 photos allowed');
      return;
    }

    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...files]
    }));

    // Create preview URLs
    const newUrls = files.map(file => URL.createObjectURL(file));
    setPhotoUrls(prev => [...prev, ...newUrls]);
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
    setPhotoUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Upload photos if any
      let uploadedImages: string[] = [];
      if (formData.photos.length > 0) {
        toast.loading(`Uploading ${formData.photos.length} images...`);
        
        for (const photo of formData.photos) {
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${photo.name}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('place-images')
            .upload(fileName, photo, {
              cacheControl: '3600',
              upsert: false
            });
          
          if (uploadError) {
            console.error('Upload error:', uploadError);
            
            // Check if bucket doesn't exist
            if (uploadError.message?.includes('Bucket not found')) {
              toast.dismiss();
              toast.error('Storage bucket not set up! Please create "place-images" bucket in Supabase Storage.');
              toast.error('See FIX_IMAGE_UPLOAD.md for setup instructions', { duration: 5000 });
              // Continue without images
              break;
            }
            
            toast.error(`Failed to upload ${photo.name}: ${uploadError.message}`);
            continue;
          }
          
          if (uploadData) {
            const { data: { publicUrl } } = supabase.storage
              .from('place-images')
              .getPublicUrl(fileName);
            
            console.log('Uploaded image URL:', publicUrl);
            uploadedImages.push(publicUrl);
          }
        }
        
        toast.dismiss();
        if (uploadedImages.length > 0) {
          toast.success(`${uploadedImages.length} images uploaded successfully!`);
        } else if (formData.photos.length > 0) {
          toast('Place will be submitted without images. Set up storage bucket to enable image uploads.', { 
            icon: '⚠️',
            duration: 5000 
          });
        }
      }

      const placeData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        address: formData.address,
        budget: formData.budget,
        location: { lat: parseFloat(formData.lat), lng: parseFloat(formData.lng) },
        rating: 0,
        images: uploadedImages,
        likes: 0,
        status: 'pending',
        submitted_by: session.user.id
      };

      console.log('Submitting place with data:', placeData);
      console.log('Images array:', uploadedImages);

      const { error } = await (supabase as any).from('places').insert(placeData);

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      toast.success(`Place submitted for review! ${uploadedImages.length} images uploaded. You'll earn 50 Mapos once approved.`);
      router.push('/places');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.push('/places')}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
          Submit a New Place
        </h1>

        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 mb-6 border-2 border-purple-200">
          <p className="text-center text-gray-700">
            🎉 Earn 50 Mapos when your place gets approved!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <Input
            label="Place Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors"
            >
              <option>Restaurant</option>
              <option>Cafe</option>
              <option>Tourist Spot</option>
              <option>Shopping</option>
              <option>Entertainment</option>
            </select>
          </div>

          <Input
            label="Address"
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Budget (₹)</label>
            <Input
              type="number"
              min="0"
              step="100"
              required
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              placeholder="e.g., 500, 1000, 2000"
            />
            <p className="text-xs text-gray-500 mt-1">Enter approximate cost per person in ₹</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <div className="space-y-4">
              <Button
                type="button"
                onClick={getCurrentLocation}
                isLoading={locationLoading}
                variant="secondary"
                className="w-full"
              >
                📍 Auto-Detect My Location
              </Button>
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Latitude"
                  type="number"
                  step="any"
                  required
                  value={formData.lat}
                  onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                  placeholder="18.5204"
                />
                <Input
                  label="Longitude"
                  type="number"
                  step="any"
                  required
                  value={formData.lng}
                  onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                  placeholder="73.8567"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Photos (Max 5)</label>
            <div className="space-y-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors"
              />
              
              {photoUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {photoUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" isLoading={loading}>
            Submit Place
          </Button>
        </form>
      </div>
    </div>
  );
}
