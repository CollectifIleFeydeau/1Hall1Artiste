import React, { useState } from 'react';
import { useLikes } from '@/hooks/useLikes';
import { testFirebaseConnection, getLikeStats } from '@/services/likesService';
import { LikeStats } from '@/types/likesTypes';

/**
 * Composant de test pour valider l'étape 1 du système de likes
 * À utiliser temporairement pour les tests, puis à supprimer
 */
export const LikesTestComponent: React.FC = () => {
  const [testEntryId, setTestEntryId] = useState('test-entry-1');
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);
  const [stats, setStats] = useState<LikeStats | null>(null);
  const [currentUser, setCurrentUser] = useState('user-1');
  
  const { liked, total, loading, error, toggleLike, refresh } = useLikes(testEntryId);

  const handleTestConnection = async () => {
    console.log('🔄 Test de connexion Firebase...');
    const isConnected = await testFirebaseConnection();
    setConnectionStatus(isConnected);
  };

  const handleGetStats = async () => {
    console.log('🔄 Récupération des stats...');
    const globalStats = await getLikeStats();
    setStats(globalStats);
  };

  const handleChangeTestEntry = () => {
    const newId = `test-entry-${Date.now()}`;
    setTestEntryId(newId);
    console.log(`🔄 Changement d'entrée test vers: ${newId}`);
  };

  const handleChangeUser = () => {
    const users = ['user-1', 'user-2', 'user-3', 'user-4'];
    const currentIndex = users.indexOf(currentUser);
    const nextUser = users[(currentIndex + 1) % users.length];
    setCurrentUser(nextUser);
    
    // Changer le sessionId dans localStorage pour simuler un autre utilisateur
    const newSessionId = `session_${Date.now()}_${nextUser}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('user-session-id', newSessionId);
    console.log(`👤 Changement d'utilisateur vers: ${nextUser} (${newSessionId})`);
    
    // Forcer un refresh pour recharger avec le nouveau sessionId
    setTimeout(() => refresh(), 100);
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid #007bff', 
      borderRadius: '8px', 
      margin: '20px',
      backgroundColor: '#f8f9fa'
    }}>
      <h2>🧪 Test Système de Likes - Étape 1</h2>
      
      {/* Test de connexion */}
      <div style={{ marginBottom: '20px' }}>
        <h3>1. Test de connexion Firebase</h3>
        <button onClick={handleTestConnection} style={{ marginRight: '10px' }}>
          Tester la connexion
        </button>
        <span>
          Status: {connectionStatus === null ? '❓ Non testé' : 
                   connectionStatus ? '✅ Connecté' : '❌ Erreur'}
        </span>
      </div>

      {/* Test du hook useLikes */}
      <div style={{ marginBottom: '20px' }}>
        <h3>2. Test du hook useLikes</h3>
        <p><strong>Utilisateur actuel:</strong> <span style={{ color: '#007bff', fontWeight: 'bold' }}>{currentUser}</span></p>
        <p><strong>Entry ID:</strong> {testEntryId}</p>
        <p><strong>Loading:</strong> {loading ? '⏳ Chargement...' : '✅ Chargé'}</p>
        <p><strong>Liked:</strong> {liked ? '❤️ Liké' : '🤍 Pas liké'}</p>
        <p><strong>Total:</strong> {total} likes</p>
        {error && <p style={{ color: 'red' }}><strong>Erreur:</strong> {error}</p>}
        
        <div style={{ marginTop: '10px' }}>
          <button onClick={toggleLike} disabled={loading} style={{ marginRight: '10px' }}>
            {liked ? '💔 Retirer like' : '❤️ Ajouter like'}
          </button>
          <button onClick={refresh} disabled={loading} style={{ marginRight: '10px' }}>
            🔄 Rafraîchir
          </button>
          <button onClick={handleChangeTestEntry} style={{ marginRight: '10px' }}>
            🆕 Nouvelle entrée test
          </button>
          <button onClick={handleChangeUser} style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px' }}>
            👤 Changer d'utilisateur
          </button>
        </div>
      </div>

      {/* Test des stats globales */}
      <div style={{ marginBottom: '20px' }}>
        <h3>3. Test des statistiques globales</h3>
        <button onClick={handleGetStats} style={{ marginRight: '10px' }}>
          Récupérer les stats
        </button>
        {stats && (
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
            <p><strong>Total likes:</strong> {stats.total}</p>
            <p><strong>Likes aujourd'hui:</strong> {stats.today}</p>
            <p><strong>Entrée la plus populaire:</strong> {stats.topEntry || 'Aucune'}</p>
          </div>
        )}
      </div>

      {/* Instructions de test */}
      <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '4px', border: '1px solid #ffeaa7' }}>
        <h4>📋 Checklist de validation Étape 1:</h4>
        <ul>
          <li>✅ Types TypeScript créés</li>
          <li>✅ Service likesService.ts créé</li>
          <li>✅ Hook useLikes créé</li>
          <li>🔄 Test de connexion Firebase</li>
          <li>🔄 Test toggle like</li>
          <li>🔄 Test temps réel (ouvrir 2 onglets)</li>
          <li>🔄 Test persistance (rafraîchir la page)</li>
        </ul>
        
        <p><strong>Instructions:</strong></p>
        <ol>
          <li>Cliquer sur "Tester la connexion" → doit afficher ✅</li>
          <li>Cliquer sur "❤️ Ajouter like" → compteur doit augmenter</li>
          <li><strong>🆕 Test multi-utilisateur :</strong> Cliquer sur "👤 Changer d'utilisateur" → maintenant vous pouvez liker à nouveau !</li>
          <li>Ouvrir un 2ème onglet → les likes doivent se synchroniser</li>
          <li>Rafraîchir la page → les likes doivent persister</li>
        </ol>
      </div>
    </div>
  );
};

