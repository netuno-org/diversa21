import { useState, useEffect } from 'react';

import _service from '@netuno/service-client';

import Profile from '../../../components/Profile'

function User({username}) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!username) {
      return;
    }

    _service({
      method: 'GET',
      url: `/people/by?username=${username}`,
      success: (response) => {
        setUser(response.json.data);
      }
    });
  }, [username]);

  return (
    <section>
      <Profile user={user} />
    </section>
  )
}

export default User;
