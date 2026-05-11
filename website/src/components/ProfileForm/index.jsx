import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate } from "react-router-dom";
import { Form, Input, Select, DatePicker, Button, Divider, Spin, notification } from 'antd';
import { PasswordInput } from "antd-password-input-strength";
import dayjs from 'dayjs';

import _service from '@netuno/service-client';

import isNetworkError from "is-network-error";

import globalNotification from "../../common/globalNotification.js";
import usePeople from "../../common/usePeople.js";
import Avatar from './Avatar';

function ProfileForm({ 
  operation,
  people,
  redirectTo,
  configProvider,
  configAltcha,
  altchaPayload
}) {
  const loggedUser = usePeople();

  // not sure if this should be a state
  // cause it never changes
  // but we need a kind of global variable to tell us if the logged user is
  // trying to modify his own profile
  const [itsLoggedUserProfile, setItsLoggedUserProfile] = useState(false);

  const profileForm = useRef(null);

  const [cityOptions, setCityOptions] = useState([])
  const [institutionOptions, setInstitutionOptions] = useState([])

  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const [passwordRequired, setPasswordRequired] = useState(false);

  const profileAvatar = useRef(null);
  const [avatarImageURL, setAvatarImageURL] = useState('/images/profile-default.png');

  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const navigate = useNavigate();

  const layout = operation == "edit" ? {
    wrapperCol: { xs: { span: 24 }, sm: { span: 24 }, md: { span: 24 }, lg: { span: 12 } }
  } : null;

  useEffect(() => {
    if (people && operation == "edit") {
      if (people.avatar) {
        setAvatarImageURL(_service.url(`/people/avatar?uid=${people.uid}`));
      }
      setSelectedCity(people.city);
      setSelectedInstitution(people.institution);
      setSelectedGroup({ 
        label: people.group.name, 
        value: people.group.code 
      });
      setItsLoggedUserProfile(people.username == loggedUser.data.username);
    }
  }, []);

  const handleCitySearch = value => {
    _service({
      url: `location/city/search?name=${value}`,
      success: (response) => {
        const options = response.json.data.map(city => ({
          value: city.label,
          label: city.label,
          uid: city.uid,
        }))
        setCityOptions(options);
      },
      fail: () => {
        setCityOptions([]);
      }
    })
  };

  const handleInstitutionSearch = value => {
    _service({
      url: `institution/search?name=${value}`,
      success: (response) => {
        const options = response.json.data.map(institution => ({
          value: institution.name,
          label: institution.name,
          uid: institution.uid,
        }))
        setInstitutionOptions(options);
      },
      fail: () => {
        setInstitutionOptions([]);
      }
    })
  };

  const groupOptions = [
    {
      label: "Membro",
      value: "member"
    },
    {
      label: "Revisão",
      value: "review"
    },
    {
      label: "Gestão",
      value: "management"
    },
    {
      label: "Super Administrador",
      value: "super-admin"
    },
  ];

  const handleCityChange = (value, option) => {
    setSelectedCity(option);
  };

  const handleInstitutionChange = (value, option) => {
    setSelectedInstitution(option);
  };

  const handleGroupChange = (value, option) => {
    setSelectedGroup(option);
  };

  const handleCityClear = () => {
    setCityOptions([]);
    setSelectedCity('');
  }

  const handleInstitutionClear = () => {
    setInstitutionOptions([]);
    setSelectedInstitution('');
  }

  const handleGroupClear = () => {
    setSelectedGroup('');
  }

  function onFinish(values) {
    setSubmitting(true);

    let url = 'people';
    const { name, username, password, email, birthDate } = values;

    const data = {
      name,
      username,
      password,
      email,
      birthDate: birthDate?.format('YYYY-MM-DD') ?? '',
      city: selectedCity.uid,
      institution: selectedInstitution.uid,
      group: selectedGroup.value
    }

    if (operation == "create" && configAltcha && altchaPayload) {
      data.altcha = altchaPayload
    }

    if (operation == "edit" && people && loggedUser) {
      data.avatar = profileAvatar?.current?.getImage();

      if (itsLoggedUserProfile) {
        url += '/me';
      } else {
        data.uid = people.uid
      }
    }

    const method = operation == "edit" ? "PUT" : "POST"

    _service({
      method,
      url,
      data,
      success: (response) => {
        if (response.json.result) {
          if (operation == "edit") {
            globalNotification.success({
              message: 'Edição do Perfil',
              description: 'Os dados do seu perfil foram alterados com sucesso.',
            });
            setSubmitting(false);
          } else if (operation == "create") {
            api.success({
              message: 'Conta Criada',
              description: 'A conta foi criada com sucesso, pode iniciar sessão.',
            });
            setSubmitting(false);
            profileForm.current.setFieldsValue({
              password: "",
              password_confirm: ""
            });
          }
          setReady(true);
          if (itsLoggedUserProfile) {
            loggedUser.reload();
          } 
        } else if (operation == "edit") {
          globalNotification.warning({
            message: 'Utilizador existente',
            description: response.json.error,
          });
          setSubmitting(false);
          profileForm.current.setFieldsValue({
            password: "",
            password_confirm: ""
          });
        }
      },
      fail: (e) => {
        setSubmitting(false);
        if (e.error && isNetworkError(e.error)) {
          return api.error({
            message: 'Conexão',
            description:
              'Há problemas de conexão com o servidor, tente novamente mais tarde.',
          });
        }
        if (e && e.status === 409 && e.json && e.json.error) {
          if (e.json.error === 'email-already-exists') {
            return api.warning({
              message: 'E-mail Existente',
              description: 'Este e-mail já existe, faça a recuperação do acesso no ecrã de login ou escolha outro.',
            });
          }
          if (e.json.error === 'user-already-exists') {
            return api.warning({
              message: 'Utilizador Existente',
              description: 'Este utilizador já existe, faça a recuperação do acesso no ecrã de login ou escolha outro.',
            });
          }
        }
        if (operation == "edit") {
          globalNotification.serviceFail({
            message: 'Erro na Edição do Perfil',
            description: 'Ocorreu um erro na edição do seu perfil, por favor contacte-nos através do chat de suporte.',
          });
        } else if (operation == "create") {
          return api.error({
            message: 'Erro na Criação de Conta',
            description: 'Não foi possível criar a conta, contacte-nos através do chat de suporte.',
          });
        }
      }
    });
  }

  function onValuesChange(changedValues, allValues) {
    if (allValues.password && allValues.password.length > 0) {
      setPasswordRequired(true);
    } else {
      setPasswordRequired(false);
    }
  }

  function onFinishFailed(errorInfo) {
    console.log('Failed:', errorInfo);
  }

  if (operation == "edit" && !people) {
    return <Spin />
  }

  if (ready) {
    return <Navigate to={redirectTo} />;
  }

  return (
    <div>
      {contextHolder}
      <div className="content-body">
        { operation == "edit" &&
          <>
            <Avatar ref={profileAvatar} currentImage={avatarImageURL}/>
            <Divider titlePlacement="left" plain>Informações Gerais</Divider>
          </>
        }
        <Form
          style={{ width: '100%' }}
          {...layout}
          onValuesChange={onValuesChange}
          ref={profileForm}
          layout="vertical"
          name="basic"
          initialValues={operation == "edit" ?
          {
            name: people.name,
            username: people.username,
            email: people.email,
            birthDate: dayjs(people.birthDate),
            city: people.country.name + " > " + people.state.name + " > " + people.city.name,
            institution: people.institution.name,
            group: people.group.name 
          } :  operation == "create" && !loggedUser.canCreateAnyUser() ?
          { 
            group: { value: "member", label: "Membro" },
            institution: loggedUser.data.institution.name,
          } :
          { 
          }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          {configProvider}
          <Form.Item
            label="Nome"
            name="name"
            rules={[
              { required: true, message: 'Insira o nome.' },
              { type: 'string', message: 'Nome inválido,.', pattern: "^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$" }
            ]}
          >
            <Input disabled={submitting} maxLength={25} />
          </Form.Item>
          <Form.Item
            label="Utilizador"
            name="username"
            rules={[
              { required: true, message: 'Insira o usuário.' },
              { type: 'string', message: 'Usuário inválido.', pattern: "^[a-z]+[a-z0-9]{1,24}$" }
            ]}
          >
            <Input disabled={submitting} maxLength={25} />
          </Form.Item>
          <Form.Item
            label="E-mail"
            name="email"
            rules={[
              { type: 'email', message: 'O e-mail inserido não é válido.' },
              { required: true, message: 'Insira o e-mail.' }
            ]}
          >
            <Input disabled={submitting} maxLength={250} />
          </Form.Item>
          <Form.Item
            label="Data de Nascimento"
            name="birthDate"
            rules={[
              { type: 'date', message: 'A data inserida não é válida.' },
              { required: true, message: 'Insira a data de nascimento.' }
            ]}
          >
            <DatePicker placeholder="DD/MM/AAAA" format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item
            label="Cidade"
            name="city"
            rules={[
              { type: 'string', message: 'A cidade inserida não é válida.' },
              { required: true, message: 'Insira a cidade.' }
            ]}
          >
            <Select
              showSearch
              notFoundContent={null}
              filterOption={false}
              placeholder="Cidade"
              options={cityOptions}
              allowClear
              onClear={handleCityClear}
              onSearch={handleCitySearch}
              onChange={handleCityChange}
            />
          </Form.Item>
          <Form.Item
            label="Instituição"
            name="institution"
            rules={[
              { type: 'string', message: 'A instituição inserida não é válida.' },
              { required: true, message: 'Insira a instituição.' }
            ]}
          >
            <Select
              disabled={
                (
                  operation == "edit" &&
                  (
                    !itsLoggedUserProfile && !loggedUser.canChangeUserInstitution() ||
                    itsLoggedUserProfile && !loggedUser.canChangeOwnInstitution()
                  )
                ) || (
                  operation == "create" && !loggedUser.canCreateAnyUser()
                )
              }
              showSearch
              notFoundContent={null}
              filterOption={false}
              placeholder="Instituição"
              options={institutionOptions}
              allowClear
              onClear={handleInstitutionClear}
              onSearch={handleInstitutionSearch}
              onChange={handleInstitutionChange}
            />
          </Form.Item>
          <Form.Item
            label="Grupo"
            name="group"
            rules={[
              { type: 'string', message: 'O grupo inserido não é válido.' },
              { required: true, message: 'Insira o grupo.' }
            ]}
          >
            <Select
              disabled={
                (
                  operation == "edit" && 
                  (
                    itsLoggedUserProfile || !itsLoggedUserProfile && !loggedUser.canChangeUserInstitution(people)
                  )
                ) || (
                  operation == "create" && !loggedUser.canCreateAnyUser()
                )
              }
              showSearch
              notFoundContent={null}
              filterOption={false}
              placeholder="Grupo"
              options={groupOptions}
              allowClear
              onClear={handleGroupClear}
              onChange={handleGroupChange}
            />
          </Form.Item>
          <Form.Item
            label="Nova Palavra-passe"
            name="password"
            rules={[
              (operation == "create" && { required: true, message: 'Insira a palavra-passe.' }),
              { type: 'string', message: 'Palavra-Passe deverá ter entre 8 a 25 caracteres.', min: 8, max: 25 },
            ]}
          >
          { operation == "create" ?
            <PasswordInput disabled={submitting} maxLength={25} /> :
            <PasswordInput />
          }
          </Form.Item>
          <Form.Item
            label="Confirmar nova Palavra-passe"
            name="password_confirm"
            rules={[ (operation == "create" ?
              { required: true, message: `Insira a confirmação da palavra-passe.` } :
              { required: passwordRequired, message: 'Insira a confirmação da nova palavra-passe.' }),
              { type: 'string', message: 'Palavra-Passe deverá ter entre 8 a 25 caracteres.', min: 8, max: 25 },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject('As palavras-passes não são iguais.');
                },
              })
            ]}
          >
            { operation == "create" ?
              <Input.Password disabled={submitting} maxLength={25} /> :
              <Input.Password maxLength={25} />
            }
          </Form.Item>
          <Form.Item>
            { operation == "create" ?
              <Button type="primary" htmlType="submit" loading={submitting}>
                Criar Usuário
              </Button> :
              <Button type="primary" htmlType="submit" loading={submitting}>
                Atualizar Perfil
              </Button>
            }
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default ProfileForm;
