import React, { useState, useEffect } from 'react';


import _ws from '@netuno/ws-client';
import useWS from "../../common/useWS.js";
import _service from '@netuno/service-client';

import { Spin, Avatar } from 'antd';

import usePeople from "../../common/usePeople.js";

import './index.less';

function HeaderUserInfo() {
  const [loading, setLoading] = useState(false);
  const [avatarImageURL, setAvatarImageURL] = useState('/images/profile-default.png');
  const [state, setState] = useState(0);
  const [messageUnreadTotal, setMessageUnreadTotal] = useState(0);

  const people = usePeople();
  const ws = useWS();

  useEffect(() => {
    if (people.data == null) {
      setLoading(true);
    } else {
      setLoading(false);
      if (people.data.avatar) {
        setTimeout(() => setAvatarImageURL(_service.url(`/asset?uid=${people.data.uid}&type=avatar&entity=people&${new Date().getTime()}`)), 250);
      } else {
        setAvatarImageURL('/images/profile-default.png')
      }
      setMessageUnreadTotal(0);
      if (!ws.data) {
        setState(0);
      }
      if (ws.data?.connected) {
        setState(1);
      } else if (ws.data?.connected == false) {
        setState(-1);
      }
    }
  }, [people.data, ws.data]);

  if (loading) {
    return (
      <div>
        <Spin />
      </div>
    );
  }

  if (people.data) {
    return (
      <div className="header__user-info">
        <div className="header__user-info__avatar__badge"
          style={{
            backgroundColor: (state === 0 && '#d87a16') || (state === 1 && '#49aa19') || (state === -1 && '#dc4446'),
            width: messageUnreadTotal > 99 ? '26px' : messageUnreadTotal > 10 ? '22px' : '16px',
            right: messageUnreadTotal > 99 ? '0' : messageUnreadTotal > 10 ? '2px' : '5px',
          }}
        >
          {messageUnreadTotal === 0 ? null : messageUnreadTotal > 99 ? '+99' : messageUnreadTotal}
        </div>
        <Avatar src={avatarImageURL} shape="square" />
      </div>
    );
  }
  return (
    <div></div>
  );
}

export default HeaderUserInfo;
