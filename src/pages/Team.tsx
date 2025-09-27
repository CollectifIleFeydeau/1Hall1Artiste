
import { ActionButton } from "@/components/ui/ActionButton";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { teamMembers } from "@/data/team";
import { associationInfo } from "@/data/association";

const Team = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-20 px-4 pt-4 overflow-x-hidden" style={{
      backgroundImage: `url('/images/background/small/Historical_Parchment_Background_Portrait.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      {/* Overlay pour améliorer la lisibilité */}
      <div className="absolute inset-0 bg-white/20" />
      
      <div className="relative z-10 max-w-md mx-auto">
        <header className="mb-4 flex items-center justify-between">
          <ActionButton variant="ghost" size="sm" onClick={() => navigate("/map")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </ActionButton>
          <h1 className="text-xl font-bold text-[#4a5d94]">Notre équipe</h1>
          <div className="w-20"></div>
        </header>
        
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 border-2 border-amber-300 shadow-lg mb-6">
          <p className="text-gray-700 mb-4">
            Notre association compte {associationInfo.memberCount} membres actifs, tous habitants du quartier et passionnés 
            par sa valorisation. Voici quelques-uns des membres du bureau qui coordonnent nos actions.
          </p>
        </div>
        
        <div className="space-y-4">
          {teamMembers.map((member) => (
            <Card key={member.id} className="bg-white/90 backdrop-blur-sm border-2 border-amber-300 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-semibold">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium">{member.name}</h3>
                    <p className="text-sm text-purple-600">{member.role}</p>
                    <p className="text-sm text-gray-500 mt-1">{member.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Team;
