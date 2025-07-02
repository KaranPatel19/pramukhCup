import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { TeamsCollection, TeamType } from '../api/teams';
import { PlayersCollection, PlayerType } from '../api/players';
import { MiniPlayerCard } from './MiniPlayerCard';


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
  .floating-message {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    padding: 10px 20px;
    border-radius: 6px;
    font-weight: bold;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    max-width: 90%;
    text-align: center;
  }

  .success-message {
    background-color: #d4edda;
    color: #155724;
  }

  .error-message {
    background-color: #f8d7da;
    color: #721c24;
  }

  .captain-badge {
    color: #f39c12;
    font-weight: bold;
    font-size: 0.9em;
  }
  .vice-captain-badge {
    color: #e67e22;
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
  .btn-vice-captain {
    background-color: #e67e22;
    color: white;
    padding: 5px 10px;
    font-size: 0.8em;
    margin-right: 5px;
  }
  .btn-vice-captain:hover {
    background-color: #d35400;
  }
  .btn-vice-captain:disabled {
    background-color: #bdc3c7;
    cursor: not-allowed;
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
  .cards-header h3 {
    color: white;
  }

  .dark-mode .btn-pagination:hover:not(:disabled) {
    background-color: #3498db;
  }

  .dark-mode .btn-pagination:disabled {
    background-color: #555;
  }
      /* Filter Modal Styles */
  .filter-modal {
    background-color: #fff;
    padding: 25px;
    border-radius: 12px;
    width: 400px;
    max-width: 90%;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    margin: auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
    position: relative;
  }

  .filter-modal h2 {
    margin: 0 0 10px 0;
    font-size: 20px;
    color: #2c3e50;
    text-align: center;
  }

  .filter-modal label {
    display: flex;
    flex-direction: column;
    font-size: 14px;
    color: #333;
  }

  .filter-modal select {
    padding: 8px;
    font-size: 14px;
    margin-top: 5px;
    border: 1px solid #ccc;
    border-radius: 6px;
  }

  .filter-modal .btn-primary {
    align-self: center;
    background-color: #3498db;
    color: #fff;
    padding: 10px 20px;
    border-radius: 8px;
    border: none;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .filter-modal .btn-primary:hover {
    background-color: #2980b9;
  }

`;
export const TeamManagement: React.FC = () => {
  const [allocatedTeamsInBatch, setAllocatedTeamsInBatch] = useState<Set<string>>(new Set());
  const [newTeamName, setNewTeamName] = useState<string>('');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [selectedPlayerForAllocation, setSelectedPlayerForAllocation] = useState<PlayerType | null>(null);
  const [showTeamSelection, setShowTeamSelection] = useState<boolean>(false);
  const [showAllocationModal, setShowAllocationModal] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [currentBatch, setCurrentBatch] = useState<PlayerType[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<PlayerType[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); 
  const [playerTypeFilter, setPlayerTypeFilter] = useState<string>('all');
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [howMuchDoYouPlayFilter, setHowMuchDoYouPlayFilter] = useState<string>('all'); 
  const [playPercentageBoost, setPlayPercentageBoost] = useState<number>(0);
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
    const playersWithoutTeam = PlayersCollection.find({ 
    teamId: { $exists: false },
    isFlagged: { $ne: true }
  }, { sort: { firstName: 1 } }).fetch();

  return {
    teams: allTeams || [],
    players: allPlayers || [],
    availablePlayers: playersWithoutTeam || [],
    selectedTeam: currentSelectedTeam,
    isLoading: false,
  };
});
  React.useEffect(() => {
    if (showAllocationModal) {
      updateCurrentBatch();
    }
  }, [showAllocationModal, currentPage]);

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
  const handleFlagPlayer = (playerId: string) => {
      Meteor.call('players.flag', playerId, (error: Error | null) => {
        if (error) {
          showMessage(`Error: ${error.message}`, 'error');
        } else {
          showMessage('Player flagged successfully!', 'success');
          
          // Remove the flagged player and add a replacement from next batch
          setCurrentBatch(prevBatch => {
            const filteredBatch = prevBatch.filter(player => player._id !== playerId);
            
            // Get the next available player to replace the flagged one
            const playersPerPage = teams.length || 3;
            const currentBatchSize = prevBatch.length;
            const startIndex = currentPage * playersPerPage;
            const nextPlayerIndex = startIndex + currentBatchSize;
            
            // Apply the same filters as in updateCurrentBatch
            let allFilteredPlayers = [...availablePlayers].map((p) => {
              let total = p.battingSkill + p.bowlingSkill + p.fieldingSkill;

              if (
                howMuchDoYouPlayFilter !== 'all' &&
                p.howMuchDoYouPlay?.toLowerCase() === howMuchDoYouPlayFilter.toLowerCase()
              ) {
                total = Math.min(30, Math.round(total * (1 + playPercentageBoost / 100)));
              }

              return { ...p, boostedStars: total }; 
            });

            if (playerTypeFilter !== 'all') {
              allFilteredPlayers = allFilteredPlayers.filter(
                p => p.playerType.toLowerCase() === playerTypeFilter.toLowerCase()
              );
            } 

            const sortedPlayers = allFilteredPlayers.sort((a, b) =>
              sortOrder === 'asc' ? a.boostedStars - b.boostedStars : b.boostedStars - a.boostedStars
            );

            // Get the next player that's not already in the current batch
            const nextPlayer = sortedPlayers.find((player, index) => 
              index >= nextPlayerIndex && 
              !filteredBatch.some(batchPlayer => batchPlayer._id === player._id) &&
              player._id !== playerId
            );

            // Add the replacement player if available
            if (nextPlayer) {
              return [...filteredBatch, nextPlayer];
            }
            
            return filteredBatch;
          });
        }
        setShowTeamSelection(false);
        setSelectedPlayerForAllocation(null);
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
  const handleSetViceCaptain = (playerId: string) => {
    if (!selectedTeamId) return;

    Meteor.call('teams.setViceCaptain', selectedTeamId, playerId, (error: Error | null) => {
      if (error) {
        showMessage(`Error: ${error.message}`, 'error');
      } else {
        showMessage('Vice Captain set successfully!', 'success');
      }
    });
  };

  const getTeamMembers = (team: TeamType): PlayerType[] => {
    if (!team.memberIds || !players || players.length === 0) return [];
    const teamPlayers = team.memberIds.map(id => players.find(p => p._id === id)).filter(Boolean) as PlayerType[];
    
    // Sort players: Captain first, then Vice Captain, then others
    return teamPlayers.sort((a, b) => {
      const aIsCaptain = team.captainId === a._id;
      const bIsCaptain = team.captainId === b._id;
      const aIsViceCaptain = team.viceCaptainId === a._id;
      const bIsViceCaptain = team.viceCaptainId === b._id;
      
      // Captain comes first
      if (aIsCaptain && !bIsCaptain) return -1;
      if (!aIsCaptain && bIsCaptain) return 1;
      
      // Vice Captain comes second (after captain check)
      if (aIsViceCaptain && !bIsViceCaptain && !bIsCaptain) return -1;
      if (!aIsViceCaptain && bIsViceCaptain && !aIsCaptain) return 1;
      
      // For others, maintain original order by comparing their position in memberIds array
      return team.memberIds.indexOf(a._id!) - team.memberIds.indexOf(b._id!);
    });
  };

  const getCaptain = (team: TeamType): PlayerType | undefined => {
    return team.captainId ? players.find(p => p._id === team.captainId) : undefined;
  };
  const getViceCaptain = (team: TeamType): PlayerType | undefined => {
    return team.viceCaptainId ? players.find(p => p._id === team.viceCaptainId) : undefined;
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
        setCurrentBatch(prevBatch => 
          prevBatch.filter(player => player._id !== selectedPlayerForAllocation._id)
        );
        // Add the team to allocated teams for this batch
        setAllocatedTeamsInBatch(prev => new Set([...prev, teamId]));
      }
      setShowTeamSelection(false);
      setSelectedPlayerForAllocation(null);
    });
  };

  const getPaginatedPlayers = () => {
    const playersPerPage = teams.length || 3;
    const startIndex = currentPage * playersPerPage;
    const endIndex = startIndex + playersPerPage;
    const newBatch = availablePlayers.slice(startIndex, endIndex);
    return newBatch;
  };

  const updateCurrentBatch = () => {
    const playersPerPage = teams.length || 3;
    
    // First, filter and sort all players
    let filteredPlayers = [...availablePlayers].map((p) => {
      let total = p.battingSkill + p.bowlingSkill + p.fieldingSkill;

      if (
        howMuchDoYouPlayFilter !== 'all' &&
        p.howMuchDoYouPlay?.toLowerCase() === howMuchDoYouPlayFilter.toLowerCase()
      ) {
        total = Math.min(30, Math.round(total * (1 + playPercentageBoost / 100)));
      }

      return { ...p, boostedStars: total }; 
    });

    if (playerTypeFilter !== 'all') {
      filteredPlayers = filteredPlayers.filter(
        p => p.playerType.toLowerCase() === playerTypeFilter.toLowerCase()
      );
    } 

    const sortedPlayers = filteredPlayers.sort((a, b) =>
      sortOrder === 'asc' ? a.boostedStars - b.boostedStars : b.boostedStars - a.boostedStars
    );

    // Calculate total pages based on filtered players, not all available players
    const totalPages = Math.ceil(sortedPlayers.length / playersPerPage);
    const safePage = Math.min(currentPage, Math.max(totalPages - 1, 0));
    setCurrentPage(safePage);

    const startIndex = safePage * playersPerPage;
    const endIndex = startIndex + playersPerPage;
    const newBatch = sortedPlayers.slice(startIndex, endIndex);
    
    setFilteredPlayers(sortedPlayers); 
    setCurrentBatch(newBatch);
  };


  const getTotalPages = () => {
    const playersPerPage = teams.length || 3;
    return Math.ceil(filteredPlayers.length / playersPerPage);
  };

  const handleNextPage = () => {
  const totalPages = getTotalPages();
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      setTimeout(() => updateCurrentBatch(), 0);
    }
    setAllocatedTeamsInBatch(new Set());
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      setTimeout(() => updateCurrentBatch(), 0);
    }
    setAllocatedTeamsInBatch(new Set());
  };

  const handlePageReset = () => {
    setCurrentPage(0);
    setTimeout(() => updateCurrentBatch(), 0);
  };

  return (
    <>
    <style>{teamManagementStyles}</style>
    <div className="team-management-container">
      {message && (
        <div 
          className={`floating-message ${messageType === 'success' ? 'success-message' : 'error-message'}`}
        >
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
      {/* Flag Players Panel */}
        <div className="flag-players-panel">
        <h3>Flagged Players</h3>
        {(() => {
          const flaggedPlayers = players.filter(p => p.isFlagged);
          return flaggedPlayers.length > 0 ? (
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {flaggedPlayers.map((player) => (
                <div key={player._id} style={{ 
                  padding: '8px', 
                  borderBottom: '1px solid #eee',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '14px' }}>
                    {player.firstName} {player.lastName}
                  </span>
                  <button
                    className="btn-add"
                    style={{ fontSize: '12px', padding: '4px 8px' }}
                    onClick={() => {
                      Meteor.call('players.unflag', player._id, (error: Error | null) => {
                        if (error) {
                          showMessage(`Error: ${error.message}`, 'error');
                        } else {
                          showMessage('Player unflagged!', 'success');
                        }
                      });
                    }}
                  >
                    Unflag
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data">No flagged players</div>
          );
        })()}
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
            {selectedTeam.viceCaptainId && (
              <div className="team-captain">
                <strong>Vice Captain:</strong> {getViceCaptain(selectedTeam)?.firstName} {getViceCaptain(selectedTeam)?.lastName}
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
                        {selectedTeam.viceCaptainId === player._id && (
                          <span className="vice-captain-badge"> (VC)</span>
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
                            Captain
                          </button>
                        )}
                        {selectedTeam.viceCaptainId !== player._id && selectedTeam.captainId !== player._id && (
                          <button
                            onClick={() => player._id && handleSetViceCaptain(player._id)}
                            className="btn-vice-captain"
                          >
                            Vice Captain
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
              className="btn-customize"
              onClick={() => setShowFilterModal(true)} 
            >
              Filter
          </button>
          <button 
            className="btn-customize"
            onClick={() => {
              setCurrentPage(0);
              updateCurrentBatch(); 
              setShowAllocationModal(true);
            }}
            disabled={availablePlayers.length === 0}
          >
            Allocate Players
          </button>
        </div>
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
          <h3>Choose Player to Allocate - Showing {teams.length || 3} at a time</h3>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#ffffff' }}>
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
          {availablePlayers.length > 0 ? (
            currentBatch.map((player, index) => (
              <MiniPlayerCard 
                key={player._id}
                player={player}
                index={index}
                onSelect={() => {
                  setSelectedPlayerForAllocation(player);
                  setShowTeamSelection(true);
                }}
              />
            ))
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', gridColumn: '1 / -1' }}>
              No available players to allocate
            </div>
          )}
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
            ({currentBatch.length} in this batch, {filteredPlayers.length} match filters)
            <br />
            <small>Available (filtered): {filteredPlayers.length}, Batch: {currentBatch.length}</small>
            <br />
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
        <div className="filter-modal">
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
            {teams.filter(team => !allocatedTeamsInBatch.has(team._id!)).map((team) => (
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
          <div style={{ padding: '20px', borderTop: '1px solid #eee' }}>
            <button
              className="btn-primary"
              style={{ backgroundColor: '#e74c3c', width: '100%' }}
              onClick={() => handleFlagPlayer(selectedPlayerForAllocation._id!)}
            >
              🚩 Flag This Player
            </button>
          </div>
        </div>
      </div>
    )}
    {showFilterModal && (
        <div className="player-card-overlay">
          <div className="filter-modal">
            <div className="assignment-header">
              <h2>Filter Available Players</h2>
              <button className="close-btn" onClick={() => setShowFilterModal(false)}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <label>
                Sort by Skill:
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </label>

              <label>
                Player Type:
                <select
                  value={playerTypeFilter}
                  onChange={(e) => setPlayerTypeFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="batsman">Batsman</option>
                  <option value="bowler">Bowler</option>
                  <option value="all-rounder">All-Rounder</option>
                  <option value="wicket-keeper">Wicket-Keeper</option>
                </select>
              </label>
              <label>
                How Much Do You Play:
                <select
                  value={howMuchDoYouPlayFilter}
                  onChange={(e) => setHowMuchDoYouPlayFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="Regularly">Regularly</option>
                  <option value="Once a month">Once a month</option>
                  <option value="Once a while">Once a while</option>
                </select>
                {howMuchDoYouPlayFilter !== 'all' && (
                <label>
                  Boost player stars by (%):
                  <input
                    type="number"
                    value={playPercentageBoost}
                    min={0}
                    max={100}
                    onChange={(e) => setPlayPercentageBoost(parseInt(e.target.value) || 0)}
                  />
                </label>
              )}
              </label>
              <button
                className="btn-primary"
                onClick={() => {
                  setShowFilterModal(false);
                  updateCurrentBatch();
                }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};