import { useState, useEffect, useRef } from 'react';
import { Navigate, useNavigate } from "react-router-dom";
import { Form, Input, Select, DatePicker, Switch, Button, Card, Spin, notification, Row, Col } from 'antd';
import { PasswordInput } from "antd-password-input-strength";
import dayjs from 'dayjs';

import _service from '@netuno/service-client';
import isNetworkError from "is-network-error";

import globalNotification from "../../common/globalNotification.js";
import usePeople from "../../common/usePeople.js";
import Avatar from '../Avatar/index.jsx';
import CoverImage from '../CoverImage/index.jsx';
import './index.less';

function ProfileForm({
  operation,
  people,
  redirectTo
}) {
  const loggedUser = usePeople();
  const navigate = useNavigate();

  const itsLoggedUserProfile = people && loggedUser?.data
    ? people.username === loggedUser.data.username
    : false;

  const profileForm = useRef(null);
  const profileAvatar = useRef(null);
  const profileCover = useRef(null);
  const [form] = Form.useForm();
  const descriptionValue = Form.useWatch("description", form) || "";

  const canViewGroupFormField =
    (operation === "create" && loggedUser.canCreateAnyUser()) ||
    (operation === "edit" && !itsLoggedUserProfile && loggedUser.canChangeUserGroup(people));
  const canViewPasswordFields = operation === "create" || (operation === "edit" && itsLoggedUserProfile);
  const canViewInstitutionFormField =
    (operation === "create" && loggedUser.canCreateAnyUser()) ||
    (operation === "edit" && (
      !itsLoggedUserProfile && loggedUser.canChangeUserInstitution() ||
      itsLoggedUserProfile && loggedUser.canChangeOwnInstitution()
    ));
  const canViewActiveField = !itsLoggedUserProfile && operation == "edit" &&
    loggedUser.canManageUser(people);
  const showPermissionsCard = canViewGroupFormField || canViewActiveField;

  const [cityOptions, setCityOptions] = useState([]);
  const [institutionOptions, setInstitutionOptions] = useState([]);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [avatarImageURL, setAvatarImageURL] = useState('/images/profile-default.png');
  const [coverImageURL, setCoverImageURL] = useState('');
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    if (people && operation === "edit") {
      if (people.avatar) {
        setAvatarImageURL(_service.url(`/asset?uid=${people.uid}&type=avatar&entity=people&t=${Date.now()}`));
      }
      if (people.cover_image) {
        setCoverImageURL(_service.url(`/asset?uid=${people.uid}&type=cover_image&entity=people&t=${Date.now()}`));
      }
    }
  }, [people, operation]);

  const groupOptions = [
    { label: "Membro", value: "member" },
    { label: "Revisão", value: "review" },
    { label: "Gestão", value: "management" },
    { label: "Super Administrador", value: "super-admin" },
  ];

  const handleCitySearch = value => {
    if (!value) {
      setCityOptions([]);
      return;
    }

    _service({
      url: `location/city/search?name=${value}`,
      success: ({ json }) => {
        setCityOptions(json.data.map(city => (
          { label: city.label, value: city.uid }
        )));
      },
      fail: () => setCityOptions([])
    })
  };

  const handleInstitutionSearch = value => {
    if (!value) {
      setInstitutionOptions([]);
      return;
    }

    _service({
      url: `institution/search?name=${value}`,
      success: ({ json }) => {
        setInstitutionOptions(json.data.map(inst => (
          { label: inst.name, value: inst.uid }
        )));
      },
      fail: () => setInstitutionOptions([])
    })
  };

  function onFinish(values) {
    setSubmitting(true);

    let url = 'people';

    const data = {
      name: values.name,
      username: values.username,
      description: values.description,
      password: values.password,
      email: values.email,
      birthDate: values.birthDate?.format('YYYY-MM-DD') ?? '',
      city: values.city?.value || values.city,
      institution: values.institution?.value || values.institution || people?.institution?.uid || loggedUser.data?.institution?.uid,
      group: values.group?.value || values.group || people?.group?.code || "member",
      active: values.active !== undefined ? values.active : (people?.active ?? true)
    }

    if (operation === "edit" && people && loggedUser) {
      data.avatar = profileAvatar?.current?.getImage();
      data.remove_avatar = profileAvatar?.current?.isRemoved() ?? false;

      data.cover_image = profileCover?.current?.getImage();
      data.remove_cover_image = profileCover?.current?.isRemoved() ?? false;

      if (itsLoggedUserProfile) {
        url += '/me';
      } else {
        data.uid = people.uid;
      }
    }

    const method = operation === "edit" ? "PUT" : "POST";

    _service({
      method,
      url,
      data,
      success: ({ json }) => {
        if (json.result) {
          if (operation === "edit") {
            globalNotification.success({
              title: 'Edição do Perfil',
              description: 'Os dados do seu perfil foram alterados com sucesso.',
            });
          } else {
            api.success({
              title: 'Conta Criada',
              description: 'A conta foi criada com sucesso, pode iniciar sessão.',
            });

            profileForm.current.setFieldsValue({
              password: "",
              password_confirm: ""
            });
          }
          setReady(true);

          if (itsLoggedUserProfile) {
            loggedUser.reload();
          }
        } else if (operation === "edit") {
          globalNotification.warning({
            title: 'Utilizador existente',
            description: json.error,
          });
          profileForm.current.setFieldsValue({
            password: "",
            password_confirm: ""
          });
        }
        setSubmitting(false);
      },
      fail: (e) => {
        setSubmitting(false);
        if (e.error && isNetworkError(e.error)) {
          return api.error({
            title: 'Conexão',
            description: 'Há problemas de conexão com o servidor, tente novamente mais tarde.',
          });
        }
        if (e && e.status === 409 && e.json && e.json.error) {
          if (e.json.error === 'email-already-exists') {
            return api.warning({
              title: 'E-mail Existente',
              description: 'Este e-mail já existe, faça a recuperação do acesso no ecrã de login ou escolha outro.',
            });
          }
          if (e.json.error === 'user-already-exists') {
            return api.warning({
              title: 'Utilizador Existente',
              description: 'Este utilizador já existe, faça a recuperação do acesso no ecrã de login ou escolha outro.',
            });
          }
        }
        if (operation === "edit") {
          globalNotification.serviceFail({
            title: 'Erro na Edição do Perfil',
            description: 'Ocorreu um erro na edição do seu perfil, por favor contacte-nos através do chat de suporte.',
          });
        } else if (operation === "create") {
          return api.error({
            title: 'Erro na Criação de Conta',
            description: 'Não foi possível criar a conta, contacte-nos através do chat de suporte.',
          });
        }
      }
    });
  }

  function onValuesChange(changedValues, allValues) {
    setPasswordRequired(!!(allValues.password && allValues.password.length > 0));
  }

  if (operation === "edit" && !people) {
    return <Spin />;
  }

  if (ready) {
    return <Navigate to={redirectTo} />;
  }

  return (
    <div className="profile-form">
      {contextHolder}
      <div className="profile-form__body">
        <Form
          form={form}
          style={{ width: '100%' }}
          onValuesChange={onValuesChange}
          ref={profileForm}
          layout="vertical"
          name="basic"
          initialValues={
            operation === "edit" ? {
              name: people.name,
              username: people.username,
              description: people.description,
              email: people.email,
              birthDate: dayjs(people.birthDate),
              city: {
                label: `${people.country.name} > ${people.state.name} > ${people.city.name}`,
                value: people.city.uid
              },
              institution: {
                label: people.institution.name,
                value: people.institution.uid
              },
              group: {
                label: people.group.name,
                value: people.group.code
              },
              active: people.active
            }
              : operation === "create" && !loggedUser.canCreateAnyUser() ? {
                group: { value: "member", label: "Membro" },
                institution: loggedUser.data.institution.name,
              }
                : {}
          }
          onFinish={onFinish}
        >
          {operation === "edit" && (
            <>
              <Card title={`Foto de Perfil`} className="profile-form__card">
                <Avatar
                  ref={profileAvatar}
                  currentImage={avatarImageURL}
                />
              </Card>

              <Card title={`Imagem de Capa`} className="profile-form__card">
                <CoverImage
                  ref={profileCover}
                  currentImage={coverImageURL}
                />
              </Card>
            </>
          )}

          <Card title="Informações Gerais" className="profile-form__card">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Nome"
                  name="name"
                  rules={[
                    { required: true, message: 'Insira o nome.' },
                    { type: 'string', message: 'Nome inválido.', pattern: "^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$" }
                  ]}
                >
                  <Input disabled={submitting} maxLength={25} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
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
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
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
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Data de Nascimento"
                  name="birthDate"
                  rules={[
                    { type: 'date', message: 'A data inserida não é válida.' },
                    { required: true, message: 'Insira a data de nascimento.' }
                  ]}
                >
                  <DatePicker placeholder="DD/MM/AAAA" format="DD/MM/YYYY" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col span={24}>
                <Form.Item
                  label="Descrição"
                  name="description"
                  rules={[{ required: true, message: 'Insira a descrição do usuário.' }]}
                  style={{ marginBottom: showPermissionsCard ? 8 : undefined }}
                >
                  <Input.TextArea disabled={submitting} maxLength={1000} autoSize={{ minRows: 3, maxRows: 6 }} />
                </Form.Item>
                <div className="profile-form__description-count">
                  <span>{descriptionValue.length}/1000</span>
                </div>
              </Col>
            </Row>

            <>
              <Row gutter={16}>
                <Col xs={24} md={canViewInstitutionFormField ? 12 : 24}>
                  <Form.Item
                    label="Cidade"
                    name="city"
                    rules={[{ required: true, message: 'Insira a cidade.' }]}
                  >
                    <Select
                      labelInValue
                      showSearch
                      notFoundContent={null}
                      filterOption={false}
                      placeholder="Cidade"
                      options={cityOptions}
                      allowClear
                      onSearch={handleCitySearch}
                    />
                  </Form.Item>
                </Col>

                {canViewInstitutionFormField && (
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Instituição"
                      name="institution"
                      rules={[{ required: true, message: 'Insira a instituição.' }]}
                    >
                      <Select
                        labelInValue
                        showSearch
                        notFoundContent={null}
                        filterOption={false}
                        placeholder="Instituição"
                        options={institutionOptions}
                        allowClear
                        onSearch={handleInstitutionSearch}
                      />
                    </Form.Item>
                  </Col>
                )}
              </Row>
            </>
          </Card>

          {showPermissionsCard && (
            <Card title="Permissões e Acessos" className="profile-form__card">
              <Row gutter={16} align="middle">
                {canViewGroupFormField && (
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Grupo"
                      name="group"

                      rules={[{ required: true, message: 'Insira o grupo.' }]}
                      style={{ marginBottom: 0 }}
                    >
                      <Select
                        labelInValue
                        showSearch
                        notFoundContent={null}
                        filterOption={false}
                        placeholder="Grupo"
                        options={groupOptions}
                        allowClear

                      />
                    </Form.Item>
                  </Col>
                )}

                {canViewActiveField && (
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Estado da Conta"
                      name="active"
                      valuePropName="checked"
                      style={{ marginBottom: 0 }}
                    >
                      <Switch checkedChildren="Ativo" unCheckedChildren="Inativo" />
                    </Form.Item>
                  </Col>
                )}
              </Row>
            </Card>
          )}

          {canViewPasswordFields && (
            <Card title="Segurança" className="profile-form__card">
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label={(operation === "edit" ? "Nova" : "") + " Palavra-passe"}
                    name="password"
                    rules={[
                      (operation === "create" && { required: true, message: 'Insira a palavra-passe.' }),
                      { type: 'string', message: 'Palavra-Passe deverá ter entre 8 a 25 caracteres.', min: 8, max: 25 },
                    ]}
                  >
                    {operation === "create" ? <PasswordInput disabled={submitting} maxLength={25} /> : <PasswordInput />}
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label={"Confirmar" + (operation === "edit" ? " Nova" : "") + " Palavra-passe"}
                    name="password_confirm"
                    rules={[
                      (operation === "create" ? { required: true, message: `Insira a confirmação da palavra-passe.` } : { required: passwordRequired, message: 'Insira a confirmação da nova palavra-passe.' }),
                      { type: 'string', message: 'Palavra-Passe deverá ter entre 8 a 25 caracteres.', min: 8, max: 25 },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) return Promise.resolve();
                          return Promise.reject('As palavras-passes não são iguais.');
                        },
                      })
                    ]}
                  >
                    {operation === "create" ? <Input.Password disabled={submitting} maxLength={25} /> : <Input.Password maxLength={25} />}
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          )}
          <div className="profile-form__actions">
            <Form.Item className="profile-form__action-item">
              <Button
                type="default"
                onClick={() => navigate(redirectTo || -1)}
                size="large"
                block
                className="profile-form__btn profile-form__btn--cancel"
              >
                Cancelar
              </Button>
            </Form.Item>

            <Form.Item className="profile-form__action-item">
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                size="large"
                block
                className="profile-form__btn profile-form__btn--submit"
              >
                {operation === "create" ? "Criar Usuário" : "Atualizar Perfil"}
              </Button>
            </Form.Item>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default ProfileForm;