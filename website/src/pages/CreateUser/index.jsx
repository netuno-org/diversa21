import React, { useEffect } from 'react';

import ProfileForm from '../../components/ProfileForm';

export default function CreateUser() {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <section>
      <ProfileForm
        textTitle="Criar Usuário"
        textTitle2="Informações gerais"
        operation={"create"}
        people={null}
        redirectTo={"/people"}
      />
    </section>
  );
}
