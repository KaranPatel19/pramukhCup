// /imports/api/teams.ts
import { Mongo } from 'meteor/mongo';

export interface TeamType {
  _id?: string;
  name: string;
  createdAt: Date;
}

export const TeamsCollection = new Mongo.Collection<TeamType>('teams');
