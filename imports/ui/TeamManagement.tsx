import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { PlayersCollection, PlayerType } from '../api/players';
import { TeamsCollection } from '../api/teams';
import { PlayerCard } from './PlayerCard';
import { TeamCustomization, TeamConfig } from './TeamCustomization';
// Let's define interfaces for our team structure
interface TeamMember extends PlayerType {
  isCaptain: boolean;
}

interface Team {
  _id?: string;
  name: string;
  members: TeamMember[];
  createdAt: Date;
}

export const TeamManagement: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [newTeamName, setNewTeamName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPlayerCards, setShowPlayerCards] = useState(false);
  const [selectedPlayerForAssignment, setSelectedPlayerForAssignment] = useState<PlayerType | null>(null);
  const [cardsAnimating, setCardsAnimating] = useState(false);
  const { players, isLoading } = useTracker(() => {
    const subscription = Meteor.subscribe('players');
    return {
      players: PlayersCollection.find({}, { sort: { name: 1 } }).fetch(),
      isLoading: !subscription.ready(),
    };
  });

    const { teamsFromDb } = useTracker(() => {
    const sub = Meteor.subscribe('teams');
    return {
      teamsFromDb: sub.ready() ? TeamsCollection.find({}, { sort: { createdAt: -1 } }).fetch() : [],
    };
    }, []);
    useEffect(() => {
  if (teamsFromDb.length > 0 && players.length > 0) {
    const enrichedTeams: Team[] = teamsFromDb.map(team => {
      // Find all players that belong to this team
      const teamMembers = players
        .filter(player => player.teamId === team._id)
        .map(player => ({
          ...player,
          isCaptain: false // You might want to store this in the database too
        }));
      
      return {
        ...team,
        members: teamMembers
      };
    });
    
    setTeams(enrichedTeams);
    
    // If there's a selected team, update it with the enriched version
    if (currentTeam) {
      const updatedCurrentTeam = enrichedTeams.find(team => team._id === currentTeam._id);
      if (updatedCurrentTeam) {
        setCurrentTeam(updatedCurrentTeam);
      }
    }
  }
}, [teamsFromDb, players]);
    
  const createNewTeam = () => {
  if (!newTeamName.trim()) {
    setErrorMessage('Team name cannot be empty');
    return;
  }

  // Check for duplicate team names locally
  if (teams.some(team => team.name.toLowerCase() === newTeamName.toLowerCase())) {
    setErrorMessage('A team with this name already exists');
    return;
  }

  Meteor.call('teams.insert', newTeamName, (err: Meteor.Error | undefined, teamId: string) => {
    if (err) {
      setErrorMessage(err.reason || 'Error creating team');
    } else {
      const newTeam: Team = {
        _id: teamId,
        name: newTeamName,
        members: [],
        createdAt: new Date(),
      };

      setTeams([...teams, newTeam]);
      setCurrentTeam(newTeam);
      setNewTeamName('');
      setSuccessMessage(`Team "${newTeamName}" created successfully`);
      setErrorMessage(null);

      setTimeout(() => setSuccessMessage(null), 3000);
    }
  });
};


  const selectTeam = (team: Team) => {
    setCurrentTeam(team);
    setErrorMessage(null);
  };
    
  const calculatePlayerStars = (player: PlayerType): number => {
    return player.batting + player.bowling + player.fielding;
  };


  const addPlayerToTeam = (player: PlayerType) => {
  if (!currentTeam) {
    setErrorMessage('Please select a team first');
    return;
  }

  // Check if player is already in the team
  if (currentTeam.members.some(member => member._id === player._id)) {
    setErrorMessage(`${player.name} is already in ${currentTeam.name}`);
    return;
  }

  // Add player to team in database
  Meteor.call('teams.addPlayer', currentTeam._id, player._id, (error: Error | null) => {
    if (error) {
      setErrorMessage(`Error adding player: ${error.message}`);
      return;
    }

    // Add player to local state
    const newMember: TeamMember = {
      ...player,
      isCaptain: false
    };

    const updatedTeam = {
      ...currentTeam,
      members: [...currentTeam.members, newMember]
    };

    // Update the teams array
    const updatedTeams = teams.map(team => 
      team._id === currentTeam._id ? updatedTeam : team
    );

    setTeams(updatedTeams);
    setCurrentTeam(updatedTeam);
    setSuccessMessage(`${player.name} added to ${currentTeam.name}`);
    setErrorMessage(null); // Close the player card after adding

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  });
};
// Helper function to get card background color based on player type
const removePlayerFromTeam = (playerId: string) => {
  if (!currentTeam) return;

  // Remove player from team in database
  Meteor.call('teams.removePlayer', playerId, (error: Error | null) => {
    if (error) {
      setErrorMessage(`Error removing player: ${error.message}`);
      return;
    }

    const updatedMembers = currentTeam.members.filter(member => member._id !== playerId);
    const updatedTeam = {
      ...currentTeam,
      members: updatedMembers
    };

    // Update the teams array
    const updatedTeams = teams.map(team => 
      team._id === currentTeam._id ? updatedTeam : team
    );

    setTeams(updatedTeams);
    setCurrentTeam(updatedTeam);
    setSuccessMessage('Player removed from team');
    setTimeout(() => setSuccessMessage(null), 3000);
  });
};

  const toggleCaptain = (playerId: string) => {
    if (!currentTeam) return;

    const updatedMembers = currentTeam.members.map(member => {
      if (member._id === playerId) {
        return { ...member, isCaptain: !member.isCaptain };
      }
      return member;
    });

    const updatedTeam = {
      ...currentTeam,
      members: updatedMembers
    };

    // Update the teams array
    const updatedTeams = teams.map(team => 
      team._id === currentTeam._id ? updatedTeam : team
    );

    setTeams(updatedTeams);
    setCurrentTeam(updatedTeam);
  };

  const deleteTeam = (teamId: string) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      Meteor.call('teams.remove', teamId, (error: Error | null) => {
        if (error) {
          setErrorMessage(`Error deleting team: ${error.message}`);
        } else {
          const updatedTeams = teams.filter(team => team._id !== teamId);
          setTeams(updatedTeams);
          
          if (currentTeam && currentTeam._id === teamId) {
            setCurrentTeam(null);
          }
          setSuccessMessage('Team deleted successfully');
          setTimeout(() => setSuccessMessage(null), 3000);
        }
      });
    }
  };

  const availablePlayers = players ? players.filter(player => 
    !currentTeam?.members.some(member => member._id === player._id)
  ) : [];

  return (
    <div className="team-management">
      <h2>Team Management</h2>

      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      <div className="team-management-container">
        {/* Team List Panel */}
        <div className="team-list-panel">
          <h3>Teams</h3>
          <div className="create-team">
            <input
              type="text"
              placeholder="New Team Name"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
            />
            <button onClick={createNewTeam} className="btn-create">Create Team</button>
          </div>

          {teams.length > 0 ? (
            <ul className="teams-list">
              {teams.map(team => (
                <li 
                  key={team._id} 
                  className={currentTeam && currentTeam._id === team._id ? 'selected' : ''}
                  onClick={() => selectTeam(team)}
                >
                  <span className="team-name">{team.name}</span>
                  <span className="team-members-count">
                    {team.members.length} {team.members.length === 1 ? 'player' : 'players'}
                  </span>
                  <button 
                    className="btn-delete-small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTeam(team._id as string);
                    }}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-data">No teams created yet.</div>
          )}
        </div>
        <button 
        onClick={() => {
          setCardsAnimating(true);
          setShowPlayerCards(true);
          // Reset animation state after cards finish animating
          setTimeout(() => setCardsAnimating(false), 1500);
        }}
        className="btn-choose" 
        disabled={availablePlayers.length === 0}
        >
        Show Player Cards ({availablePlayers.length})
        </button>
        {/* Team Detail Panel */}
        <div className="team-detail-panel">
          {currentTeam ? (
            <>
              <h3>{currentTeam.name} Roster</h3>
              {currentTeam.members.length > 0 ? (
                <table className="team-members-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Number</th>
                      <th>Category</th>
                      <th>Captain</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTeam.members.map(member => (
                      <tr key={member._id}>
                        <td>{member.name}</td>
                        <td>{member.number}</td>
                        <td>{member.category}</td>
                        <td>
                          <input
                            type="checkbox"
                            checked={member.isCaptain}
                            onChange={() => toggleCaptain(member._id as string)}
                          />
                        </td>
                        <td>
                          <button 
                            onClick={() => removePlayerFromTeam(member._id as string)}
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
              <p>Please select a team from the list or create a new one</p>
            </div>
          )}
        </div>

        {/* Available Players Panel */}
        <div className="available-players-panel">
          <h3>Available Players</h3>
          {isLoading ? (
            <div className="loading">Loading players...</div>
          ) : availablePlayers.length > 0 ? (
            <table className="available-players-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Number</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {availablePlayers.map(player => (
                  <tr key={player._id}>
                    <td>{player.name}</td>
                    <td>{player.number}</td>
                    <td>{player.category}</td>
                    <td>
                      <button 
                        onClick={() => addPlayerToTeam(player)}
                        className="btn-add"
                        disabled={!currentTeam}
                      >
                        Add to Team
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-data">
              {players && players.length > 0 
                ? 'All players are assigned to the current team' 
                : 'No players available. Upload players first.'}
            </div>
          )}
        </div>
      </div>
      {showPlayerCards && (
      <div className="player-card-overlay" onClick={() => setShowPlayerCards(false)}>
        <div className="cards-grid" onClick={(e) => e.stopPropagation()}>
          <div className="cards-header">
            <h3>Select a Player to Assign</h3>
            <button className="close-btn" onClick={() => setShowPlayerCards(false)}>×</button>
          </div>
          <div className="cards-container">
            {availablePlayers.slice(0, 10).map((player, index) => (
              <div 
                key={player._id} 
                className={`mini-player-card card-${index + 1}`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => {
                  setSelectedPlayerForAssignment(player);
                  setShowPlayerCards(false);
                }}
              >
                <div className="mini-card-header" style={{ 
                  background: player.category === 'Batsmen' ? '#e74c3c' : 
                            player.category === 'Bowler' ? '#3498db' : 
                            player.category === 'All-Rounder' ? '#2ecc71' : '#9b59b6'
                }}>
                  <span className="mini-card-name">{player.name}</span>
                </div>
                <div className="mini-card-body">
                  <div className="mini-card-category">{player.category}</div>
                  <div className="mini-card-stats">
                    <div>Bat: {'★'.repeat(player.batting)}</div>
                    <div>Bowl: {'★'.repeat(player.bowling)}</div>
                    <div>Field: {'★'.repeat(player.fielding)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}

    {selectedPlayerForAssignment && (
      <div className="player-card-overlay" onClick={() => setSelectedPlayerForAssignment(null)}>
        <div className="team-assignment-modal" onClick={(e) => e.stopPropagation()}>
          <div className="assignment-header">
            <h3>Assign {selectedPlayerForAssignment.name} to Team</h3>
            <button className="close-btn" onClick={() => setSelectedPlayerForAssignment(null)}>×</button>
          </div>
          <div className="teams-selection">
            {teams.map(team => (
              <div 
                key={team._id} 
                className="team-option" 
                onClick={() => {
                  setCurrentTeam(team);
                  addPlayerToTeam(selectedPlayerForAssignment);
                  setSelectedPlayerForAssignment(null);
                }}
              >
                <div className="team-option-name">{team.name}</div>
                <div className="team-option-count">{team.members.length} players</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
    </div>
  );
};