import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createLogger } from "@/utils/logger";
import Lock from 'lucide-react/dist/esm/icons/lock';

// Créer un logger pour le composant AdminLogin
const logger = createLogger('AdminLogin');

// Code PIN pour l'accès administrateur
const ADMIN_PIN = '5321';

interface AdminLoginProps {
  onLogin: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === ADMIN_PIN) {
      logger.info('Connexion administrateur réussie');
      
      // Stocker l'état d'authentification dans sessionStorage (valide jusqu'à la fermeture du navigateur)
      sessionStorage.setItem('adminAuthenticated', 'true');
      
      // Appeler le callback de connexion
      onLogin();
    } else {
      logger.warn('Tentative de connexion administrateur échouée');
      setError(true);
      setAttempts(attempts + 1);
      setPassword('');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-[#4a5d94] p-3 rounded-full">
              <Lock className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center text-[#4a5d94]">
            Accès Administrateur
          </CardTitle>
          <CardDescription className="text-center">
            Veuillez entrer le mot de passe pour accéder à l'interface d'administration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Code PIN</Label>
                <Input
                  id="password"
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={password}
                  onChange={(e) => {
                    // Limiter à 4 chiffres
                    if (e.target.value.length <= 4) {
                      setPassword(e.target.value);
                      if (error) setError(false);
                    }
                  }}
                  className={`text-center text-2xl tracking-widest ${error ? "border-red-500" : ""}`}
                  placeholder="____"
                />
                {error && (
                  <p className="text-sm text-red-500 text-center">
                    Code PIN incorrect. {attempts > 1 ? `${attempts} tentatives échouées.` : ''}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full bg-[#4a5d94]">
                Se connecter
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
