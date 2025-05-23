import React, { useState } from 'react';

interface TeamCustomizationProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: TeamConfig) => void;
  currentConfig: TeamConfig;
}

export interface TeamConfig {
  highStars: { min: number; count: number }; // 22+ stars
  midStars: { min: number; max: number; count: number }; // 15-22 stars
  lowStars: { max: number; count: number }; // <15 stars
}

export const TeamCustomization: React.FC<TeamCustomizationProps> = ({
  isOpen,
  onClose,
  onSave,
  currentConfig
}) => {
  const [config, setConfig] = useState<TeamConfig>(currentConfig);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  const updateConfig = (category: keyof TeamConfig, field: string, value: number) => {
    setConfig(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const totalPlayers = config.highStars.count + config.midStars.count + config.lowStars.count;

  return (
    <div className="player-card-overlay">
      <div className="customization-modal">
        <div className="customization-header">
          <h2>Team Composition Settings</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="customization-body">
          <div className="config-section">
            <h3>High-Star Players (22+ stars)</h3>
            <div className="config-row">
              <label>Minimum Stars:</label>
              <input
                type="number"
                min="22"
                max="30"
                value={config.highStars.min}
                onChange={(e) => updateConfig('highStars', 'min', parseInt(e.target.value))}
              />
            </div>
            <div className="config-row">
              <label>Count:</label>
              <input
                type="number"
                min="0"
                max="11"
                value={config.highStars.count}
                onChange={(e) => updateConfig('highStars', 'count', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="config-section">
            <h3>Mid-Star Players</h3>
            <div className="config-row">
              <label>Minimum Stars:</label>
              <input
                type="number"
                min="10"
                max="21"
                value={config.midStars.min}
                onChange={(e) => updateConfig('midStars', 'min', parseInt(e.target.value))}
              />
            </div>
            <div className="config-row">
              <label>Maximum Stars:</label>
              <input
                type="number"
                min="15"
                max="25"
                value={config.midStars.max}
                onChange={(e) => updateConfig('midStars', 'max', parseInt(e.target.value))}
              />
            </div>
            <div className="config-row">
              <label>Count:</label>
              <input
                type="number"
                min="0"
                max="11"
                value={config.midStars.count}
                onChange={(e) => updateConfig('midStars', 'count', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="config-section">
            <h3>Low-Star Players</h3>
            <div className="config-row">
              <label>Maximum Stars:</label>
              <input
                type="number"
                min="5"
                max="20"
                value={config.lowStars.max}
                onChange={(e) => updateConfig('lowStars', 'max', parseInt(e.target.value))}
              />
            </div>
            <div className="config-row">
              <label>Count:</label>
              <input
                type="number"
                min="0"
                max="11"
                value={config.lowStars.count}
                onChange={(e) => updateConfig('lowStars', 'count', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="config-summary">
            <p><strong>Total Players: {totalPlayers}</strong></p>
            {totalPlayers > 11 && (
              <p className="warning">⚠️ Total exceeds 11 players (typical team size)</p>
            )}
          </div>
        </div>

        <div className="customization-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={handleSave}>Save Configuration</button>
        </div>
      </div>
    </div>
  );
};