import React from 'react';
import FriendList from './List';
import './index.less';

function Friend({ userUid }) {
  return (
    <div className="friend-container">
      <FriendList key={userUid} userUid={userUid} />
    </div>
  );
}

export default Friend;
export { FriendList };
