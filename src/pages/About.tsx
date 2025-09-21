import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, Heart } from "lucide-react";
import Instagram from "lucide-react/dist/esm/icons/instagram";
import Twitter from "lucide-react/dist/esm/icons/twitter";
import { useNavigate } from "react-router-dom";
import { aboutInfo } from "@/data/about";
import { associationInfo } from "@/data/association";
import { teamMembers } from "@/data/team";
import { ShareButton } from "@/components/ShareButton";
import { BottomNavigation } from "@/components/BottomNavigation";
import { getImagePath } from "@/utils/imagePaths";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen app-gradient pb-20 px-4 pt-4 overflow-x-hidden">
      <div className="max-w-screen-lg mx-auto">
        <header className="mb-2 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/map")}> 
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-xl font-bold text-[#4a5d94]">À propos</h1>
          <ShareButton 
            title="À propos du Collectif Île Feydeau" 
            text="Découvrez l'histoire et la mission du Collectif Île Feydeau à Nantes!" 
          />
        </header>
        
        <Tabs defaultValue="association" className="w-full mb-6">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="association">Association</TabsTrigger>
            <TabsTrigger value="history">Histoire</TabsTrigger>
            <TabsTrigger value="team">Équipes</TabsTrigger>
            <TabsTrigger value="support">Nous aider</TabsTrigger>
          </TabsList>
          
          <TabsContent value="history" className="space-y-4">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-lg font-semibold mb-3">Histoire de l'Île Feydeau</h2>
              <p className="text-gray-700 mb-4">
                L'Île Feydeau est un quartier historique de Nantes, construit au XVIIIe siècle sur une île de la Loire. 
                Ce lotissement, conçu par l'architecte Jean-Baptiste Ceineray, est un exemple remarquable 
                d'architecture néoclassique et témoigne de la prospérité des armateurs et négociants nantais de l'époque.
              </p>
              
              <div className="mt-4 flex justify-center">
                <Button 
                  variant="outline" 
                  className="border-[#4a5d94] text-[#4a5d94] hover:bg-[#4a5d94] hover:text-white"
                  onClick={() => navigate("/location-history")}
                >
                  Voir l'histoire détaillée des lieux 
                </Button>
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
          <div className="flex flex-col md:flex-row items-center justify-center md:space-x-4 space-y-3 md:space-y-0 mt-4 mb-2 p-4 bg-white rounded-lg shadow-md">
                <a href="https://www.instagram.com/ilefeydeau/" target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-700 hover:text-[#E1306C] transition-colors w-full md:w-auto justify-center">
                  <Instagram className="h-5 w-5 mr-2" />
                  <span>@ilefeydeau</span>
                </a>
                <a href="https://x.com/Ilefeydeau" target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-700 hover:text-[#1DA1F2] transition-colors w-full md:w-auto justify-center">
                  <Twitter className="h-5 w-5 mr-2" />
                  <span>@Ilefeydeau</span>
                </a>
                <a href={`mailto:${associationInfo.contactEmail}`} className="flex items-center text-gray-700 hover:text-[#4285F4] transition-colors w-full md:w-auto justify-center break-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2 flex-shrink-0">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <span className="truncate">{associationInfo.contactEmail}</span>
                </a>
              </div>
            <div className="bg-white rounded-lg p-6 shadow-md mb-4">
              <h2 className="text-lg font-semibold mb-3">Découvrez notre collectif en vidéo</h2>
              <div className="aspect-video w-full mb-4 bg-gray-100 rounded overflow-hidden">
                <video 
                  className="w-full h-full object-contain" 
                  controls 
                  playsInline
                  poster={getImagePath("intro-video-image.png")}
                  src={getImagePath("/video/intro-video.mp4")}
                  aria-label="Vidéo de présentation du Collectif Île Feydeau"
                />
              </div>
              <p className="text-gray-700 text-sm italic text-center">
                Vidéo d'introduction du Collectif Île Feydeau (45 secondes)
              </p>
            </div>

             
            <div className="bg-white rounded-lg p-6 shadow-md">
              
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
            <div className="bg-white rounded-lg p-6 shadow-md mb-4">
              <p className="text-gray-700">
                Notre association compte {associationInfo.memberCount} membres actifs, tous habitants du quartier et passionnés 
                par sa valorisation. Voici quelques-uns des membres du bureau qui coordonnent nos actions.
              </p>
            </div>
            
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <Card key={member.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="min-w-[48px] w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center overflow-hidden">
                        <span className="text-purple-600 font-semibold text-center">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{member.name}</h3>
                        <p className="text-sm text-purple-600">{member.role}</p>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{member.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="support" className="space-y-4">
            <div className="bg-white rounded-lg p-6 shadow-md mb-4">
              <h2 className="text-lg font-semibold mb-3">Comment nous aider ?</h2>
              <p className="text-gray-700 mb-4">
                Plusieurs façons s'offrent à vous pour soutenir notre association et contribuer 
                à la préservation et l'animation de ce lieu historique de Nantes.
              </p>
              
              <div className="space-y-4 mt-6">
                <div className="border-l-4 border-red-500 pl-4 py-2">
                  <h3 className="font-medium flex items-center">
                    <Heart className="h-5 w-5 mr-2 text-red-500" />
                    Faire un don
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Soutenez financièrement nos actions de préservation et de valorisation du patrimoine.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2" 
                    onClick={() => navigate("/donate")}
                  >
                    <Heart className="h-4 w-4 mr-2 text-red-500" />
                    Accéder à la page de don
                  </Button>
                </div>
                
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <h3 className="font-medium flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-500" />
                    Devenir membre
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Rejoignez notre équipe de bénévoles et participez activement à nos projets.
                    Contactez-nous à <a href={`mailto:${associationInfo.contactEmail}`} className="text-blue-600 hover:underline">{associationInfo.contactEmail}</a>.
                  </p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <h3 className="font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2 text-green-500">
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
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
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default About;
