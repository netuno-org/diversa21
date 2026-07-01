import React from 'react'
import { Tabs } from 'antd';
import FriendList from '../../../components/Friend/List';
import FriendRequests from './FriendRequests';

import './index.less';

function MyConnections() {
  const items = [
    {
      key: 'friends',
      label: 'Amigos',
      children: (
        <FriendList />
      ),
    },
    {
      key: 'received-requests',
      label: 'Solicitações de amizade',
      children: (
        <FriendRequests />
      ),
    },
  ];

  return (
    <div className="friends__list-tabs">
      <Tabs
        items={items}
        size="large"
      />
    </div>
  );
}
export default MyConnections;
