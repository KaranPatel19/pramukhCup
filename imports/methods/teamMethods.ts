import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { TeamsCollection, TeamType } from 'api/teams';
import { PlayersCollection } from 'api/players';

Meteor.methods({
  /**
   * Create a new team
   */
  'teams.create'(name: string) {
    check(name, String);
    
    if (!name.trim()) {
      throw new Meteor.Error('invalid-name', 'Team name cannot be empty');
    }

    // Check if team name already exists
    const existingTeam = TeamsCollection.findOne({ name: name.trim() });
    if (existingTeam) {
      throw new Meteor.Error('duplicate-name', 'Team name already exists');
    }

    const newTeam: Omit<TeamType, '_id'> = {
      name: name.trim(),
      memberIds: [],
      createdAt: new Date(),
    };

    return TeamsCollection.insertAsync(newTeam);
  },

  /**
   * Delete a team
   */
  'teams.delete'(teamId: string) {
    check(teamId, String);
    
    // Remove team reference from all players
    PlayersCollection.updateAsync(
      { teamId: teamId },
      { $unset: { teamId: "" } },
      { multi: true }
    );

    return TeamsCollection.removeAsync({ _id: teamId });
  },

  /**
   * Add player to team
   */
  'teams.addPlayer'(teamId: string, playerId: string) {
    check(teamId, String);
    check(playerId, String);

    const team = TeamsCollection.findOne({ _id: teamId });
    const player = PlayersCollection.findOne({ _id: playerId });

    if (!team) {
      throw new Meteor.Error('team-not-found', 'Team not found');
    }
    if (!player) {
      throw new Meteor.Error('player-not-found', 'Player not found');
    }
    if (player.teamId) {
      throw new Meteor.Error('player-already-assigned', 'Player is already assigned to a team');
    }

    // Add player to team
    TeamsCollection.updateAsync(
      { _id: teamId },
      { $addToSet: { memberIds: playerId } }
    );

    // Update player's team reference
    return PlayersCollection.updateAsync(
      { _id: playerId },
      { $set: { teamId: teamId } }
    );
  },

  /**
   * Remove player from team
   */
  'teams.removePlayer'(teamId: string, playerId: string) {
    check(teamId, String);
    check(playerId, String);

    // Remove player from team
    TeamsCollection.updateAsync(
      { _id: teamId },
      { $pull: { memberIds: playerId } }
    );

    // Remove team reference from player
    return PlayersCollection.updateAsync(
      { _id: playerId },
      { $unset: { teamId: "" } }
    );
  },

  /**
   * Set team captain
   */
  'teams.setCaptain'(teamId: string, playerId: string) {
    check(teamId, String);
    check(playerId, String);

    const team = TeamsCollection.findOne({ _id: teamId });
    if (!team) {
      throw new Meteor.Error('team-not-found', 'Team not found');
    }
    if (!team.memberIds.includes(playerId)) {
      throw new Meteor.Error('player-not-in-team', 'Player is not a member of this team');
    }

    return TeamsCollection.updateAsync(
      { _id: teamId },
      { $set: { captainId: playerId } }
    );
  }
});

if (Meteor.isServer) {
  Meteor.publish('teams', function () {
    return TeamsCollection.find();
  });
}