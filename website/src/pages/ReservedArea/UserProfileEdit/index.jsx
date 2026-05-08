import { useState, useEffect } from 'react';

import _service from '@netuno/service-client';

import ProfileForm from "../../../components/ProfileForm"

function UserProfileEdit({username}) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!username) {
      return;
    }

    console.log("no return");
    _service({
      method: 'GET',
      url: `/people/by?username=${username}`,
      success: (response) => {
        setUser(response.json.data);
      }
    });
  }, [username]);

  if (!user) {
    return;
  }
 
  return (
    <section>
      <ProfileForm people={user} />
    </section>
  )
}

export default UserProfileEdit;
