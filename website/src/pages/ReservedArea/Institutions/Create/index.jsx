import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined } from '@ant-design/icons';
import { 
  Typography, Form, Input, Button, Divider, notification, 
  Upload, Card, Row, Col, message 
} from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';

import _service from '@netuno/service-client';
import { connect } from 'react-redux';
import "./index.less";

const { Title, Text } = Typography;
const { TextArea } = Input;

function InstitutionCreate({ loggedUserInfo }) {
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [api, contextHolder] = notification.useNotification();
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  const logoInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const layout = {
    labelCol: { xs: { span: 24 }, sm: { span: 6 } },
    wrapperCol: { xs: { span: 24 }, sm: { span: 18 } }
  };

  // Check if user is logged in
  useEffect(() => {
    if (!loggedUserInfo) {
      navigate('/login');
    }
  }, [loggedUserInfo, navigate]);

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
    
    if (logoFile) {
      formData.append('logo', logoFile);
    }
    if (coverFile) {
      formData.append('cover_image', coverFile);
    }

    _service({
      method: 'POST',
      url: '/institution',
      data: formData,
      success: (response) => {
        if (response.json.result) {
          api.success({
            message: 'Instituição Criada',
            description: 'A instituição foi criada com sucesso.',
          });
          setTimeout(() => {
            navigate(`/institutions/${response.json.data?.uid}`);
          }, 1000);
        } else {
          api.warning({
            message: 'Erro ao Criar',
            description: response.json.error || 'Não foi possível criar a instituição.',
          });
          setSubmitting(false);
        }
      },
      fail: () => {
        api.error({
          message: 'Erro ao Criar',
          description: 'Ocorreu um erro ao criar a instituição. Tente novamente.',
        });
        setSubmitting(false);
      }
    });
  }

  function onFinishFailed(errorInfo) {
    console.log('Failed:', errorInfo);
  }

  return (
    <div className="institution-create">
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
        <Title level={2}>Nova Instituição</Title>
      </div>
      
      <div className="content-body">
        <Form
          {...layout}
          form={form}
          layout="vertical"
          name="institution_create"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          initialValues={{
            country: 'Portugal'
          }}
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
                  valuePropName="fileList"
                  getValueFromEvent={(e) => Array.isArray(e) ? e : e && [e]}
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
                  valuePropName="fileList"
                  getValueFromEvent={(e) => Array.isArray(e) ? e : e && [e]}
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
              Criar Instituição
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

export default connect(mapStateToProps)(InstitutionCreate);
