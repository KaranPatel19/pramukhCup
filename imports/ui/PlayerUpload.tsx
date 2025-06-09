import React, { useState, ChangeEvent } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { PlayersCollection, PlayerType } from '../api/players';

export const PlayerUpload: React.FC = () => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);

  // Subscribe to players data
  const { players, isLoading } = useTracker(() => {
    const subscription = Meteor.subscribe('players');
    return {
      players: PlayersCollection.find({}, { sort: { createdAt: -1 } }).fetch(),
      isLoading: !subscription.ready(),
    };
  });

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvData = e.target?.result as string;
      
      Meteor.call('players.uploadCsv', csvData, (error: Error | null, result: number) => {
        setIsUploading(false);
        if (error) {
          setUploadResult(`Error: ${error.message}`);
        } else {
          setUploadResult(`Successfully imported ${result} players.`);
        }
      });
    };

    reader.onerror = () => {
      setIsUploading(false);
      setUploadResult('Error reading file.');
    };

    reader.readAsText(file);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to remove all players?')) {
      Meteor.call('players.removeAll', (error: Error | null) => {
        if (error) {
          setUploadResult(`Error: ${error.message}`);
        } else {
          setUploadResult('All players removed.');
        }
      });
    }
  };

  const handleRemovePlayer = (playerId: string) => {
    Meteor.call('players.remove', playerId, (error: Error | null) => {
      if (error) {
        setUploadResult(`Error: ${error.message}`);
      }
    });
  };

  return (
    <div className="players-container">
      <h2>Players Management</h2>
      
      <div className="upload-section">
        <p>Upload a CSV file with player data. The CSV should have columns: name, number, email, and type.</p>
        
        <div className="upload-controls">
          <input 
            type="file" 
            accept=".csv" 
            onChange={handleFileUpload} 
            disabled={isUploading} 
          />
          
          <button 
            onClick={handleClearAll} 
            disabled={isUploading || isLoading || !players || players.length === 0}
            className="btn-clear"
          >
            Clear All Players
          </button>
        </div>
        
        {isUploading && <div className="loading">Uploading...</div>}
        {uploadResult && <div className="upload-result">{uploadResult}</div>}
      </div>
      
      <div className="players-list">
        <h3>Players List</h3>
        
        {isLoading ? (
          <div className="loading">Loading players...</div>
        ) : players && players.length > 0 ? (
          <table className="players-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Age Group</th>
                <th>Player Type</th>
                <th>T-Shirt Size</th>
                <th>Batting</th>
                <th>Bowling</th>
                <th>Fielding</th>
                <th>How Much Play</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player: PlayerType) => (
                <tr key={player._id}>
                  <td>{`${player.firstName} ${player.lastName}`}</td>
                  <td>{player.email}</td>
                  <td>{player.phone}</td>
                  <td>{player.ageGroup}</td>
                  <td>{player.playerType}</td>
                  <td>{player.tShirtSize}</td>
                  <td>{player.battingSkill}</td>
                  <td>{player.bowlingSkill}</td>
                  <td>{player.fieldingSkill}</td>
                  <td>{player.howMuchDoYouPlay}</td>
                  <td>
                    <button 
                      onClick={() => player._id && handleRemovePlayer(player._id)}
                      className="btn-remove"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-data">No players found. Upload a CSV file to add players.</div>
        )}
      </div>
    </div>
  );
};