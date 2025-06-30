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
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mini-player-card img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 10px; /* Slightly smaller than card border-radius */
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
  .mini-player-card.fallback-card img {
    display: none !important;
  }
  .mini-player-card {
    position: relative;
    overflow: hidden;
  }
  .mini-player-card:hover::before {
    opacity: 1;
  }
  .mini-player-card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.2);
    border-color: #3498db;
  }
  .player-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 10px;
    display: block;
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

const getPlayerImageUrl = () => {
  return `/images/${player.phone}.jpg`;
};

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  // Fallback to generated card if image doesn't exist
  e.currentTarget.style.display = 'none';
  e.currentTarget.parentElement?.classList.add('fallback-card');
};

  return (
    <div 
      className={`mini-player-card card-${(index % 10) + 1}`}
      onClick={onSelect}
    >
      <img 
        src={getPlayerImageUrl()}
        alt={`${player.firstName} ${player.lastName}`}
        onError={handleImageError}
        className="player-image"
      />
    </div>
  );
};