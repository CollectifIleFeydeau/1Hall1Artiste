import React, { useState, useEffect } from 'react';
import Heart from 'lucide-react/dist/esm/icons/heart';

interface LikesCounterProps {
  entryId: string;
  className?: string;
}

export const LikesCounter: React.FC<LikesCounterProps> = ({ entryId, className }) => {
  const [likesCount, setLikesCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const response = await fetch(
          `https://collectif-feydeau-default-rtdb.europe-west1.firebasedatabase.app/likes-data/${entryId}.json`
        );
        
        if (response.ok) {
          const likeData = await response.json();
          setLikesCount(likeData?.likes || 0);
        } else {
          setLikesCount(0);
        }
      } catch (error) {
        console.warn(`Erreur lors de la récupération des likes pour ${entryId}:`, error);
        setLikesCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchLikes();
  }, [entryId]);

  if (loading) {
    return (
      <div className={`flex items-center gap-1 text-gray-400 ${className}`}>
        <Heart className="h-4 w-4" />
        <span className="text-sm">...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${likesCount && likesCount > 0 ? 'text-red-500' : 'text-gray-400'} ${className}`}>
      <Heart className={`h-4 w-4 ${likesCount && likesCount > 0 ? 'fill-current' : ''}`} />
      <span className="text-sm font-medium">{likesCount || 0}</span>
    </div>
  );
};

