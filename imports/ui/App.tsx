import React from 'react';
import { PlayerUpload } from './PlayerUpload';

export const App: React.FC = () => (
  <div className="main-container">
    <h1>Player Management System</h1>
    <PlayerUpload />
  </div>
);