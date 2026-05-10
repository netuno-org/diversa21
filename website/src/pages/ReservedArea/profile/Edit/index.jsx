import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Button, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

import ProfileForm from "../../../../components/ProfileForm"

import usePeople from "../../../../common/usePeople.js";

const { Title } = Typography;

function ProfileEdit() {
  const people = usePeople();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
        people={people.data} 
        redirectTo={"/profile/view"}
        configProvider={null}
        configAltcha={null}
        altchaPayload={null}
      />
    </section>
  );
}

export default ProfileEdit;
