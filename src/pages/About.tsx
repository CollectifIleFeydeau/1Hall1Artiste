import { useState } from "react";
import { NavigationButton } from "@/components/ui/NavigationButton";
import { BackButton } from "@/components/ui/BackButton";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, Heart } from "lucide-react";
import Instagram from "lucide-react/dist/esm/icons/instagram";
import Twitter from "lucide-react/dist/esm/icons/twitter";
import Mail from "lucide-react/dist/esm/icons/mail";
import { useNavigate } from "react-router-dom";
import { aboutInfo } from "@/data/about";
import { associationInfo } from "@/data/association";
import { teamMembers } from "@/data/team";
import { ShareButton } from "@/components/ShareButton";
import { BottomNavigation } from "@/components/BottomNavigation";
import { getImagePath } from "@/utils/imagePaths";
import { IMAGE_PATHS } from "../constants/imagePaths";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-20 px-4 pt-4 overflow-x-hidden" style={{
      backgroundImage: `url('${IMAGE_PATHS.BACKGROUNDS.PARCHMENT}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      {/* Overlay pour améliorer la lisibilité */}
      <div className="absolute inset-0 bg-white/20" />
      
      <div className="relative z-10 max-w-screen-lg mx-auto">
        <header className="mb-2 flex items-center justify-between">
          <BackButton to="/map" />
          <h1 className="text-xl font-bold text-[#4a5d94]">À propos</h1>
          <ShareButton 
            title="À propos du Collectif Île Feydeau" 
            text="Découvrez l'histoire et la mission du Collectif Île Feydeau à Nantes!" 
          />
        </header>
        
        <div className="bg-transparent rounded-xl p-4 mb-6">
          <Tabs defaultValue="association" className="w-full">
            <TabsList className="bg-transparent p-0 h-auto gap-2 mb-4 flex flex-wrap justify-center">
              <TabsTrigger 
                value="association" 
                className="bg-white/70 text-[#1a2138] data-[state=active]:bg-[#1a2138] data-[state=active]:text-white data-[state=active]:border-[#1a2138] rounded-full px-4 py-2 border border-gray-300 hover:bg-white transition-all duration-200 text-sm font-medium shadow-sm"
              >
                Association
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="bg-white/70 text-[#1a2138] data-[state=active]:bg-[#1a2138] data-[state=active]:text-white data-[state=active]:border-[#1a2138] rounded-full px-4 py-2 border border-gray-300 hover:bg-white transition-all duration-200 text-sm font-medium shadow-sm"
              >
                Histoire
              </TabsTrigger>
              <TabsTrigger 
                value="team" 
                className="bg-white/70 text-[#1a2138] data-[state=active]:bg-[#1a2138] data-[state=active]:text-white data-[state=active]:border-[#1a2138] rounded-full px-4 py-2 border border-gray-300 hover:bg-white transition-all duration-200 text-sm font-medium shadow-sm"
              >
                Équipes
              </TabsTrigger>
              <TabsTrigger 
                value="support" 
                className="bg-white/70 text-[#1a2138] data-[state=active]:bg-[#1a2138] data-[state=active]:text-white data-[state=active]:border-[#1a2138] rounded-full px-4 py-2 border border-gray-300 hover:bg-white transition-all duration-200 text-sm font-medium shadow-sm"
              >
                Nous aider
              </TabsTrigger>
            </TabsList>
          
          <TabsContent value="history" className="space-y-4">
            <div className="bg-transparent rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-3">Histoire de l'Île Feydeau</h2>
              <p className="text-gray-700 mb-4">
                L'Île Feydeau est un quartier historique de Nantes, construit au XVIIIe siècle sur une île de la Loire. 
                Ce lotissement, conçu par l'architecte Jean-Baptiste Ceineray, est un exemple remarquable 
                d'architecture néoclassique et témoigne de la prospérité des armateurs et négociants nantais de l'époque.
              </p>
              
              <div className="mt-4 flex justify-center">
                <NavigationButton 
                  variant="outline" 
                  to="/location-history"
                >
                  Voir l'histoire détaillée des lieux 
                </NavigationButton>
              </div>

              
              <div className="mt-8"></div>
              <h2 className="text-lg font-semibold mb-3">Architecture unique</h2>
              <p className="text-gray-700 mb-4">
                Les immeubles de l'Île Feydeau se caractérisent par leurs façades ornées de mascarons, 
                leurs balcons en fer forgé et leur soubassement en granit. L'affaissement des bâtiments, 
                dû à la nature marécageuse du sol, confère à l'ensemble une silhouette légèrement penchée, 
                caractéristique de ce quartier.
              </p>
              

              
              <h2 className="text-lg font-semibold mb-3">Patrimoine préservé</h2>
              <p className="text-gray-700 mb-4">
                Aujourd'hui, l'Île Feydeau n'est plus une île suite aux travaux de comblement de la Loire, 
                mais son patrimoine architectural est préservé et valorisé. De nombreux immeubles sont classés 
                ou inscrits aux Monuments Historiques, témoignant de l'importance de ce quartier dans l'histoire de Nantes.
              </p>
              

            </div>
          </TabsContent>
          
          <TabsContent value="association" className="space-y-4">
          <div className="flex items-center justify-center space-x-6 mt-1 mb-2 p-1 bg-transparent rounded-lg">
                <a 
                  href="https://www.instagram.com/ilefeydeau/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-700 hover:text-[#E1306C] transition-colors duration-200"
                  title="Suivez-nous sur Instagram"
                >
                  <Instagram size={28} />
                </a>
                <a 
                  href="https://x.com/Ilefeydeau" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-700 hover:text-[#1DA1F2] transition-colors duration-200"
                  title="Suivez-nous sur Twitter"
                >
                  <Twitter size={28} />
                </a>
                <a 
                  href={`mailto:${associationInfo.contactEmail}`} 
                  className="text-gray-700 hover:text-[#4285F4] transition-colors duration-200"
                  title="Contactez-nous par email"
                >
                  <Mail size={28} />
                </a>
              </div>
            <div className="bg-transparent rounded-lg p-1 mb-1">
              <h2 className="text-lg font-semibold mb-1">Découvrez notre collectif en vidéo</h2>
              <div className="aspect-video w-full bg-gray-100 rounded overflow-hidden">
                <video 
                  className="w-full h-full object-contain" 
                  controls 
                  playsInline
                  poster={getImagePath("intro-video-image.png")}
                  src={getImagePath("/video/intro-video.mp4")}
                  aria-label="Vidéo de présentation du Collectif Île Feydeau"
                />
              </div>
            </div>

             
            <div className="bg-transparent rounded-lg p-6">
              
              <h2 className="text-lg font-semibold mb-3">Notre histoire</h2>
              <p className="text-gray-700 mb-4">
                {aboutInfo.history}
              </p>
              
              <h2 className="text-lg font-semibold mb-3">Notre mission</h2>
              <p className="text-gray-700 mb-4">
                {aboutInfo.mission}
              </p>
              
              <h2 className="text-lg font-semibold mb-3">Notre quartier</h2>
              <p className="text-gray-700 mb-4">
                {aboutInfo.neighborhood}
              </p>
              
              <h2 className="text-lg font-semibold mb-3">Événement annuel</h2>
              <p className="text-gray-700 mb-4">
                {aboutInfo.event}
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="team" className="space-y-4">
            <div className="bg-transparent rounded-lg p-6 mb-4">
              <p className="text-gray-700">
                Notre association compte {associationInfo.memberCount} membres actifs, tous habitants du quartier et passionnés 
                par sa valorisation. Voici quelques-uns des membres du bureau qui coordonnent nos actions.
              </p>
            </div>
            
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div key={member.id} className="bg-white/70 rounded-xl p-4 border border-gray-200/50 shadow-sm hover:shadow-md hover:bg-white transition-all duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="min-w-[48px] w-12 h-12 bg-gradient-to-br from-[#1a2138] to-[#4a5d94] rounded-full flex items-center justify-center overflow-hidden shadow-sm">
                      <span className="text-white font-semibold text-center text-sm">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#1a2138] truncate">{member.name}</h3>
                      <p className="text-sm text-[#f59e0b] font-medium">{member.role}</p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2 leading-relaxed">{member.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="support" className="space-y-4">
            <div className="bg-transparent rounded-lg p-6 mb-4">
              <h2 className="text-lg font-semibold mb-3">Comment nous aider ?</h2>
              <p className="text-gray-700 mb-4">
                Plusieurs façons s'offrent à vous pour soutenir notre association et contribuer 
                à la préservation et l'animation de ce lieu historique de Nantes.
              </p>
              
              <div className="space-y-4 mt-6">
                <div className="border-l-4 border-red-500 pl-4 py-2">
                  <h3 className="font-medium">
                    Faire un don
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Soutenez financièrement nos actions de préservation et de valorisation du patrimoine.
                  </p>
                  <NavigationButton 
                    variant="outline" 
                    size="sm" 
                    to="/donate"
                    icon={<Heart className="h-4 w-4 text-red-500" />}
                    className="mt-2"
                  >
                    Accéder à la page de don
                  </NavigationButton>
                </div>
                
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <h3 className="font-medium">
                    Devenir membre
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Rejoignez notre équipe de bénévoles et participez activement à nos projets.
                    Contactez-nous à <a href={`mailto:${associationInfo.contactEmail}`} className="text-blue-600 hover:underline">{associationInfo.contactEmail}</a>.
                  </p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <h3 className="font-medium">
                    Proposer une idée
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Vous avez des idées pour améliorer notre événement annuel ou pour d'autres projets ? 
                    Contactez-nous à <a href={`mailto:${associationInfo.contactEmail}`} className="text-blue-600 hover:underline">{associationInfo.contactEmail}</a>
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default About;



