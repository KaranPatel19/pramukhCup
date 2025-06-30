import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { PlayersCollection, PlayerType } from '../api/players';

export const DatabaseInspector: React.FC = () => {
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);
  const { players, isLoading } = useTracker(() => {
    const subscription = Meteor.subscribe('players'); 
    return {
      players: PlayersCollection.find({}, { sort: { createdAt: -1 } }).fetch(),
      isLoading: !subscription.ready(),
    };
  });

  const toggleExpand = (id: string | undefined) => {
    if (!id) return;
    setExpandedPlayer(expandedPlayer === id ? null : id);
  };

  return (
    <div className="database-inspector">
      <h2>Database Inspector</h2>
      <p>View the raw MongoDB documents for your players collection:</p>
      
      {isLoading ? (
        <div className="loading">Loading database records...</div>
      ) : players && players.length > 0 ? (
        <div className="db-records">
          <div className="db-stats">
            <strong>Collection:</strong> players | 
            <strong> Total Documents:</strong> {players.length}
          </div>
          
          {players.map((player: PlayerType) => (
            <div key={player._id} className="db-record">
              <div 
                className="db-record-header" 
                onClick={() => toggleExpand(player._id)}
              >
                <span className="expand-icon">
                  {expandedPlayer === player._id ? '▼' : '►'}
                </span>
                <span className="db-record-id">{player._id}</span>
                <span className="db-record-name">{`${player.firstName} ${player.lastName}`}</span>
              </div>
              
              {expandedPlayer === player._id && (
                <pre className="db-record-json">
                  {JSON.stringify(player, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="no-data">No database records found.</div>
      )}
      
      <div className="inspector-tips">
        <h4>MongoDB Tips:</h4>
        <ul>
          <li>Run <code>meteor mongo</code> in your terminal to access the MongoDB shell</li>
          <li>Use <code>db.players.find().pretty()</code> to view all players</li>
          <li>Use MongoDB Compass with connection string: <code>mongodb://localhost:3001/meteor</code></li>
        </ul>
      </div>
    </div>
  );
};