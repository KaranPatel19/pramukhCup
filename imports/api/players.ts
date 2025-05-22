import { Mongo } from 'meteor/mongo';

export interface PlayerType {
  _id?: string;
  name: string;
  number: number;
  email: string;
  played: string;
  category: string;
  batting: number;
  bowling: number;
  fielding: number;
  teamId?: string;
  createdAt: Date;
}

// Collection for player data
export const PlayersCollection = new Mongo.Collection<PlayerType>('players');

// If you need to add schema validation ca