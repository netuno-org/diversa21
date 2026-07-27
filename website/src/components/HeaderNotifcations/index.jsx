import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import useNotificationCount from "../../common/useNotificationCount.js"; 

import './index.less';

function HeaderNotifications() {
  const navigate = useNavigate();
  const { count } = useNotificationCount();

  return (
    <div className="header-notifications__trigger" onClick={() => navigate('/notifications')}>
      <Badge count={count} size="small" offset={[-2, 4]} color="#FDBA3C">
        <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
      </Badge>
    </div>
  );
}

export default HeaderNotifications;