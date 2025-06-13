import { Meteor } from 'meteor/meteor';
import { LinksCollection } from '/imports/api/links';
import { PlayersCollection } from '/imports/api/players';
import '../imports/methods/playerMethods';
import '../imports/methods/teamMethods';

async function insertLink({ title, url }: { title: string; url: string }) {
  await LinksCollection.insertAsync({ title, url, createdAt: new Date() });
}

Meteor.startup(async () => {
  try {
    if (await LinksCollection.find().countAsync() === 0) {
      await insertLink({
        title: 'Do the Tutorial',
        url: 'https://react-tutorial.meteor.com/simple-todos/01-creating-app.html',
      });
      
      await insertLink({
        title: 'Follow the Guide',
        url: 'https://guide.meteor.com',
      });
      
      await insertLink({
        title: 'Read the Docs',
        url: 'https://docs.meteor.com',
      });
      
      await insertLink({
        title: 'Discussions',
        url: 'https://forums.meteor.com',
      });
    }
    Meteor.publish("links", function () {
      return LinksCollection.find();
    });

    Meteor.publish("players", function () {
      return PlayersCollection.find();
    });
  } catch (error) {
    console.error('Error during startup:', error);
  }
});