import { useState, useEffect } from 'react';
import { Typography, Form, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

import _service from '@netuno/service-client';

import ProfileForm from "../../../components/ProfileForm"

const { Title } = Typography;

function UserProfileEdit({username}) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
      <div className="content-title">
        <Button className="go-back-btn" type="link" onClick={() => navigate(-1)}><ArrowLeftOutlined /> Voltar atrás</Button>
      </div>
      <div className="content-title">
        <Title level={2}>Editar Perfil</Title>
      </div>
      <ProfileForm
        operation={"edit"}
        people={user} 
        redirectTo={"/people"}
        configProvider={null}
        configAltcha={null}
        altchaPayload={null}
      />
    </section>
  )
}

export default UserProfileEdit;
