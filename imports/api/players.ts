import { Mongo } from 'meteor/mongo';

export interface PlayerType {
  _id?: string;
  name: string;
  number: number;
  email: string;
  type: string;
  teamId?: string;
  createdAt: Date;
}

// Collection for player data
export const PlayersCollection = new Mongo.Collection<PlayerType>('players');

// If you need to add schema validation 