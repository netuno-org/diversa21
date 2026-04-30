import React, { useState, useRef, useEffect } from 'react';
import { 
  Typography, Form, Input, Button, Divider, 
  Upload, Card, message, Spin 
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';

import _service from '@netuno/service-client';
import "./index.less";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function InstitutionForm({ 
  uid = null,
  initialData = null,
  onSuccess = () => {},
  onCancel = () => {},
  submitText = null,
  title = null,
  showBackButton = true,
  onBack = () => {}
}) {
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(!!uid && !initialData);
  const [form] = Form.useForm();
  
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [initialLogo, setInitialLogo] = useState(null);
  const [initialCover, setInitialCover] = useState(null);

  const isEditMode = !!uid;

  // Load institution data if in edit mode and no initialData provided
  useEffect(() => {
    if (uid && !initialData) {
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
          }
          setLoading(false);
        },
        fail: () => {
          message.error('Erro ao carregar dados da instituição.');
          setLoading(false);
        }
      });
    } else if (initialData) {
      // Use provided initialData
      setLogoPreview(initialData.logo);
      setCoverPreview(initialData.cover_image);
      setInitialLogo(initialData.logo);
      setInitialCover(initialData.cover_image);
      
      form.setFieldsValue({
        name: initialData.name,
        description: initialData.description,
        email: initialData.email,
        telephone: initialData.telephone,
        address: initialData.address,
        post_code: initialData.post_code,
        city: initialData.city,
        state: initialData.state,
        country: initialData.country,
        website: initialData.website
      });
    }
  }, [uid, initialData, form]);

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

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description || '');
    formData.append('email', email);
    
    // Only append optional fields if they have values
    if (telephone) formData.append('telephone', telephone);
    if (address) formData.append('address', address);
    if (post_code) formData.append('post_code', post_code);
    if (city) formData.append('city', city);
    if (state) formData.append('state', state);
    if (country) formData.append('country', country);
    if (website) formData.append('website', website);
    
    // Append files only if changed in edit mode
    if (logoFile) {
      formData.append('logo', logoFile);
    }
    if (coverFile) {
      formData.append('cover_image', coverFile);
    }

    const apiUrl = uid ? `/institution?uid=${uid}` : '/institution';
    const apiMethod = uid ? 'PUT' : 'POST';

    _service({
      method: apiMethod,
      url: apiUrl,
      data: formData,
      success: (response) => {
        if (response.json.result) {
          const successUid = uid || response.json.data?.uid;
          onSuccess(successSlug, response.json.data);
        } else {
          message.error(response.json.error || 'Erro ao guardar.');
          setSubmitting(false);
        }
      },
      fail: () => {
        message.error('Ocorreu um erro ao guardar. Tente novamente.');
        setSubmitting(false);
      }
    });
  }

  function onFinishFailed(errorInfo) {
    console.log('Failed:', errorInfo);
  }

  // Determine titles
  const pageTitle = title || (isEditMode ? 'Editar Instituição' : 'Nova Instituição');
  const buttonText = submitText || (isEditMode ? 'Guardar Alterações' : 'Criar Instituição');

  // Always render form even during loading to avoid useForm warning
  // (shows spinner inside form while loading)
  return (
    <div className="institution-form">
      {showBackButton && (
        <div className="content-title">
          <Button 
            className="go-back-btn" 
            type="link" 
            onClick={onBack}
          >
            ← Voltar atrás
          </Button>
        </div>
      )}
      
      <div className="content-title">
        <Title level={2}>{pageTitle}</Title>
      </div>
      
      <div className="content-body">
        <Form
          form={form}
          layout="vertical"
          name="institution_form"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          initialValues={!isEditMode ? { country: 'Portugal' } : {}}
        >
          {loading && (
            <div className="institution-form-loading">
              <Spin size="large" />
            </div>
)}
       
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

          <Card title="Localização" className="form-card">
            <Form.Item
              label="Morada"
              name="address"
            >
              <TextArea rows={2} disabled={submitting} />
            </Form.Item>

            <Form.Item
              label="Código Postal"
              name="post_code"
              rules={[
                { type: 'string', max: 20, message: 'Código postal inválido.' }
              ]}
            >
              <Input disabled={submitting} maxLength={20} />
            </Form.Item>

            <Form.Item
              label="Cidade"
              name="city"
              rules={[
                { type: 'string', max: 250, message: 'Cidade inválida.' }
              ]}
            >
              <Input disabled={submitting} maxLength={250} />
            </Form.Item>

            <Form.Item
              label="Estado/Região"
              name="state"
              rules={[
                { type: 'string', max: 250, message: 'Estado inválido.' }
              ]}
            >
              <Input disabled={submitting} maxLength={250} />
            </Form.Item>

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
          </Card>

          <Divider />

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={submitting}
              size="large"
              block
            >
              {buttonText}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}