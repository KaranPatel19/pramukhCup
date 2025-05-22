import React from 'react';
import { PlayerType } from '../api/players';

interface PlayerCardProps {
  player: PlayerType;
  onClose: () => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, onClose }) => {
  if (!player) return null;

  // Generate random background color based on player type
  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'Batsmen': return '#e74c3c';
      case 'Bowler': return '#3498db';
      case 'All-Rounder': return '#2ecc71';
      default: return '#9b59b6';
    }
  };

  const backgroundColor = getTypeColor(player.category);

  return (
    <div className="player-card-overlay" onClick={onClose}>
      <div className="player-card" onClick={(e) => e.stopPropagation()}>
        <div className="player-card-header" style={{ backgroundColor }}>
          <h2 className="player-card-name">{player.name}</h2>
        </div>
        <div className="player-card-body">
          <div className="player-card-avatar">
            {player.name.substring(0, 1).toUpperCase()}
          </div>
          <div className="player-card-info">
            <div className="player-card-category">
              <span className="label">Category:</span>
              <span className="value">{player.category}</span>
            </div>
           <div className="player-card-batting">
            <span className="label">Batting:</span>
            <span className="value">
              {'★'.repeat(player.batting)}{'☆'.repeat(10 - player.batting)}
            </span>
          </div>
          <div className="player-card-bowling">
            <span className="label">Bowling:</span>
            <span className="value">
              {'★'.repeat(player.bowling)}{'☆'.repeat(10 - player.bowling)}
            </span>
          </div>
          <div className="player-card-fielding">
            <span className="label">Fielding:</span>
            <span className="value">
              {'★'.repeat(player.fielding)}{'☆'.repeat(10 - player.fielding)}
            </span>
          </div>
          </div>
        </div>
        <div className="player-card-footer">
          <button className="btn-add" onClick={onClose}>Add to Team</button>
        </div>
      </div>
    </div>
  );
};