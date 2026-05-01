import { useState, useEffect } from 'react';
import {Typography} from "antd";

import _service from '@netuno/service-client';

import Profile from '../../../components/Profile'

import "./index.less";

const { Title } = Typography;

function User({username}) {
  const [user, setUser] = useState(null);
  
  //console.log(username);
  
  useEffect(() => {
    if (!username) {
      return;
    }

    _service({
      method: 'GET',
      url: `/people/by?username=${username}`,
      success: (response) => {
        setUser(response.json.data);
        //console.log(response.json);
      }
    });
  }, [username]);


      //<p> Hello {username} </p>
  return (
    <section className="user-profile">
      <Profile user={user} />
    </section>
  )
}

export default User;
