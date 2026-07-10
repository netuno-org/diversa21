import React from 'react'
import { Tabs } from 'antd';
import { useSearchParams } from 'react-router-dom';
import FriendList from '../../../components/Friend/List';
import FriendRequests from './FriendRequests';

import './index.less';

function MyConnections() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'friends';

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

  const handleTabChange = (key) => {
    setSearchParams({ tab: key });
  };

  return (
    <div className="friends__list-tabs">
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={items}
        size="large"
      />
    </div>
  );
}

export default MyConnections;