import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import usePeople from "../../common/usePeople.js";
import useNotifications from "../../common/useNotifications.js";

import './index.less';

function HeaderNotifications() {
  const loggedUser = usePeople();
  const navigate = useNavigate();
  const { notifications } = useNotifications(loggedUser);

  const unreadCount = notifications.filter(n => n.type !== 'message' && !n.read).length;

  return (
    <div className="header-notifications__trigger" onClick={() => navigate('/notifications')}>
      <Badge count={unreadCount} size="small" offset={[-2, 4]} color="#FDBA3C">
        <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
      </Badge>
    </div>
  );
}

export default HeaderNotifications;
