import React, { useState, useRef, useEffect } from 'react';
import { Typography, Form, Input, Button, Card, Spin, Select, message, Row, Col, Switch } from 'antd';
import { useNavigate } from 'react-router-dom';
import _service from '@netuno/service-client';

import Avatar from '../Avatar';
import CoverImage from '../CoverImage';
import "./index.less";

const { Title } = Typography;
const { TextArea } = Input;

export default function InstitutionForm({
  uid = null,
  slug = null,
  initialData = null,
  onSuccess,
  onCancel,
  submitText = null,
  title = null,
  showBackButton = true
}) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState((!!uid || !!slug) && !initialData);
  const [form] = Form.useForm();
  const [institution, setInstitution] = useState(initialData);

  const profileAvatar = useRef(null);
  const profileCover = useRef(null);

  const [avatarImageURL, setAvatarImageURL] = useState(null);
  const [coverImageURL, setCoverImageURL] = useState(null);
  const [cityOptions, setCityOptions] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);

  const editIdentifier = slug || uid;
  const isEditMode = !!editIdentifier;

  useEffect(() => {
    if (editIdentifier && !initialData) {
      const identifierParam = slug ? `slug=${slug}` : `uid=${uid}`;
      _service({
        url: `/institution?${identifierParam}`,
        method: 'GET',
        success: ({ json }) => {
          if (json.data) {
            const data = json.data;
            setInstitution(data);
            setAvatarImageURL(data.avatar ? _service.url(`/asset?uid=${data.uid}&type=avatar&entity=institution&t=${Date.now()}`) : null);
            setCoverImageURL(data.cover_image ? _service.url(`/asset?uid=${data.uid}&type=cover_image&entity=institution&t=${Date.now()}`) : null);

            let cityObject = undefined;
            if (data.city) {
              const label = `${data.country?.name} > ${data.state?.name} > ${data.city?.name}`;
              cityObject = { label, value: data.city.uid };
              setSelectedCity({ uid: data.city.uid, label });
              setCityOptions([{ value: data.city.uid, label, uid: data.city.uid }]);
            }

            form.setFieldsValue({
              name: data.name,
              description: data.description,
              email: data.email,
              telephone: data.telephone,
              address: data.address,
              post_code: data.post_code,
              city: cityObject,
              website: data.website,
              active: data.active === "true" || data.active === true
            });
          }
          setLoading(false);
        }
      });
    }
  }, [editIdentifier, initialData, form, slug, uid]);

  const handleCitySearch = (value) => {
    if (!value) {
      setCityOptions([]);
      return;
    }
    _service({
      url: `location/city/search?name=${value}`,
      success: ({ json }) => {
        setCityOptions(json.data.map(city => ({ label: city.label, value: city.uid, uid: city.uid })));
      },
      fail: () => setCityOptions([])
    });
  };

  const onFinish = (values) => {
    setSubmitting(true);
    const formData = new FormData();

    const allValues = {
      address: institution?.address || "",
      post_code: institution?.post_code || "",
      telephone: institution?.telephone || "",
      website: institution?.website || "",
      description: institution?.description || "",
      active: institution?.active !== undefined ? String(institution.active) : "true",
      ...values
    };

    Object.keys(allValues).forEach(key => {
      if (key !== 'city') {
        let val = allValues[key];
        if (typeof val === 'boolean') {
          val = String(val);
        }
        formData.append(key, val !== undefined && val !== null ? val : "");
      }
    });

    const cityFieldValue = values.city;
    let cityUid = null;
    if (cityFieldValue) {
      cityUid = typeof cityFieldValue === 'object' ? cityFieldValue.value : cityFieldValue;
    } else if (selectedCity?.uid) {
      cityUid = selectedCity.uid;
    } else if (institution?.city?.uid) {
      cityUid = institution.city.uid;
    }

    if (cityUid) {
      formData.append('city', cityUid);
    }

    const avatar = profileAvatar?.current?.getImage();
    const cover = profileCover?.current?.getImage();

    if (avatar) {
      formData.append('avatar', avatar);
    }
    formData.append('remove_avatar', profileAvatar?.current?.isRemoved() ? "true" : "false");

    if (cover) {
      formData.append('cover_image', cover);
    }
    formData.append('remove_cover_image', profileCover?.current?.isRemoved() ? "true" : "false");

    _service({
      method: isEditMode ? 'PUT' : 'POST',
      url: isEditMode ? `/institution?${slug ? `slug=${slug}` : `uid=${uid}`}` : '/institution',
      data: formData,
      success: (res) => {
        if (res.json.result) {
          if (onSuccess) onSuccess(slug || uid, res.json.data);
        } else {
          message.error(res.json.error || 'Erro ao guardar.');
          setSubmitting(false);
        }
      },
      fail: () => {
        message.error('Erro de conexão.');
        setSubmitting(false);
      }
    });
  };

  const handleCancelClick = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="institution-form">
      <div className="institution-form__body">
        <Title level={2}>{title || (isEditMode ? 'Editar Instituição' : 'Nova Instituição')}</Title>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          {loading ? (
            <div className="institution-form__loading"><Spin size="large" /></div>
          ) : (
            <>
              {isEditMode && (
                <>
                  <Card title="Avatar" className="institution-form__card">
                    <Avatar ref={profileAvatar} currentImage={avatarImageURL} />
                  </Card>
                  <Card title="Capa" className="institution-form__card">
                    <CoverImage ref={profileCover} currentImage={coverImageURL} />
                  </Card>
                </>
              )}
              <Card title="Informações Gerais" className="institution-form__card">
                <Form.Item name="name" label="Nome" rules={[{ required: true }]}><Input disabled={submitting} /></Form.Item>
                <Form.Item name="description" label="Descrição"><TextArea rows={4} disabled={submitting} /></Form.Item>

                <Row gutter={16}>
                  <Col xs={24} md={12}><Form.Item name="email" label="E-mail"><Input disabled={submitting} /></Form.Item></Col>
                  <Col xs={24} md={12}><Form.Item name="telephone" label="Telefone"><Input disabled={submitting} /></Form.Item></Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item name="city" label="Cidade" rules={[{ required: true }]}>
                      <Select
                        labelInValue
                        showSearch
                        filterOption={false}
                        options={cityOptions}
                        onSearch={handleCitySearch}
                        onChange={(opt) => setSelectedCity(opt)}
                        allowClear
                        disabled={submitting}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="website" label="Website">
                      <Input placeholder="https://" disabled={submitting} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={12}><Form.Item name="address" label="Endereço"><Input disabled={submitting} /></Form.Item></Col>
                  <Col xs={24} md={12}><Form.Item name="post_code" label="Código Postal"><Input disabled={submitting} /></Form.Item></Col>
                </Row>

                {isEditMode && (
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="active"
                        label="Estado"
                        valuePropName="checked"
                      >
                        <Switch checkedChildren="Ativo" unCheckedChildren="Inativo" disabled={submitting} />
                      </Form.Item>
                    </Col>
                  </Row>
                )}


              </Card>

              <div className="institution-form__actions">
                <Form.Item className="institution-form__action-item">
                  <Button
                    type="default"
                    onClick={handleCancelClick}
                    size="large"
                    block
                    className="institution-form__btn institution-form__btn--cancel"
                  >
                    Cancelar
                  </Button>
                </Form.Item>

                <Form.Item className="institution-form__action-item">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={submitting}
                    size="large"
                    block
                    className="institution-form__btn institution-form__btn--submit"
                  >
                    {submitText || (isEditMode ? 'Atualizar Instituição' : 'Criar Instituição')}
                  </Button>
                </Form.Item>
              </div>
            </>
          )}
        </Form>
      </div>
    </div>
  );
}
