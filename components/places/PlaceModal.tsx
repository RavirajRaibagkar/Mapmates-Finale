'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Place, Review } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { Star, MapPin, Heart, Bookmark, Navigation, Map } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface PlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  place: Place;
  userId: string;
}

export const PlaceModal = ({ isOpen, onClose, place, userId }: PlaceModalProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      fetchReviews();
      checkIfSaved();
    }
  }, [isOpen, place.id]);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*, profiles(*)')
      .eq('place_id', place.id)
      .order('created_at', { ascending: false });
    
    if (data) setReviews(data as any);
  };

  const checkIfSaved = async () => {
    const { data } = await supabase
      .from('saved_places')
      .select('id')
      .eq('user_id', userId)
      .eq('place_id', place.id)
      .single();
    
    setIsSaved(!!data);
  };

  const handleSave = async () => {
    if (isSaved) {
      await (supabase as any)
        .from('saved_places')
        .delete()
        .eq('user_id', userId)
        .eq('place_id', place.id);
      setIsSaved(false);
      toast.success('Removed from saved places');
    } else {
      await (supabase as any)
        .from('saved_places')
        .insert({ user_id: userId, place_id: place.id });
      setIsSaved(true);
      toast.success('Saved to your wishlist!');
    }
  };

  const handleLike = async () => {
    await (supabase as any)
      .from('places')
      .update({ likes: place.likes + 1 })
      .eq('id', place.id);
    toast.success('Liked!');
  };

  const openDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.location.lat},${place.location.lng}`;
    window.open(url, '_blank');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="relative">
        {/* Image Gallery */}
        <div className="relative h-96 bg-gray-900">
          <motion.img
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            src={place.images[currentImageIndex] || '/placeholder.jpg'}
            alt={place.name}
            className="w-full h-full object-cover"
          />
          
          {place.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {place.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentImageIndex ? 'bg-white w-8' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{place.name}</h2>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{place.rating.toFixed(1)}</span>
                  <span className="text-sm">({reviews.length} reviews)</span>
                </div>
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {place.budget}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} variant="ghost" size="sm">
                <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-purple-600' : ''}`} />
              </Button>
              <Button onClick={handleLike} variant="ghost" size="sm">
                <Heart className="w-5 h-5" />
                <span>{place.likes}</span>
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-600 mb-4">
            <MapPin className="w-5 h-5" />
            <span>{place.address}</span>
          </div>

          <p className="text-gray-700 mb-6">{place.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <Button onClick={() => { onClose(); router.push('/dashboard'); }} variant="secondary">
              <Map className="w-5 h-5 mr-2" />
              View on Map
            </Button>
            <Button onClick={openDirections}>
              <Navigation className="w-5 h-5 mr-2" />
              Get Directions
            </Button>
          </div>

          {/* Reviews */}
          <div className="border-t pt-6">
            <h3 className="text-xl font-bold mb-4">Reviews</h3>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-2xl">{(review.user as any)?.avatar_emoji}</div>
                    <div>
                      <p className="font-semibold">{(review.user as any)?.username}</p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
