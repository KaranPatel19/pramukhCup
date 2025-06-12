import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { TeamsCollection, TeamType } from '../api/teams';
import { PlayersCollection, PlayerType } from '../api/players';
import { MiniPlayerCard } from './MiniPlayerCard';

// Add this style block before the return statement
const teamManagementStyles = `
  /* Enhanced Team Management Styles */
  .team-captain {
    background-color: #fff3cd;
    border: 1px solid #ffeaa7;
    padding: 10px;
    border-radius: 5px;
    margin-bottom: 20px;
    color: #856404;
  }
  .captain-badge {
    color: #f39c12;
    font-weight: bold;
    font-size: 0.9em;
  }
  .btn-captain {
    background-color: #f39c12;
    color: white;
    padding: 5px 10px;
    font-size: 0.8em;
    margin-right: 5px;
  }
  .btn-captain:hover {
    background-color: #e67e22;
  }
  .btn-captain:disabled {
    background-color: #bdc3c7;
    cursor: not-allowed;
  }
  .team-info {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }
  .teams-list li {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .team-members-table tr td:last-child,
  .available-players-table tr td:last-child {
    white-space: nowrap;
  }
  .team-members-table .btn-captain,
  .team-members-table .btn-remove,
  .available-players-table .btn-add {
    margin: 0 2px;
  }

  /* Pagination Controls */
  .pagination-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-top: 1px solid #eee;
    background-color: #f9f9f9;
  }

  .btn-pagination {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.3s;
    min-width: 100px;
  }

  .btn-pagination:hover:not(:disabled) {
    background-color: #2980b9;
  }

  .btn-pagination:disabled {
    background-color: #bdc3c7;
    cursor: not-allowed;
    opacity: 0.6;
  }

  .pagination-info {
    font-weight: bold;
    color: #2c3e50;
    text-align: center;
    flex: 1;
  }

  /* Dark mode pagination styles */
  .dark-mode .pagination-controls {
    background-color: #333;
    border-top-color: #444;
  }

  .dark-mode .pagination-info {
    color: #e0e0e0;
  }

  .dark-mode .btn-pagination {
    background-color: #2980b9;
  }

  .dark-mode .btn-pagination:hover:not(:disabled) {
    background-color: #3498db;
  }

  .dark-mode .btn-pagination:disabled {
    background-color: #555;
  }
`;
export const TeamManagement: React.FC = () => {
  const [newTeamName, setNewTeamName] = useState<string>('');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [selectedPlayerForAllocation, setSelectedPlayerForAllocation] = useState<PlayerType | null>(null);
  const [showTeamSelection, setShowTeamSelection] = useState<boolean>(false);
  const [showAllocationModal, setShowAllocationModal] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [currentBatch, setCurrentBatch] = useState<PlayerType[]>([]);


  // Subscribe to teams and players data
  const { teams, players, availablePlayers, selectedTeam, isLoading } = useTracker(() => {
  const teamsSubscription = Meteor.subscribe('teams');
  const playersSubscription = Meteor.subscribe('players');
  
  const subscriptionsReady = teamsSubscription.ready() && playersSubscription.ready();
  
  if (!subscriptionsReady) {
    return {
      teams: [],
      players: [],
      availablePlayers: [],
      selectedTeam: null,
      isLoading: true,
    };
  }
  
  const allTeams = TeamsCollection.find({}, { sort: { createdAt: 1 } }).fetch();
  const allPlayers = PlayersCollection.find({}, { sort: { firstName: 1 } }).fetch();
  const currentSelectedTeam = selectedTeamId ? TeamsCollection.findOne({ _id: selectedTeamId }) : null;
  const playersWithoutTeam = PlayersCollection.find({ teamId: { $exists: false } }, { sort: { firstName: 1 } }).fetch();

  return {
    teams: allTeams || [],
    players: allPlayers || [],
    availablePlayers: playersWithoutTeam || [],
    selectedTeam: currentSelectedTeam,
    isLoading: false,
  };
});
// Update current batch when availablePlayers changes
  React.useEffect(() => {
    if (showAllocationModal && currentBatch.length === 0) {
      updateCurrentBatch();
    }
  }, [showAllocationModal, teams.length]);

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCreateTeam = () => {
    if (!newTeamName.trim()) {
      showMessage('Please enter a team name', 'error');
      return;
    }

    Meteor.call('teams.create', newTeamName, (error: Error | null, result: string) => {
      if (error) {
        showMessage(`Error: ${error.message}`, 'error');
      } else {
        showMessage('Team created successfully!', 'success');
        setNewTeamName('');
        setSelectedTeamId(result);
      }
    });
  };

  const handleDeleteTeam = (teamId: string) => {
    if (window.confirm('Are you sure you want to delete this team? All players will be removed from the team.')) {
      Meteor.call('teams.delete', teamId, (error: Error | null) => {
        if (error) {
          showMessage(`Error: ${error.message}`, 'error');
        } else {
          showMessage('Team deleted successfully!', 'success');
          if (selectedTeamId === teamId) {
            setSelectedTeamId(null);
          }
        }
      });
    }
  };

  const handleAddPlayer = (playerId: string) => {
    if (!selectedTeamId) return;

    Meteor.call('teams.addPlayer', selectedTeamId, playerId, (error: Error | null) => {
      if (error) {
        showMessage(`Error: ${error.message}`, 'error');
      } else {
        showMessage('Player added to team!', 'success');
      }
    });
  };

  const handleRemovePlayer = (playerId: string) => {
    if (!selectedTeamId) return;

    Meteor.call('teams.removePlayer', selectedTeamId, playerId, (error: Error | null) => {
      if (error) {
        showMessage(`Error: ${error.message}`, 'error');
      } else {
        showMessage('Player removed from team!', 'success');
      }
    });
  };

  const handleSetCaptain = (playerId: string) => {
    if (!selectedTeamId) return;

    Meteor.call('teams.setCaptain', selectedTeamId, playerId, (error: Error | null) => {
      if (error) {
        showMessage(`Error: ${error.message}`, 'error');
      } else {
        showMessage('Captain set successfully!', 'success');
      }
    });
  };

  const getTeamMembers = (team: TeamType): PlayerType[] => {
  if (!team.memberIds || !players || players.length === 0) return [];
  return team.memberIds.map(id => players.find(p => p._id === id)).filter(Boolean) as PlayerType[];
};

  const getCaptain = (team: TeamType): PlayerType | undefined => {
    return team.captainId ? players.find(p => p._id === team.captainId) : undefined;
  };

  if (isLoading) {
    return <div className="loading">Loading teams and players...</div>;
  }
  const handleAllocatePlayer = (teamId: string) => {
  if (!selectedPlayerForAllocation?._id) return;
  
  Meteor.call('teams.addPlayer', teamId, selectedPlayerForAllocation._id, (error: Error | null) => {
      if (error) {
        showMessage(`Error: ${error.message}`, 'error');
      } else {
        showMessage('Player allocated successfully!', 'success');
      }
      setShowTeamSelection(false);
      setSelectedPlayerForAllocation(null);
      //setShowAllocationModal(false);
    });
  };

  const getPaginatedPlayers = () => {
    const playersPerPage = teams.length || 3;
    const startIndex = currentPage * playersPerPage;
    const endIndex = startIndex + playersPerPage;
    
    // Only update the batch when page changes, not when players are allocated
    const newBatch = availablePlayers.slice(startIndex, endIndex);
    return newBatch;
  };

  const updateCurrentBatch = () => {
    const playersPerPage = teams.length || 3;
    const startIndex = currentPage * playersPerPage;
    const endIndex = startIndex + playersPerPage;
    const newBatch = availablePlayers.slice(startIndex, endIndex);
    setCurrentBatch(newBatch);
  };

  const getTotalPages = () => {
    const playersPerPage = teams.length || 3;
    return Math.ceil(availablePlayers.length / playersPerPage);
  };

  const handleNextPage = () => {
  const totalPages = getTotalPages();
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      // Update batch when page changes
      setTimeout(() => updateCurrentBatch(), 0);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      // Update batch when page changes
      setTimeout(() => updateCurrentBatch(), 0);
    }
  };

  const handlePageReset = () => {
    setCurrentPage(0);
    // Update batch when resetting
    setTimeout(() => updateCurrentBatch(), 0);
  };

  return (
    <>
    <style>{teamManagementStyles}</style>
    <div className="team-management-container">
      {message && (
         <div className={`${messageType === 'success' ? 'success-message' : 'error-message'}`} style={{ gridColumn: '1 / -1' }}>
          {message}
        </div>
      )}

      {/* Teams List Panel */}
      <div className="team-list-panel">
        <h3>Teams</h3>
        
        <div className="create-team">
          <input
            type="text"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            placeholder="Enter team name"
            onKeyPress={(e) => e.key === 'Enter' && handleCreateTeam()}
          />
          <button onClick={handleCreateTeam} className="btn-create">
            Create Team
          </button>
        </div>

        <ul className="teams-list">
          {teams && teams.length > 0 ? teams.map((team: TeamType) => (
            <li 
              key={team._id} 
              className={selectedTeamId === team._id ? 'selected' : ''}
              onClick={() => setSelectedTeamId(team._id || null)}
            >
              <div className="team-info">
                <span className="team-name">{team.name}</span>
                <span className="team-members-count">
                 {(team.memberIds || []).length} member{(team.memberIds || []).length !== 1 ? 's' : ''}
                </span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  team._id && handleDeleteTeam(team._id);
                }}
                className="btn-delete-small"
              >
                ×
              </button>
            </li>
          )) : null}
        </ul>

        {teams && teams.length === 0 && (
          <div className="no-data">No teams created yet.</div>
        )}
      </div>

      {/* Team Detail Panel */}
      <div className="team-detail-panel">
        {selectedTeam ? (
          <>
            <h3>{selectedTeam.name}</h3>
            
            {selectedTeam.captainId && (
              <div className="team-captain">
                <strong>Captain:</strong> {getCaptain(selectedTeam)?.firstName} {getCaptain(selectedTeam)?.lastName}
              </div>
            )}

            <h4>Team Members ({(selectedTeam.memberIds || []).length})</h4>

            {(selectedTeam.memberIds || []).length > 0 ? (

              <table className="team-members-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Age Group</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getTeamMembers(selectedTeam).map((player: PlayerType) => (
                    <tr key={player._id}>
                      <td>
                        {`${player.firstName} ${player.lastName}`}
                        {selectedTeam.captainId === player._id && (
                          <span className="captain-badge"> (C)</span>
                        )}
                      </td>
                      <td>{player.playerType}</td>
                      <td>{player.ageGroup}</td>
                      <td>
                        {selectedTeam.captainId !== player._id && (
                          <button
                            onClick={() => player._id && handleSetCaptain(player._id)}
                            className="btn-captain"
                          >
                            Make Captain
                          </button>
                        )}
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
              <div className="no-data">No players in this team yet.</div>
            )}
          </>
        ) : (
          <div className="select-team-prompt">
            <p>Select a team to view details and manage members</p>
          </div>
        )}
      </div>

      {/* Available Players Panel */}
      <div className="available-players-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Available Players</h3>
          <button 
            className="btn-customize"
            onClick={() => {
              setShowAllocationModal(true);
              handlePageReset();
              // Set initial batch
              const playersPerPage = teams.length || 3;
              const initialBatch = availablePlayers.slice(0, playersPerPage);
              setCurrentBatch(initialBatch);
            }}
            disabled={availablePlayers.length === 0}
          >
            Allocate Players
          </button>
      </div>
        
        {availablePlayers.length > 0 ? (
          <table className="available-players-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Age Group</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {availablePlayers && availablePlayers.map((player: PlayerType) => (
                <tr key={player._id}>
                  <td>{`${player.firstName} ${player.lastName}`}</td>
                  <td>{player.playerType}</td>
                  <td>{player.ageGroup}</td>
                  <td>
                    <button
                      onClick={() => player._id && handleAddPlayer(player._id)}
                      disabled={!selectedTeamId}
                      className="btn-add"
                    >
                      Add to Team
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-data">All players are assigned to teams.</div>
        )}
      </div>
    </div>
    
    {/* Allocation Modal */}
    {showAllocationModal && (
      <div className="player-card-overlay">
        <div className="cards-grid">
          <div className="cards-header">
          <h2>Choose Player to Allocate - Showing {teams.length || 3} at a time</h2>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
            {availablePlayers.length} total players available
          </p>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button 
              className="btn-primary"
              onClick={() => setShowAllocationModal(false)}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              Done
            </button>
            <button 
              className="close-btn"
              onClick={() => setShowAllocationModal(false)}
            >
              ×
            </button>
          </div>
        </div>
          <div className="cards-container">
            {currentBatch
              .filter(player => availablePlayers.includes(player)) // Only show if still available
              .map((player, index) => (
                <MiniPlayerCard 
                  key={player._id}
                  player={player}
                  index={index}
                  onSelect={() => {
                    setSelectedPlayerForAllocation(player);
                    setShowTeamSelection(true);
                  }}
                />
              ))}
          </div>

        {/* Pagination Controls */}
        <div className="pagination-controls">
          <button 
            className="btn-pagination"
            onClick={handlePrevPage}
            disabled={currentPage === 0}
          >
            ← Previous
          </button>
          
          <span className="pagination-info">
            Page {currentPage + 1} of {getTotalPages()} 
            ({currentBatch.filter(player => availablePlayers.includes(player)).length} of {availablePlayers.length} players)
          </span>
          
          <button 
            className="btn-pagination"
            onClick={handleNextPage}
            disabled={currentPage >= getTotalPages() - 1}
          >
            Next →
          </button>
        </div>
        </div>
      </div>
    )}
    {/* Team Selection Modal */}
    {showTeamSelection && selectedPlayerForAllocation && (
      <div className="player-card-overlay">
        <div className="team-assignment-modal">
          <div className="assignment-header">
            <h2>Assign {selectedPlayerForAllocation.firstName} {selectedPlayerForAllocation.lastName}</h2>
            <button 
              className="close-btn"
              onClick={() => {
                setShowTeamSelection(false);
                setSelectedPlayerForAllocation(null);
              }}
            >
              ×
            </button>
          </div>
          <div className="teams-selection">
            {teams.map((team) => (
              <div 
                key={team._id}
                className="team-option"
                onClick={() => handleAllocatePlayer(team._id!)}
              >
                <div className="team-option-name">{team.name}</div>
                <div className="team-option-count">
                  {(team.memberIds || []).length} members
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
    </>
  );
};