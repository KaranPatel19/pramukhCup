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
  boostedStars?: number; 
  createdAt: Date;
}

export const PlayersCollection = new Mongo.Collection<PlayerType>('players');
