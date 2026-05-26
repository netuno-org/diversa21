import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from "react-router-dom";
import { Typography, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

import _service from '@netuno/service-client';

import usePeople from "../../../../common/usePeople.js";

import ProfileForm from "../../../../components/ProfileForm"

function UserProfileEdit({ username }) {
  const loggedUser = usePeople();
  const [user, setUser] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  if (!user) {
    return;
  }

  if (!loggedUser.canManageUser(user)) {
    return <Navigate to="/people" />;
  }

  return (
    <section>
      <ProfileForm
        textTitle="Editar Perfil"
        operation={"edit"}
        people={user}
        redirectTo={"/people"}
      />
    </section>
  )
}

export default UserProfileEdit;
