import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { PlayersCollection, PlayerType } from '../api/players';
import { TeamsCollection } from '../api/teams';
import { PlayerCard } from './PlayerCard';
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
  const [choosing, setChoosing] = useState(false);
  const [highlightedPlayerId, setHighlightedPlayerId] = useState<string | null>(null);
  const [selectedRandomPlayer, setSelectedRandomPlayer] = useState<PlayerType | null>(null);

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
    useEffect(() => {
    const enrichedTeams: Team[] = teamsFromDb.map(team => ({
        ...team,
        members: [], // add empty members array for local UI use
    }));
    setTeams(enrichedTeams);
    }, [teamsFromDb]);


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
    
  const chooseRandomPlayer = () => {
  if (!currentTeam || availablePlayers.length === 0) return;

  setChoosing(true);
  let flashes = 0;
  let delay = 50;

  const maxFlashes = 10; // Reduced for faster card appearance
  const flashPlayer = () => {
    const randomPlayer = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
    setHighlightedPlayerId(randomPlayer._id!);
    flashes++;

    if (flashes < maxFlashes) {
      delay += 15; // slow down as we go
      setTimeout(flashPlayer, delay);
    } else {
      // When done flashing, show the player card
      setHighlightedPlayerId(null);
      setSelectedRandomPlayer(randomPlayer);
      setChoosing(false);
    }
  };

  flashPlayer();
};
  const handleAddSelectedPlayer = () => {
    if (selectedRandomPlayer && currentTeam) {
      addPlayerToTeam(selectedRandomPlayer);
      setSelectedRandomPlayer(null);
    }
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
    setErrorMessage(null);
    setSelectedRandomPlayer(null); // Close the player card after adding

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  });
};

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
      const updatedTeams = teams.filter(team => team._id !== teamId);
      setTeams(updatedTeams);
      
      if (currentTeam && currentTeam._id === teamId) {
        setCurrentTeam(null);
      }
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
        onClick={chooseRandomPlayer} 
        className="btn-choose" 
        disabled={!currentTeam || availablePlayers.length === 0 || choosing}
        >
        Choose Random Player
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
                      <th>Type</th>
                      <th>Captain</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTeam.members.map(member => (
                      <tr key={member._id}>
                        <td>{member.name}</td>
                        <td>{member.number}</td>
                        <td>{member.type}</td>
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
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {availablePlayers.map(player => (
                  <tr key={player._id} className={highlightedPlayerId === player._id ? 'highlighted-row' : ''}>
                    <td>{player.name}</td>
                    <td>{player.number}</td>
                    <td>{player.type}</td>
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
      {selectedRandomPlayer && (
        <PlayerCard 
          player={selectedRandomPlayer} 
          onClose={handleAddSelectedPlayer} 
        />
      )}
    </div>
  );
};