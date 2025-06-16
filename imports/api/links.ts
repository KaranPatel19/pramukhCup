import { Mongo } from 'meteor/mongo';

export interface LinkType {
  _id?: string;
  title: string;
  url: string;
  createdAt: Date;
}
export const LinksCollection = new Mongo.Collection<LinkType>('links');
