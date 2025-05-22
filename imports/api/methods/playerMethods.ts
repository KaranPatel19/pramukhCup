import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { PlayersCollection, PlayerType } from '../players';
import Papa from 'papaparse';

Meteor.methods({
  /**
   * Upload players from CSV data
   * @param csvData The raw CSV data as a string
   * @returns Number of players imported
   */
  'players.uploadCsv'(csvData: string) {
    check(csvData, String);

    try {
      // Parse the CSV data
      const result = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true, // Automatically convert strings to numbers where appropriate
      });

      if (result.errors.length > 0) {
        throw new Meteor.Error('parse-error', 'Error parsing CSV file: ' + result.errors[0].message);
      }

      const players = result.data as any[];
      let insertCount = 0;

      // Validate and insert each player
      for (const player of players) {
        // Ensure each player has the required fields
        if (!player.name || player.number === undefined || !player.email || !player.played || !player.category || player.batting === undefined || player.bowling === undefined || player.fielding === undefined) {
          continue; // Skip invalid entries
        }

        // Create a player object
        const newPlayer: Omit<PlayerType, '_id'> = {
        name: player.name,
        number: Number(player.number),
        email: player.email,
        played: player.played,
        category: player.category,
        batting: Number(player.batting),
        bowling: Number(player.bowling),
        fielding: Number(player.fielding),
        teamId: undefined,
        createdAt: new Date(),
      };


        // Insert the player
        PlayersCollection.insertAsync(newPlayer);
        insertCount++;
      }

      return insertCount;
    } catch (error) {
      console.error('Error uploading CSV:', error);
      throw new Meteor.Error('upload-failed', error instanceof Error ? error.message : 'Unknown error');
    }
  },

  /**
   * Remove all players from the collection
   */
  'players.removeAll'() {
    return PlayersCollection.removeAsync({});
  },

  /**
   * Remove a specific player by ID
   */
  'players.remove'(playerId: string) {
    check(playerId, String);
    return PlayersCollection.removeAsync({ _id: playerId });
  },

  /**
   * Update player information
   */
  'players.update'(playerId: string, data: Partial<PlayerType>) {
    check(playerId, String);
    
    // Validate fields
    if (data.name) check(data.name, String);
    if (data.number !== undefined) check(data.number, Number);
    if (data.email) check(data.email, String);
    if (data.played) check(data.played, String);
    if (data.category) check(data.category, String);
    if (data.batting !== undefined) check(data.batting, Number);
    if (data.bowling !== undefined) check(data.bowling, Number);
    if (data.fielding !== undefined) check(data.fielding, Number);

    return PlayersCollection.updateAsync({ _id: playerId }, { $set: data });
  }
});

// If we need to add the publication here
if (Meteor.isServer) {
  Meteor.publish('players', function () {
    return PlayersCollection.find();
  });
}