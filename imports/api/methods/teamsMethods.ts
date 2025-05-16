import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { TeamsCollection } from '../teams';

Meteor.methods({
  'teams.insert'(name: string) {
    check(name, String);
    return TeamsCollection.insertAsync({ name, createdAt: new Date() });
  },

  'teams.remove'(teamId: string) {
    check(teamId, String);
    return TeamsCollection.removeAsync({ _id: teamId });
  },

  // Add this new method
  'teams.addPlayer'(teamId: string, playerId: string) {
    check(teamId, String);
    check(playerId, String);
    
    // Update the player document to set their teamId
    return Meteor.call('players.update', playerId, { teamId });
  },

  // Add this new method
  'teams.removePlayer'(playerId: string) {
    check(playerId, String);
    
    // Update the player document to clear their teamId
    return Meteor.call('players.update', playerId, { teamId: undefined });
  }
});

if (Meteor.isServer) {
  Meteor.publish('teams', function () {
    return TeamsCollection.find();
  });
}