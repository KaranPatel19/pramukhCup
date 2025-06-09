import { Mongo } from 'meteor/mongo';

export interface PlayerType {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: number;
  ageGroup: string;
  playerType: string;
  tShirtSize: string;
  battingSkill: number;
  bowlingSkill: number;
  fieldingSkill: number;
  howMuchDoYouPlay: string;
  photo: string;
  consent: string;
  teamId?: string;
  createdAt: Date;
}

// Collection for player data
export const PlayersCollection = new Mongo.Collection<PlayerType>('players');

// If you need to add schema validation ca