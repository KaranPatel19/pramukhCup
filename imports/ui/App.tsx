import React, { useState } from 'react';
import { PlayerUpload } from './PlayerUpload';
import { DatabaseInspector } from './DatabaseInspector';
import { ThemeProvider } from './ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import { TeamManagement } from './TeamManagement';

export const App: React.FC = () => {
  const [showPlayerUpload, setShowPlayerUpload] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('home');

  const togglePlayerUpload = () => {
    setShowPlayerUpload(!showPlayerUpload);
    setActiveTab('players');
  };

  const navigateToTeamManagement = () => {
    setActiveTab('teams');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab !== 'players') {
      setShowPlayerUpload(false);
    }
  };

  return (
    <ThemeProvider>
      <div className="main-container">
        <ThemeToggle />
        
        <h1>Pramukh Cup</h1>
        
        <div className="app-tabs">
          <button 
            className={`tab-button ${activeTab === 'home' ? 'active' : ''}`} 
            onClick={() => handleTabChange('home')}
          >
            Home
          </button>
          <button 
            className={`tab-button ${activeTab === 'players' ? 'active' : ''}`} 
            onClick={() => handleTabChange('players')}
          >
            Players
          </button>
          <button 
            className={`tab-button ${activeTab === 'teams' ? 'active' : ''}`} 
            onClick={() => handleTabChange('teams')}
          >
            Teams
          </button>
          <button 
            className={`tab-button ${activeTab === 'database' ? 'active' : ''}`} 
            onClick={() => handleTabChange('database')}
          >
            Database Inspector
          </button>
        </div>
        
        {activeTab === 'home' && (
          <div className="home-content">
            <h2>Welcome to the Pramukh Cup</h2>
            <p>This application allows you to manage your team's players efficiently.</p>
            <p>You can upload player data via CSV files, create teams, assign captains, and monitor your database.</p>
            
            <div className="action-buttons">
              <button 
                onClick={togglePlayerUpload} 
                className="btn-primary"
              >
                Upload Players
              </button>
              <button 
                onClick={navigateToTeamManagement} 
                className="btn-primary btn-team"
              >
                Team Management
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'players' && (
          <PlayerUpload />
        )}
        
        {activeTab === 'teams' && (
          <TeamManagement />
        )}
        
        
        {activeTab === 'database' && (
          <DatabaseInspector />
        )}
      </div>
    </ThemeProvider>
  );
};