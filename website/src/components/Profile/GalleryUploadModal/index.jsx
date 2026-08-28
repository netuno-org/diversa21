import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Typography, Row, Col, Slider, Divider, Space } from 'antd';
import {
  UploadOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  UndoOutlined,
  FormatPainterOutlined,
} from '@ant-design/icons';
import { useDropzone } from 'react-dropzone';
import AvatarEditor from 'react-avatar-editor';

import './index.less';

const { Text } = Typography;
const MAX_SIZE_MB = 5;

function GalleryUploadModal({ open, uploading, onCancel, onUpload }) {
  const [imageFile, setImageFile] = useState(null);
  const [scale, setScale] = useState(1.0);
  const [rotate, setRotate] = useState(0);
  const [color, setColor] = useState('#ffffff');
  const [error, setError] = useState(null);

  const editorRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setImageFile(null);
      setColor('#ffffff');
      setError(null);
    }
  }, [open]);

  const validateAndSetFile = (selected) => {
    if (!selected) return;
    if (!selected.type.startsWith('image/')) {
      setError('O ficheiro selecionado não é uma imagem.');
      return;
    }
    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`A imagem excede o limite de ${MAX_SIZE_MB}MB.`);
      return;
    }
    setError(null);
    setImageFile(selected);
  };

  const { getRootProps, getInputProps, open: openPicker } = useDropzone({
    noClick: true,
    noKeyboard: true,
    multiple: false,
    accept: { 'image/*': [] },
    onDrop: ([selected]) => validateAndSetFile(selected),
  });

  const handleCancel = () => {
    if (uploading) return;
    onCancel();
  };

  const handleConfirm = () => {
    if (!editorRef.current || !imageFile) return;

    const canvas = editorRef.current.getImageScaledToCanvas();
    canvas.toBlob((blob) => {
      if (!blob) return;
      const finalFile = new File([blob], imageFile.name || 'photo.png', {
        type: 'image/png',
      });
      onUpload(finalFile);
    }, 'image/png');
  };

  return (
    <Modal
      open={open}
      title="Adicionar Foto à Galeria"
      onCancel={handleCancel}
      closable={!uploading}
      maskClosable={!uploading}
      destroyOnHidden
      width={imageFile ? 680 : 560}
      centered
      className="gallery-upload-modal"
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={uploading}>
          Cancelar
        </Button>,
        <Button
          key="confirm"
          type="primary"
          onClick={handleConfirm}
          loading={uploading}
          disabled={!imageFile}
        >
          Adicionar
        </Button>,
      ]}
    >
      <div className="gallery-upload-modal__body" {...getRootProps()}>
        <input {...getInputProps()} />
        {!imageFile ? (
          <div className="gallery-upload-modal__empty">
            <Button
              type="primary"
              icon={<UploadOutlined />}
              size="large"
              onClick={openPicker}
            >
              Escolher Foto
            </Button>
            <Text type="secondary" className="gallery-upload-modal__hint">
              (Ou arrasta e larga a foto aqui)
            </Text>
          </div>
        ) : (
          <div className="gallery-upload-modal__editor-container">
            <Row gutter={[24, 20]} align="middle">
              <Col xs={24} md={11} className="gallery-upload-modal__canvas-wrapper">
                <AvatarEditor
                  ref={editorRef}
                  image={imageFile}
                  width={220}
                  height={220}
                  border={15}
                  borderRadius={8}
                  backgroundColor={color}
                  scale={scale}
                  rotate={rotate}
                  className="gallery-upload-modal__canvas"
                />
              </Col>

              <Col xs={24} md={13}>
                <Space orientation="vertical" size="middle" className="gallery-upload-modal__controls">
                  <Button
                    onClick={openPicker}
                    type="primary"
                    icon={<UploadOutlined />}
                    disabled={uploading}
                  >
                    Trocar Arquivo
                  </Button>

                  <div className="gallery-upload-modal__settings">
                    <Divider titlePlacement="left" className="gallery-upload-modal__divider">
                      Ajustes da Imagem
                    </Divider>

                    <Row align="middle" gutter={12} className="gallery-upload-modal__slider-row">
                      <Col><ZoomOutOutlined className="gallery-upload-modal__icon" /></Col>
                      <Col flex="auto">
                        <Slider
                          min={1}
                          max={2.5}
                          step={0.01}
                          value={scale}
                          onChange={setScale}
                          tooltip={{ open: false }}
                        />
                      </Col>
                      <Col><ZoomInOutlined className="gallery-upload-modal__icon" /></Col>
                        ({Math.round(scale * 100)}%)
                    </Row>

                    <Row align="middle" gutter={12} className="gallery-upload-modal__slider-row">
                      <Col><UndoOutlined className="gallery-upload-modal__icon" /></Col>
                      <Col flex="auto">
                        <Slider
                          min={-180}
                          max={180}
                          step={1}
                          value={rotate}
                          onChange={setRotate}
                          tooltip={{ open: false }}
                          />
                      </Col>
                      ({rotate}°)
                    </Row>

                    <div className="gallery-upload-modal__color-section">
                      <Space>
                        <FormatPainterOutlined className="gallery-upload-modal__icon" />
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          title="Cor de fundo para transparências (PNG)"
                          className="gallery-upload-modal__color-picker"
                        />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Fundo
                        </Text>
                      </Space>
                    </div>
                  </div>
                </Space>
              </Col>
            </Row>
          </div>
        )}

        {error && (
          <Text type="danger" className="gallery-upload-modal__error">
            {error}
          </Text>
        )}
      </div>
    </Modal>
  );
}

export default GalleryUploadModal;