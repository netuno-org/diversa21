import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Button, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

import ProfileForm from "../../../../components/ProfileForm"

import usePeople from "../../../../common/usePeople.js";

const { Title } = Typography;

function ProfileEdit() {
  const people = usePeople();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <section>
      <ProfileForm
        textTitle="Foto de perfil"
        textTitle2="Informações gerais"
        operation={"edit"}
        people={people.data} 
        redirectTo={"/profile/view"}
      />
    </section>
  );
}

export default ProfileEdit;
