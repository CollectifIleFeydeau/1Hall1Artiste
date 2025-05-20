
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Heart, Users } from "lucide-react";
import Mail from "lucide-react/dist/esm/icons/mail";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";

type ContactFormValues = {
  name: string;
  email: string;
  supportType: "join" | "donate" | "idea";
  message: string;
  newsletter: boolean;
};

const Support = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"join" | "donate" | "idea">("join");
  
  const form = useForm<ContactFormValues>({
    defaultValues: {
      name: "",
      email: "",
      supportType: "join",
      message: "",
      newsletter: false
    }
  });
  
  const onSubmit = (data: ContactFormValues) => {
    console.log("Form submitted:", data);
    toast({
      title: "Merci pour votre soutien !",
      description: "Nous avons bien reçu votre message et reviendrons vers vous rapidement.",
    });
    form.reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 p-4">
      <div className="max-w-md mx-auto pb-10">
        <header className="mb-4 flex items-center">
          <Button variant="ghost" size="sm" onClick={() => navigate("/map")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-xl font-bold ml-2">Nous soutenir</h1>
        </header>
        
        <div className="bg-white rounded-lg p-6 shadow-md mb-6">
          <p className="text-gray-700 mb-4">
            Plusieurs façons s'offrent à vous pour soutenir notre association et contribuer 
            à la préservation et l'animation de ce lieu historique de Nantes.
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-6">
          <Button 
            variant={activeTab === "join" ? "default" : "outline"} 
            onClick={() => setActiveTab("join")}
            className="flex flex-col items-center py-3 h-auto"
          >
            <Users className="h-5 w-5 mb-1" />
            <span className="text-xs">Rejoindre</span>
          </Button>
          <Button 
            variant={activeTab === "donate" ? "default" : "outline"} 
            onClick={() => setActiveTab("donate")}
            className="flex flex-col items-center py-3 h-auto"
          >
            <Heart className="h-5 w-5 mb-1" />
            <span className="text-xs">Donner</span>
          </Button>
          <Button 
            variant={activeTab === "idea" ? "default" : "outline"} 
            onClick={() => setActiveTab("idea")}
            className="flex flex-col items-center py-3 h-auto"
          >
            <Mail className="h-5 w-5 mb-1" />
            <span className="text-xs">Proposer</span>
          </Button>
        </div>
        
        {activeTab === "join" && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">Rejoindre l'association</h3>
              <p className="text-sm text-gray-600 mb-4">
                Vous habitez le quartier ou êtes passionné par notre mission ? 
                Rejoignez notre équipe de bénévoles et participez activement à nos projets.
              </p>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <input type="hidden" {...form.register("supportType")} value="join" />
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom complet</FormLabel>
                        <FormControl>
                          <Input placeholder="Votre nom" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="votre@email.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Votre motivation</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Parlez-nous de vous et de ce qui vous motive à rejoindre l'association..." 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="newsletter"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Je souhaite recevoir la newsletter
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full">Envoyer ma demande</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
        
        {activeTab === "donate" && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">Faire un don</h3>
              <p className="text-sm text-gray-600 mb-4">
                Votre soutien financier nous aide à maintenir et améliorer ce lieu historique, 
                et à organiser des événements culturels de qualité.
              </p>
              
              <div className="space-y-4">
                <RadioGroup defaultValue="option-one" className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option-one" id="option-one" />
                    <FormLabel htmlFor="option-one">Don ponctuel</FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option-two" id="option-two" />
                    <FormLabel htmlFor="option-two">Don mensuel</FormLabel>
                  </div>
                </RadioGroup>
                
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline">5€</Button>
                  <Button variant="outline">10€</Button>
                  <Button variant="outline">20€</Button>
                  <Button variant="outline">50€</Button>
                  <Button variant="outline">100€</Button>
                  <Button variant="outline">Autre</Button>
                </div>
                
                <Button className="w-full">Faire un don</Button>
                
                <p className="text-xs text-gray-500 text-center mt-4">
                  Les dons à notre association sont déductibles des impôts à hauteur de 66%.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {activeTab === "idea" && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">Proposer une idée</h3>
              <p className="text-sm text-gray-600 mb-4">
                Vous avez des idées pour améliorer notre événement annuel ou pour d'autres projets ? 
                Partagez vos suggestions avec nous.
              </p>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <input type="hidden" {...form.register("supportType")} value="idea" />
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom complet</FormLabel>
                        <FormControl>
                          <Input placeholder="Votre nom" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="votre@email.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Votre idée</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Décrivez votre idée ou suggestion..." 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="newsletter"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Je souhaite recevoir la newsletter
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full">Envoyer ma suggestion</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Support;
