import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Typography, Form, Input, Button, Divider,
  Upload, Card, message, Spin, Select
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import _service from '@netuno/service-client';
import "./index.less";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function InstitutionForm({
  uid = null,
  slug = null,
  initialData = null,
  onSuccess = () => { },
  onCancel = () => { },
  submitText = null,
  title = null,
  showBackButton = true,
  onBack
}) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState((!!uid || !!slug) && !initialData);
  const [form] = Form.useForm();

  const defaultOnBack = slug
    ? () => navigate(`/institutions/${slug}`)
    : () => navigate('/institutions');
  const backAction = onBack || defaultOnBack;

  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [initialLogo, setInitialLogo] = useState(null);
  const [initialCover, setInitialCover] = useState(null);

  const [cityOptions, setCityOptions] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const debounceTimer = useRef(null);

  // Use slug for edit mode if available, otherwise fallback to uid
  const editIdentifier = slug || uid;
  const isEditMode = !!editIdentifier;

  // Load institution data if in edit mode and no initialData provided
  useEffect(() => {
    if (editIdentifier && !initialData) {
      // Use slug if available, otherwise fallback to uid
      const identifierParam = slug ? `slug=${slug}` : `uid=${uid}`;
      _service({
        url: `/institution?${identifierParam}`,
        method: 'GET',
        success: ({ json }) => {
          if (json.data) {
            const data = json.data;
            setLogoPreview(data.logo ? _service.url(`/asset?uid=${data.uid}&assetName=avatar&entityName=institution`) : null);
            setCoverPreview(data.cover_image ? _service.url(`/asset?uid=${data.uid}&assetName=banner&entityName=institution`) : null);
            setInitialLogo(data.logo);
            setInitialCover(data.cover_image);

            // Pre-populate city select
            if (data.city && data.city.uid) {
              const cityLabel = [data.country?.name, data.state?.name, data.city?.name].filter(Boolean).join(' > ');
              setSelectedCity({ uid: data.city.uid, label: cityLabel });
              setCityOptions([{ value: data.city.uid, label: cityLabel, uid: data.city.uid }]);
            }

            form.setFieldsValue({
              name: data.name,
              description: data.description,
              email: data.email,
              telephone: data.telephone,
              address: data.address,
              post_code: data.post_code,
              city: data.city?.uid,
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
      setLogoPreview(initialData.logo ? _service.url(`/asset?uid=${initialData.uid}&assetName=avatar&entityName=institution`) : null);
      setCoverPreview(initialData.cover_image ? _service.url(`/asset?uid=${initialData.uid}&assetName=banner&entityName=institution`) : null);
      setInitialLogo(initialData.logo);
      setInitialCover(initialData.cover_image);

      // Pre-populate city select
      if (initialData.city && initialData.city.uid) {
        const cityLabel = [initialData.country?.name, initialData.state?.name, initialData.city?.name].filter(Boolean).join(' > ');
        setSelectedCity({ uid: initialData.city.uid, label: cityLabel });
        setCityOptions([{ value: initialData.city.uid, label: cityLabel, uid: initialData.city.uid }]);
      }

      form.setFieldsValue({
        name: initialData.name,
        description: initialData.description,
        email: initialData.email,
        telephone: initialData.telephone,
        address: initialData.address,
        post_code: initialData.post_code,
        city: initialData.city?.uid,
        website: initialData.website
      });
    }
  }, [uid, slug, initialData, form]);

  const validateImageDimensions = (file, { minW, minH, maxW, maxH, label }) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const { width, height } = img;
        if (width > maxW || height > maxH) {
          reject(new Error(
            `A imagem "${file.name}" excede as dimensões máximas permitidas (${maxW}x${maxH}px). ` +
            `As dimensões da sua imagem são ${width}x${height}px.`
          ));
        } else if (width < minW || height < minH) {
          reject(new Error(
            `A imagem "${file.name}" é demasiado pequena. Dimensões mínimas aceites: ${minW}x${minH}px. ` +
            `As dimensões da sua imagem são ${width}x${height}px.`
          ));
        } else {
          resolve();
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error(`Não foi possível ler a imagem "${file.name}". Tente outro ficheiro.`));
      };
      img.src = url;
    });
  };

  const handleLogoChange = async (info) => {
    const file = info.file.originFileObj || info.file;
    if (!file) return;
    try {
      await validateImageDimensions(file, {
        minW: 100, minH: 100, maxW: 400, maxH: 400, label: 'Logotipo'
      });
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setLogoFile(file);
    } catch (err) {
      message.error(err.message);
    }
  };

  const handleCoverChange = async (info) => {
    const file = info.file.originFileObj || info.file;
    if (!file) return;
    try {
      await validateImageDimensions(file, {
        minW: 600, minH: 200, maxW: 2400, maxH: 800, label: 'Imagem de Capa'
      });
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setCoverFile(file);
    } catch (err) {
      message.error(err.message);
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

  const handleCitySearch = useCallback((value) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!value || value.trim() === '') {
      setCityOptions([]);
      return;
    }

    debounceTimer.current = setTimeout(() => {
      _service({
        url: `location/city/search?name=${encodeURIComponent(value)}`,
        success: (response) => {
          const options = (response.json.data || []).map(city => ({
            value: city.uid,
            label: city.label,
            uid: city.uid,
          }));
          setCityOptions(options);
        },
        fail: () => {
          setCityOptions([]);
        }
      });
    }, 300);
  }, []);

  const handleCityChange = (value, option) => {
    setSelectedCity(option);
  };

  const handleCityClear = () => {
    setCityOptions([]);
    setSelectedCity(null);
  };

  function onFinish(values) {
    setSubmitting(true);

    const {
      name, description, email, telephone, address,
      post_code, website
    } = values;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description || '');
    formData.append('email', email);

    // Only append optional fields if they have values
    if (telephone) formData.append('telephone', telephone);
    if (address) formData.append('address', address);
    if (post_code) formData.append('post_code', post_code);
    if (selectedCity?.uid) formData.append('city', selectedCity.uid);
    if (website) formData.append('website', website);

    // Append files only if changed in edit mode
    if (logoFile) {
      formData.append('logo', logoFile);
    }
    if (coverFile) {
      formData.append('cover_image', coverFile);
    }

    const apiUrl = editIdentifier ? `/institution?${slug ? `slug=${slug}` : `uid=${uid}`}` : '/institution';
    const apiMethod = editIdentifier ? 'PUT' : 'POST';

    _service({
      method: apiMethod,
      url: apiUrl,
      data: formData,
      success: (response) => {
        if (response.json.result) {
          const successSlug = slug || response.json.data?.slug;
          const successUid = uid || response.json.data?.uid;
          onSuccess(successSlug || successUid, response.json.data);
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
            onClick={backAction}
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
          initialValues={{}}
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
                style={{ resize: 'none' }}
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

          <Card title="Logotipo e Imagem de Capa" className="form-card">
            <Form.Item
              label="Logotipo"
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
                      Carregar Logotipo
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
              label="Endereço"
              name="address"
            >
              <TextArea style={{ resize: 'none' }} rows={2} disabled={submitting} />
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
                { required: true, message: 'Selecione a cidade.' }
              ]}
            >
              <Select
                showSearch
                notFoundContent={null}
                filterOption={false}
                placeholder="Pesquisar cidade..."
                options={cityOptions}
                onSearch={handleCitySearch}
                onChange={handleCityChange}
                onClear={handleCityClear}
                allowClear
                disabled={submitting}
              />
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
