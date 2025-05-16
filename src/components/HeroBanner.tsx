import React from 'react';

interface HeroBannerProps {
  title: string;
  subtitle: string;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ title, subtitle }) => {
  return (
    <div className="relative overflow-hidden mb-6">
      <div className="h-48 rounded-lg flex items-center justify-center p-6 text-white relative">
        {/* Background image with overlay */}
        <div className="absolute inset-0 bg-black/40 z-10 rounded-lg"></div>
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center rounded-lg"
          style={{ 
            backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Journ%C3%A9es_europ%C3%A9ennes_du_patrimoine_2018_-_Strasbourg_-_H%C3%B4tel_de_Klinglin_-_01.jpg/1280px-Journ%C3%A9es_europ%C3%A9ennes_du_patrimoine_2018_-_Strasbourg_-_H%C3%B4tel_de_Klinglin_-_01.jpg')` 
          }}
        ></div>
        <div className="text-center z-20 relative">
          <h1 className="text-2xl font-bold mb-2">{title}</h1>
          <p className="text-sm mb-4">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};
