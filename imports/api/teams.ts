import { Mongo } from 'meteor/mongo';

export interface TeamType {
  _id?: string;
  name: string;
  captainId?: string;
  memberIds: string[];
  createdAt: Date;
}

export const TeamsCollection = new Mongo.Collection<TeamType>('teams');