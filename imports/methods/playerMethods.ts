import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { PlayersCollection, PlayerType } from '../api/players';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

Meteor.methods({
  /**
 * Upload players from CSV data
 * @param csvData The raw CSV data as a string
 * @returns Number of players imported
 */
async 'players.uploadCsv'(csvData: string) {
  check(csvData, String);

  try {
    const result = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    if (result.errors.length > 0) {
      throw new Meteor.Error('parse-error', 'Error parsing CSV file: ' + result.errors[0].message);
    }

    const players = result.data as any[];
    let insertCount = 0;

    
    for (const player of players) {
      
      if (!player['First Name'] || !player['Last Name'] || !player['Email'] || !player['Phone'] || !player['Age Group'] || !player['Player Type'] || player['Batting Skill'] === undefined || player['Bowling Skill'] === undefined || player['Fielding Skill'] === undefined) {
        continue; 
      }
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
      await PlayersCollection.insertAsync(newPlayer);
      insertCount++;
    }

    return insertCount;
  } catch (error) {
    console.error('Error uploading CSV:', error);
    throw new Meteor.Error('upload-failed', error instanceof Error ? error.message : 'Unknown error');
  }
},
'players.flag'(playerId: string) {
  check(playerId, String);
  return PlayersCollection.updateAsync({ _id: playerId }, { $set: { isFlagged: true } });
},

'players.unflag'(playerId: string) {
  check(playerId, String);
  return PlayersCollection.updateAsync({ _id: playerId }, { $unset: { isFlagged: "" } });
},

  /**
   * Upload players from Excel data
   * @param excelData The Excel file data as ArrayBuffer
   * @returns Number of players imported
   */
  async 'players.uploadExcel'(excelData: number[]) {
  check(excelData, Match.Any);

  try {
    console.log('Received data type:', typeof excelData);
    console.log('Received data constructor:', excelData.constructor.name);
    console.log('Data length/size:', excelData instanceof ArrayBuffer ? excelData.byteLength : ((excelData as any).length || 'unknown'));
    console.log('Is ArrayBuffer?', excelData instanceof ArrayBuffer);
    console.log('Is Buffer?', Buffer.isBuffer(excelData));
        console.log('Converting array to Buffer for XLSX processing...');
        const buffer = Buffer.from(excelData);
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        console.log('Workbook sheet names:', workbook.SheetNames);
        console.log('Number of sheets:', workbook.SheetNames.length);

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        console.log('Selected sheet name:', sheetName);
        console.log('Worksheet object:', worksheet);
        console.log('Worksheet range:', worksheet['!ref']);


        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        console.log('Excel parsing - jsonData length:', jsonData.length);
        console.log('Excel parsing - first row sample:', jsonData[0]);

        if (jsonData.length === 0) {
        console.log('Trying alternative parsing...');
        
        const alternativeData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        console.log('Alternative parsing - array format:', alternativeData);
        
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:Z100');
        console.log('Cell range:', range);
        console.log('Cell A1 value:', worksheet['A1']);
        console.log('Cell B1 value:', worksheet['B1']);
        }

        if (jsonData.length === 0) {
        throw new Meteor.Error('empty-file', 'Excel file is empty');
        }

        let insertCount = 0;

        for (const playerData of jsonData) {
        const player = playerData as any;
        console.log('Processing player:', player);

        if (!player['First Name'] || !player['Last Name'] || !player['Email'] || 
            !player['Phone'] || !player['Age Group'] || !player['Player Type'] || 
            player['Batting Skill'] === undefined || player['Bowling Skill'] === undefined || 
            player['Fielding Skill'] === undefined) {
        console.log('Skipping player due to missing fields. Player data:', JSON.stringify(player, null, 2));
        console.log('Missing fields check:');
        console.log('First Name:', player['First Name']);
        console.log('Last Name:', player['Last Name']);
        console.log('Email:', player['Email']);
        console.log('Phone:', player['Phone']);
        console.log('Age Group:', player['Age Group']);
        console.log('Player Type:', player['Player Type']);
        continue;
        }
        const newPlayer: Omit<PlayerType, '_id'> = {
        firstName: String(player['First Name']).trim(),
        lastName: String(player['Last Name']).trim(),
        email: String(player['Email']).trim(),
        phone: parseInt(String(player['Phone']).replace(/\D/g, ''), 10), 
        ageGroup: String(player['Age Group']).trim(),
        playerType: String(player['Player Type']).trim(),
        tShirtSize: String(player['T-Shirt Size'] || '').trim(),
        battingSkill: parseInt(String(player['Batting Skill']), 10) || 0,
        bowlingSkill: parseInt(String(player['Bowling Skill']), 10) || 0,
        fieldingSkill: parseInt(String(player['Fielding Skill']), 10) || 0,
        howMuchDoYouPlay: String(player['How Much Do You Play'] || '').trim(),
        photo: String(player['Photo'] || '').trim(),
        consent: String(player['Consent'] || '').trim(),
        teamId: undefined,
        createdAt: new Date(),
        };

        await PlayersCollection.insertAsync(newPlayer);
        insertCount++;
      }

      return insertCount;
    } catch (error) {
      console.error('Error uploading Excel:', error);
      throw new Meteor.Error('upload-failed', error instanceof Error ? error.message : 'Unknown error');
    }
  },

  'players.removeAll'() {
    return PlayersCollection.removeAsync({});
  },

  'players.remove'(playerId: string) {
    check(playerId, String);
    return PlayersCollection.removeAsync({ _id: playerId });
  },

'players.update'(playerId: string, data: Partial<PlayerType>) {
  check(playerId, String);
  
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

if (Meteor.isServer) {
  Meteor.publish('players', function () {
    return PlayersCollection.find();
  });
}