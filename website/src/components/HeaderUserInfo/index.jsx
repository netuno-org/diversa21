import React, {useState, useEffect} from 'react';

import { Spin } from 'antd';

import _service from '@netuno/service-client';

import usePeople from "../../common/usePeople.js";

import './index.less';

function HeaderUserInfo() {
  const [loading, setLoading] = useState(false);
  const [avatarImageURL, setAvatarImageURL] = useState('/images/profile-default.png');
  const people = usePeople();
  useEffect(() => {
    if (people.data == null) {
      setLoading(true);
    } else {
      setLoading(false);
      setAvatarImageURL(null);
      if (people.data.avatar) {
        setTimeout(() => setAvatarImageURL(_service.url(`/people/avatar?uid=${people.data.uid}&${new Date().getTime()}`)), 250);
      }
    }
  }, [people.data]);
  if (loading) {
    return (
      <div>
        <Spin/>
      </div>
    );
  }
  if (people.data) {
    return (
      <div className="header__user-info">
        {avatarImageURL && <img src={avatarImageURL}/>}
        <span>{people.data.name}</span>
      </div>
    );
  }
  return (
      <div></div>
  );
}

export default HeaderUserInfo;
