import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftOutlined } from '@ant-design/icons';
import { 
  Typography, Form, Input, Button, Divider, notification, 
  Upload, Card, Row, Col, message, Spin 
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';

import _service from '@netuno/service-client';
import { connect } from 'react-redux';
import "./index.less";

const { Title, Text } = Typography;
const { TextArea } = Input;

function InstitutionEdit({ loggedUserInfo }) {
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { uid } = useParams();
  const [api, contextHolder] = notification.useNotification();
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [initialLogo, setInitialLogo] = useState(null);
  const [initialCover, setInitialCover] = useState(null);

  const layout = {
    labelCol: { xs: { span: 24 }, sm: { span: 6 } },
    wrapperCol: { xs: { span: 24 }, sm: { span: 18 } }
  };

  // Load institution data
  useEffect(() => {
    if (!loggedUserInfo) {
      navigate('/login');
      return;
    }
    if (uid) {
      _service({
        url: `/institution?uid=${uid}`,
        method: 'GET',
        success: ({ json }) => {
          if (json.data) {
            const data = json.data;
            setLogoPreview(data.logo);
            setCoverPreview(data.cover_image);
            setInitialLogo(data.logo);
            setInitialCover(data.cover_image);
            
            form.setFieldsValue({
              name: data.name,
              description: data.description,
              email: data.email,
              telephone: data.telephone,
              address: data.address,
              post_code: data.post_code,
              city: data.city,
              state: data.state,
              country: data.country,
              website: data.website
            });
          } else {
            message.error('Instituição não encontrada.');
            navigate('/institutions');
          }
          setLoading(false);
        },
        fail: () => {
          message.error('Erro ao carregar dados da instituição.');
          navigate('/institutions');
          setLoading(false);
        }
      });
    }
  }, [uid, navigate, form, loggedUserInfo]);

  const handleLogoChange = (info) => {
    const file = info.file.originFileObj || info.file;
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setLogoFile(file);
    }
  };

  const handleCoverChange = (info) => {
    const file = info.file.originFileObj || info.file;
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setCoverFile(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    setLogoFile(null);
  };

  const removeCover = () => {
    setCoverPreview(null);
    setCoverFile(null);
  };

  function onFinish(values) {
    setSubmitting(true);
    
    const { 
      name, description, email, telephone, address, 
      post_code, city, state, country, website 
    } = values;

    // Build form data
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description || '');
    formData.append('email', email);
    formData.append('telephone', telephone || '');
    formData.append('address', address || '');
    formData.append('post_code', post_code || '');
    formData.append('city', city || '');
    formData.append('state', state || '');
    formData.append('country', country || '');
    formData.append('website', website || '');
    
    // Only append files if changed
    if (logoFile) {
      formData.append('logo', logoFile);
    }
    if (coverFile) {
      formData.append('cover_image', coverFile);
    }

    _service({
      method: 'PUT',
      url: `/institution?uid=${uid}`,
      data: formData,
      success: (response) => {
        if (response.json.result) {
          api.success({
            message: 'Instituição Atualizada',
            description: 'A instituição foi atualizada com sucesso.',
          });
          setTimeout(() => {
            navigate(`/institutions/${uid}`);
          }, 1000);
        } else {
          api.warning({
            message: 'Erro ao Atualizar',
            description: response.json.error || 'Não foi possível atualizar a instituição.',
          });
          setSubmitting(false);
        }
      },
      fail: () => {
        api.error({
          message: 'Erro ao Atualizar',
          description: 'Ocorreu um erro ao atualizar a instituição. Tente novamente.',
        });
        setSubmitting(false);
      }
    });
  }

  function onFinishFailed(errorInfo) {
    console.log('Failed:', errorInfo);
  }

  if (loading) {
    return (
      <div className="institution-edit">
        <div className="loading-wrapper">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="institution-edit">
      {contextHolder}
      
      <div className="content-title">
        <Button 
          className="go-back-btn" 
          type="link" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeftOutlined /> Voltar atrás
        </Button>
      </div>
      
      <div className="content-title">
        <Title level={2}>Editar Instituição</Title>
      </div>
      
      <div className="content-body">
        <Form
          {...layout}
          form={form}
          layout="vertical"
          name="institution_edit"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <Card title="Informações Principais" className="form-card">
                <Form.Item
                  label="Nome"
                  name="name"
                  rules={[
                    { required: true, message: 'Insira o nome da instituição.' },
                    { type: 'string', max: 250, message: 'Nome não pode exceder 250 caracteres.' }
                  ]}
                >
                  <Input disabled={submitting} maxLength={250} />
                </Form.Item>

                <Form.Item
                  label="Descrição"
                  name="description"
                  rules={[
                    { required: true, message: 'Insira a descrição da instituição.' }
                  ]}
                >
                  <TextArea 
                    rows={4} 
                    disabled={submitting} 
                    maxLength={2000}
                    showCount
                  />
                </Form.Item>

                <Form.Item
                  label="E-mail"
                  name="email"
                  rules={[
                    { type: 'email', message: 'E-mail inválido.' },
                    { required: true, message: 'Insira o e-mail.' }
                  ]}
                >
                  <Input disabled={submitting} maxLength={250} />
                </Form.Item>

                <Form.Item
                  label="Telefone"
                  name="telephone"
                >
                  <Input disabled={submitting} maxLength={20} />
                </Form.Item>

                <Form.Item
                  label="Website"
                  name="website"
                  rules={[
                    { type: 'url', message: 'URL inválida.' }
                  ]}
                >
                  <Input 
                    disabled={submitting} 
                    maxLength={500} 
                    placeholder="https://"
                  />
                </Form.Item>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="Logótipo e Imagem de Capa" className="form-card">
                <Form.Item
                  label="Logótipo"
                  name="logo"
                >
                  <div className="upload-container">
                    {logoPreview ? (
                      <div className="image-preview">
                        <img src={logoPreview} alt="Logo" />
                        <Button 
                          type="link" 
                          danger 
                          onClick={removeLogo}
                          disabled={submitting}
                        >
                          Remover
                        </Button>
                      </div>
                    ) : (
                      <Upload
                        showUploadList={false}
                        beforeUpload={(file) => {
                          handleLogoChange({ file });
                          return false;
                        }}
                        accept="image/*"
                      >
                        <Button icon={<UploadOutlined />} disabled={submitting}>
                          Carregar Logótipo
                        </Button>
                      </Upload>
                    )}
                    <Text type="secondary" className="upload-hint">
                      Formato: JPG, PNG. Tamanho recomendado: 200x200px
                    </Text>
                  </div>
                </Form.Item>

                <Form.Item
                  label="Imagem de Capa"
                  name="cover_image"
                >
                  <div className="upload-container">
                    {coverPreview ? (
                      <div className="image-preview cover-preview">
                        <img src={coverPreview} alt="Cover" />
                        <Button 
                          type="link" 
                          danger 
                          onClick={removeCover}
                          disabled={submitting}
                        >
                          Remover
                        </Button>
                      </div>
                    ) : (
                      <Upload
                        showUploadList={false}
                        beforeUpload={(file) => {
                          handleCoverChange({ file });
                          return false;
                        }}
                        accept="image/*"
                      >
                        <Button icon={<UploadOutlined />} disabled={submitting}>
                          Carregar Imagem de Capa
                        </Button>
                      </Upload>
                    )}
                    <Text type="secondary" className="upload-hint">
                      Formato: JPG, PNG. Tamanho recomendado: 1200x400px
                    </Text>
                  </div>
                </Form.Item>
              </Card>

              <Card title="Localização" className="form-card" style={{ marginTop: 16 }}>
                <Form.Item
                  label="Morada"
                  name="address"
                >
                  <TextArea rows={2} disabled={submitting} />
                </Form.Item>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Código Postal"
                      name="post_code"
                      rules={[
                        { type: 'string', max: 20, message: 'Código postal inválido.' }
                      ]}
                    >
                      <Input disabled={submitting} maxLength={20} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Cidade"
                      name="city"
                      rules={[
                        { type: 'string', max: 250, message: 'Cidade inválida.' }
                      ]}
                    >
                      <Input disabled={submitting} maxLength={250} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Estado/Região"
                      name="state"
                      rules={[
                        { type: 'string', max: 250, message: 'Estado inválido.' }
                      ]}
                    >
                      <Input disabled={submitting} maxLength={250} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="País"
                      name="country"
                      rules={[
                        { required: true, message: 'Insira o país.' },
                        { type: 'string', max: 250, message: 'País inválido.' }
                      ]}
                    >
                      <Input disabled={submitting} maxLength={250} />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          <Divider />

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={submitting}
              size="large"
            >
              Guardar Alterações
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

const mapStateToProps = store => {
  const { loggedUserInfoState } = store;
  return {
    loggedUserInfo: loggedUserInfoState.loggedUserInfo
  };
};

export default connect(mapStateToProps)(InstitutionEdit);
