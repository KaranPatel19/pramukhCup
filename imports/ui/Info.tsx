import React from 'react';
import { useFind, useSubscribe } from 'meteor/react-meteor-data';
import { LinksCollection, LinkType } from '../api/links';

export const Info: React.FC = () => {
  const isLoading = useSubscribe('links');
  const links = useFind(() => LinksCollection.find());

  if(isLoading()) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Learn Meteor!</h2>
      <ul>{links.map(
        (link: LinkType) => <li key={link._id}>
          <a href={link.url} target="_blank">{link.title}</a>
        </li>
      )}</ul>
    </div>
  );
};