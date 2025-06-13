import React from 'react';
import { PlayerType } from '../api/players';

const miniPlayerCardStyles = `
  /* Pokemon-style card enhancements */
  .mini-player-card {
    background: linear-gradient(145deg, #ffffff, #f0f0f0);
    border: 2px solid #ddd;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    height: 290px;
    position: relative;
    overflow: hidden;
  }

  .mini-player-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, 
      transparent 30%, 
      rgba(255, 255, 255, 0.1) 50%, 
      transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  .mini-player-card:hover::before {
    opacity: 1;
  }

  .mini-player-card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.2);
    border-color: #3498db;
  }

  .mini-card-header {
    padding: 15px 12px;
    color: white;
    text-align: center;
    position: relative;
    height: 80px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  }

  .mini-card-name {
    font-weight: bold;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .mini-card-body {
    padding: 12px;
    background: white;
    height: 140px;
    display: flex;
    flex-direction: column;
  }

  .mini-card-category {
    font-size: 11px;
    color: #666;
    margin-bottom: 8px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .mini-card-stats {
    flex: 1;
  }

  .mini-card-stats div {
    font-size: 11px;
    margin-bottom: 3px;
    color: #333;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  /* Dark mode support */
  .dark-mode .mini-player-card {
    background: linear-gradient(145deg, #2d2d2d, #333);
    border-color: #444;
  }

  .dark-mode .mini-card-body {
    background-color: #2d2d2d;
  }

  .dark-mode .mini-card-category {
    color: #aaa;
  }

  .dark-mode .mini-card-stats div {
    color: #ddd;
  }

  /* Card separation animation */
  .mini-player-card.card-1 { animation-delay: 0s; }
  .mini-player-card.card-2 { animation-delay: 0.1s; }
  .mini-player-card.card-3 { animation-delay: 0.2s; }
  .mini-player-card.card-4 { animation-delay: 0.3s; }
  .mini-player-card.card-5 { animation-delay: 0.4s; }
  .mini-player-card.card-6 { animation-delay: 0.5s; }
  .mini-player-card.card-7 { animation-delay: 0.6s; }
  .mini-player-card.card-8 { animation-delay: 0.7s; }
  .mini-player-card.card-9 { animation-delay: 0.8s; }
  .mini-player-card.card-10 { animation-delay: 0.9s; }

  @keyframes separateCards {
    0% {
      opacity: 0;
      transform: translateX(0) translateY(0) translateZ(-50px) rotateY(15deg);
    }
    50% {
      opacity: 0.7;
      transform: translateX(0) translateY(-10px) translateZ(0) rotateY(5deg);
    }
    100% {
      opacity: 1;
      transform: translateX(0) translateY(0) translateZ(0) rotateY(0deg);
    }
  }

  @keyframes cardShuffle {
    0% {
      transform: translateX(0) translateY(0) rotateZ(0deg);
      opacity: 0;
    }
    25% {
      transform: translateX(-20px) translateY(-10px) rotateZ(-5deg);
      opacity: 0.3;
    }
    50% {
      transform: translateX(20px) translateY(10px) rotateZ(5deg);
      opacity: 0.6;
    }
    75% {
      transform: translateX(-10px) translateY(-5deg) rotateZ(-2deg);
      opacity: 0.8;
    }
    100% {
      transform: translateX(0) translateY(0) rotateZ(0deg);
      opacity: 1;
    }
  }

  .mini-player-card {
    animation: cardShuffle 0.5s ease-out forwards, separateCards 0.8s ease-out 0.5s forwards;
    opacity: 0;
    transform: translateX(0) translateY(0) translateZ(0) rotateY(0deg);
  }
`;

interface MiniPlayerCardProps {
  player: PlayerType;
  index: number;
  onSelect: () => void;
}

export const MiniPlayerCard: React.FC<MiniPlayerCardProps> = ({ player, index, onSelect }) => {
  React.useEffect(() => {
    const styleId = 'mini-player-card-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = miniPlayerCardStyles;
      document.head.appendChild(style);
    }
  }, []);
  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'batsmen': return 'linear-gradient(135deg, #e74c3c, #c0392b)';
      case 'bowler': return 'linear-gradient(135deg, #3498db, #2980b9)';
      case 'all-rounder': return 'linear-gradient(135deg, #2ecc71, #27ae60)';
      case 'wicket-keeper': return 'linear-gradient(135deg, #f39c12, #e67e22)';
      default: return 'linear-gradient(135deg, #9b59b6, #8e44ad)';
    }
  };

  const getTotalSkill = () => {
  return player.boostedStars ?? (player.battingSkill + player.bowlingSkill + player.fieldingSkill);
  };


  return (
    <div 
      className={`mini-player-card card-${(index % 10) + 1}`}
      onClick={onSelect}
    >
      <div 
        className="mini-card-header" 
        style={{ background: getTypeColor(player.playerType) }}
      >
        <div className="mini-card-name">
          {player.firstName} {player.lastName}
        </div>
        <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>
          {player.ageGroup}
        </div>
      </div>
      <div className="mini-card-body">
        <div className="mini-card-category">{player.playerType}</div>
        <div className="mini-card-stats">
          <div>⚾ Batting: {player.battingSkill}/10</div>
          <div>🥎 Bowling: {player.bowlingSkill}/10</div>
          <div>🏃 Fielding: {player.fieldingSkill}/10</div>
          <div style={{ fontWeight: 'bold', marginTop: '5px', color: '#e74c3c' }}>
            ⭐ Total: {getTotalSkill()}/30
            {player.boostedStars !== undefined && <span style={{ fontSize: '10px', marginLeft: '5px', color: '#999' }}>(boosted)</span>}
          </div>
        </div>
      </div>
    </div>
  );
};