import { Meteor } from 'meteor/meteor';
import { LinksCollection } from '/imports/api/links';
import { PlayersCollection } from '/imports/api/players';

// Import methods to ensure they're registered
import '/imports/api/methods/playerMethods';

async function insertLink({ title, url }: { title: string; url: string }) {
  await LinksCollection.insertAsync({ title, url, createdAt: new Date() });
}

Meteor.startup(async () => {
  // If the Links collection is empty, add some data.
  try {
    // Use countAsync() instead of count() as required by newer Meteor versions
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

    // We publish the entire Links collection to all clients.
    // In order to be fetched in real-time to the clients
    Meteor.publish("links", function () {
      return LinksCollection.find();
    });

    // Publish players collection
    Meteor.publish("players", function () {
      return PlayersCollection.find();
    });
  } catch (error) {
    console.error('Error during startup:', error);
  }
});