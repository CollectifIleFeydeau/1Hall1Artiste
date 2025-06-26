import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Artist, artists } from '../data/artists';
import { Event } from '../data/events';

type InstagramCarouselProps = {
  artists?: Artist[];
  events?: Event[];
  title?: string;
};

export function InstagramCarousel({ artists, events, title = "Découvrez les artistes sur Instagram" }: InstagramCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  // Combine artists and events to get all Instagram profiles
  const profiles = (() => {
    const items: { name: string; instagram: string; id: string }[] = [];
    
    if (artists) {
      artists.forEach(artist => {
        if (artist.instagram) {
          items.push({
            name: artist.name,
            instagram: artist.instagram,
            id: artist.id
          });
        }
      });
    }
    
    if (events) {
      events.forEach(event => {
        // Récupérer les données de l'artiste associé à l'événement
        const artist = artists.find(a => a.id === event.artistId);
        if (artist && artist.instagram && artist.instagram.includes('instagram')) {
          items.push({
            name: event.artistName,
            instagram: artist.instagram,
            id: event.id
          });
        }
      });
    }
    
    return items;
  })();

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Function to extract username from Instagram URL
  const extractUsername = (url: string) => {
    return url.split('/').pop() || '';
  };

  // Function to open Instagram profile in a new tab
  const openInstagramProfile = (instagram: string) => {
    if (!instagram) return;
    
    // Make sure the URL has the correct format
    let url = instagram;
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }
    
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (profiles.length === 0) {
    return null;
  }

  return (
    <div className="w-full my-8">
      <h2 className="text-xl font-semibold mb-4 text-center">{title}</h2>
      
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {profiles.map((profile, index) => (
            <div 
              key={profile.id} 
              className="flex-[0_0_80%] sm:flex-[0_0_40%] md:flex-[0_0_33%] lg:flex-[0_0_25%] min-w-0 px-2"
            >
              <div 
                className="bg-white rounded-lg shadow-md p-4 h-full flex flex-col items-center cursor-pointer"
                onClick={() => openInstagramProfile(profile.instagram)}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 flex items-center justify-center mb-3">
                  <div className="w-[58px] h-[58px] rounded-full bg-white flex items-center justify-center">
                    <div className="w-[54px] h-[54px] rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      <img 
                        src={`https://unavatar.io/instagram/${extractUsername(profile.instagram)}`}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // If image fails to load, replace with first letter of name
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="54" height="54" viewBox="0 0 54 54"><rect width="54" height="54" fill="%23f3f4f6"/><text x="50%" y="50%" font-family="Arial" font-size="24" fill="%236b7280" text-anchor="middle" dominant-baseline="middle">' + profile.name.charAt(0).toUpperCase() + '</text></svg>';
                        }}
                      />
                    </div>
                  </div>
                </div>
                <h3 className="font-medium text-center truncate w-full">{profile.name}</h3>
                <p className="text-sm text-blue-600 mt-1 truncate w-full text-center">@{extractUsername(profile.instagram)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Dots for navigation */}
      {scrollSnaps.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === selectedIndex ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              onClick={() => scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
