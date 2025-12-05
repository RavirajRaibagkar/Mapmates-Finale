'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Place } from '@/types';
import { Button } from '@/components/ui/Button';
import { Check, X } from 'lucide-react';
import { addMapos } from '@/lib/api/mapos';
import toast from 'react-hot-toast';

export const PlaceApproval = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const supabase = createClient();

  useEffect(() => {
    fetchPendingPlaces();
  }, []);

  const fetchPendingPlaces = async () => {
    const { data } = await supabase
      .from('places')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (data) setPlaces(data as Place[]);
  };

  const handleApprove = async (place: Place) => {
    await (supabase as any)
      .from('places')
      .update({ status: 'approved' })
      .eq('id', place.id);

    await addMapos(place.submitted_by, 50, 'Place approved');
    toast.success('Place approved! User rewarded 50 Mapos');
    fetchPendingPlaces();
  };

  const handleReject = async (placeId: string) => {
    await (supabase as any)
      .from('places')
      .update({ status: 'rejected' })
      .eq('id', placeId);

    toast.success('Place rejected');
    fetchPendingPlaces();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">
        Place Approvals ({places.length} pending)
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {places.map((place) => (
          <div key={place.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Image Gallery */}
            <div className="relative">
              {place.images && place.images.length > 0 ? (
                <div className="relative h-64">
                  <img
                    src={place.images[0]}
                    alt={place.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image load error:', place.images[0]);
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage Load Error%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  {place.images.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                      +{place.images.length - 1} more
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-64 bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500">No images uploaded</p>
                </div>
              )}
              
              {/* All images preview */}
              {place.images && place.images.length > 1 && (
                <div className="grid grid-cols-4 gap-1 p-2 bg-gray-50">
                  {place.images.slice(1, 5).map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${place.name} ${idx + 2}`}
                      className="w-full h-16 object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ))}
                </div>
              )}
              
              {/* Debug info */}
              {place.images && place.images.length > 0 && (
                <div className="p-2 bg-blue-50 text-xs">
                  <p className="text-blue-700">
                    {place.images.length} image(s) uploaded
                  </p>
                </div>
              )}
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{place.name}</h3>
              <p className="text-gray-600 mb-4">{place.description}</p>
              
              <div className="space-y-2 mb-4">
                <p className="text-sm"><span className="font-semibold">Category:</span> {place.category}</p>
                <p className="text-sm"><span className="font-semibold">Budget:</span> {place.budget}</p>
                <p className="text-sm"><span className="font-semibold">Address:</span> {place.address}</p>
                <p className="text-sm"><span className="font-semibold">Location:</span> {place.location?.lat?.toFixed(4)}, {place.location?.lng?.toFixed(4)}</p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => handleApprove(place)}
                  variant="primary"
                  className="flex-1"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleReject(place.id)}
                  variant="danger"
                  className="flex-1"
                >
                  <X className="w-5 h-5 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {places.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No pending places to review
        </div>
      )}
    </div>
  );
};
