import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from 'antd';
import { LuMessageCircleMore } from "react-icons/lu";
import useMessageCount from "../../common/useMessageCount.js";

import './index.less';

function HeaderMessages() {
  const navigate = useNavigate();
  
  const { count } = useMessageCount();

  return (
      <div className="header-messages__trigger">
        <Badge onClick={() => navigate("/messages")} count={count} size="small" offset={[0, 2]} color="#FDBA3C">
          <LuMessageCircleMore />
        </Badge>
      </div>
  );
}

export default HeaderMessages;