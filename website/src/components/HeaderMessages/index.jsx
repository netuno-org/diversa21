import { useNavigate } from 'react-router-dom';
import { Badge, Typography } from 'antd';
import { MessageOutlined } from '@ant-design/icons';


import usePeople from "../../common/usePeople.js";
import useNotifications from "../../common/useNotifications.js";

import './index.less';

function HeaderMessages() {
  const loggedUser = usePeople();
  const navigate = useNavigate();

  const { notifications } = useNotifications(loggedUser);
  const messageNotifications = notifications.filter(n => n.type === 'message');
  const unreadCount = messageNotifications.filter(n => !n.read).length;

  return (
      <div className="header-messages__trigger">
        <Badge onClick={() => navigate("/messages")} count={unreadCount} size="small" offset={[-2, 4]} color="#FDBA3C">
          <MessageOutlined style={{ fontSize: 18 }} />
        </Badge>
      </div>
  );
}

export default HeaderMessages;