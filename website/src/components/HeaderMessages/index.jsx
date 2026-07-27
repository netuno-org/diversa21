import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import useMessageCount from "../../common/useMessageCount.js";

import './index.less';

function HeaderMessages() {
  const navigate = useNavigate();
  
  const { count } = useMessageCount();

  return (
      <div className="header-messages__trigger">
        <Badge onClick={() => navigate("/messages")} count={count} size="small" offset={[-2, 4]} color="#FDBA3C">
          <MessageOutlined style={{ fontSize: 18 }} />
        </Badge>
      </div>
  );
}

export default HeaderMessages;