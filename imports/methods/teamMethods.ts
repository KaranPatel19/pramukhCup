import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { TeamsCollection, TeamType } from '../api/teams';
import { PlayersCollection } from '../api/players';

Meteor.methods({
    async 'teams.create'(name: string) {
    check(name, String);
    
    if (!name.trim()) {
        throw new Meteor.Error('invalid-name', 'Team name cannot be empty');
    }

    const existingTeam = await TeamsCollection.findOneAsync({ name: name.trim() });
    if (existingTeam) {
        throw new Meteor.Error('duplicate-name', 'Team name already exists');
    }

    const newTeam: Omit<TeamType, '_id'> = {
        name: name.trim(),
        memberIds: [],
        createdAt: new Date(),
    };

    return await TeamsCollection.insertAsync(newTeam);
    },
  'teams.delete'(teamId: string) {
    check(teamId, String);
    
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
    async 'teams.addPlayer'(teamId: string, playerId: string) {
    check(teamId, String);
    check(playerId, String);

    const team = await TeamsCollection.findOneAsync({ _id: teamId });
    const player = await PlayersCollection.findOneAsync({ _id: playerId });

    if (!team) {
        throw new Meteor.Error('team-not-found', 'Team not found');
    }
    if (!player) {
        throw new Meteor.Error('player-not-found', 'Player not found');
    }
    if (player.teamId) {
        throw new Meteor.Error('player-already-assigned', 'Player is already assigned to a team');
    }

    await TeamsCollection.updateAsync(
        { _id: teamId },
        { $addToSet: { memberIds: playerId } }
    );

    return await PlayersCollection.updateAsync(
        { _id: playerId },
        { $set: { teamId: teamId } }
    );
    },

  'teams.removePlayer'(teamId: string, playerId: string) {
    check(teamId, String);
    check(playerId, String);

    TeamsCollection.updateAsync(
      { _id: teamId },
      { $pull: { memberIds: playerId } }
    );

    return PlayersCollection.updateAsync(
      { _id: playerId },
      { $unset: { teamId: "" } }
    );
  },

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