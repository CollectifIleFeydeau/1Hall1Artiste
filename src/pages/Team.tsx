
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

type TeamMember = {
  id: string;
  name: string;
  role: string;
  description: string;
};

const Team = () => {
  const navigate = useNavigate();

  const team: TeamMember[] = [
    {
      id: "member1",
      name: "Claire Martin",
      role: "Présidente",
      description: "Fondatrice de l'association et passionnée d'histoire locale."
    },
    {
      id: "member2",
      name: "Thomas Rivière",
      role: "Trésorier",
      description: "En charge des finances et de la logistique des événements."
    },
    {
      id: "member3",
      name: "Sophie Laurent",
      role: "Secrétaire",
      description: "Coordonne les communications et les partenariats artistiques."
    },
    {
      id: "member4",
      name: "Marc Dubois",
      role: "Programmation artistique",
      description: "Sélectionne les artistes et organise les expositions."
    },
    {
      id: "member5",
      name: "Émilie Blanc",
      role: "Communication",
      description: "Gère la présence en ligne et les relations avec la presse."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 p-4">
      <div className="max-w-md mx-auto">
        <header className="mb-4 flex items-center">
          <Button variant="ghost" size="sm" onClick={() => navigate("/home")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-xl font-bold ml-2">Notre équipe</h1>
        </header>
        
        <div className="bg-white rounded-lg p-6 shadow-md mb-6">
          <p className="text-gray-700 mb-4">
            Notre association compte 20 membres actifs, tous habitants du quartier et passionnés 
            par sa valorisation. Voici quelques-uns des membres du bureau qui coordonnent nos actions.
          </p>
        </div>
        
        <div className="space-y-4">
          {team.map((member) => (
            <Card key={member.id}>
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
