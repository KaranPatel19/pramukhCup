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
        // Ensure each player has the required fields
        if (!player['First Name'] || !player['Last Name'] || !player['Email'] || !player['Phone'] || !player['Age Group'] || !player['Player Type'] || player['Batting Skill'] === undefined || player['Bowling Skill'] === undefined || player['Fielding Skill'] === undefined) {
          continue; // Skip invalid entries
        }

        // Create a player object
        const newPlayer: Omit<PlayerType, '_id'> = {
          firstName: player['First Name'],
          lastName: player['Last Name'],
          email: player['Email'],
          phone: Number(player['Phone']),
          ageGroup: player['Age Group'],
          playerType: player['Player Type'],
          tShirtSize: player['T-Shirt Size'] || '',
          battingSkill: Number(player['Batting Skill']),
          bowlingSkill: Number(player['Bowling Skill']),
          fieldingSkill: Number(player['Fielding Skill']),
          howMuchDoYouPlay: player['How Much Do You Play'] || '',
          photo: player['Photo'] || '',
          consent: player['Consent'] || '',
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
  if (data.firstName) check(data.firstName, String);
  if (data.lastName) check(data.lastName, String);
  if (data.email) check(data.email, String);
  if (data.phone !== undefined) check(data.phone, Number);
  if (data.ageGroup) check(data.ageGroup, String);
  if (data.playerType) check(data.playerType, String);
  if (data.tShirtSize) check(data.tShirtSize, String);
  if (data.battingSkill !== undefined) check(data.battingSkill, Number);
  if (data.bowlingSkill !== undefined) check(data.bowlingSkill, Number);
  if (data.fieldingSkill !== undefined) check(data.fieldingSkill, Number);
  if (data.howMuchDoYouPlay) check(data.howMuchDoYouPlay, String);
  if (data.photo) check(data.photo, String);
  if (data.consent) check(data.consent, String);

  return PlayersCollection.updateAsync({ _id: playerId }, { $set: data });
}
});

// If we need to add the publication here
if (Meteor.isServer) {
  Meteor.publish('players', function () {
    return PlayersCollection.find();
  });
}