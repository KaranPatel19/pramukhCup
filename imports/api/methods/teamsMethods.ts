import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { TeamsCollection } from '../teams';

Meteor.methods({
  'teams.insert'(name: string) {
    check(name, String);
    return TeamsCollection.insert({ name, createdAt: new Date() });
  },

  'teams.remove'(teamId: string) {
    check(teamId, String);
    return TeamsCollection.remove({ _id: teamId });
  }
});
if (Meteor.isServer) {
  Meteor.publish('teams', function () {
    return TeamsCollection.find();
  });
}
