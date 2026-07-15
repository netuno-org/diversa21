import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';
import { Row, Col, Button, Slider, Divider, Space, Typography, Avatar as AntAvatar, Popconfirm } from 'antd';
import {
  UploadOutlined, ZoomInOutlined, ZoomOutOutlined,
  UndoOutlined, FormatPainterOutlined, DeleteOutlined
} from '@ant-design/icons';
import { useDropzone } from 'react-dropzone';
import AvatarEditor from 'react-avatar-editor';

import './index.less';

const { Text } = Typography;

const DEFAULT_IMAGE = '/images/profile-default.png';

function Avatar({ currentImage, onRemove }, ref) {
  const [image, setImage] = useState(currentImage);
  const [scale, setScale] = useState(1.0);
  const [rotate, setRotate] = useState(0);
  const [position, setPosition] = useState(undefined);
  const [color, setColor] = useState('#ffffff');
  const [removed, setRemoved] = useState(false);

  const refAvatarEditor = useRef(null);

  const imageEditing = image && typeof image !== 'string';

  useEffect(() => {
    setImage(null);
    const t = setTimeout(() => setImage(currentImage), 250);
    return () => clearTimeout(t);
  }, [currentImage]);

  useImperativeHandle(ref, () => ({
    getImage: () => imageEditing ? refAvatarEditor?.current?.getImage().toDataURL() : null,
    isRemoved: () => removed,
  }), [imageEditing, removed]);

  const handleRemove = () => {
    setImage(DEFAULT_IMAGE);
    setRemoved(true);
    if (onRemove) onRemove();
  };

  const { getRootProps, getInputProps, open } = useDropzone({
    noClick: true,
    noKeyboard: true,
    multiple: false,
    onDrop: ([file]) => {
      setImage(file);
      setScale(1.0);
      setRotate(0);
      setPosition(undefined);
      setRemoved(false);
    }
  });

  const handleUndo = () => {
    setImage(currentImage);
    setScale(1.0);
    setRotate(0);
    setPosition(undefined);
  };

  return (
    <div className="avatar-editor">
      {!imageEditing ? (
        <div className="avatar-editor__view" {...getRootProps()}>
          <input {...getInputProps()} />

          <AntAvatar
            src={removed ? DEFAULT_IMAGE : (image || DEFAULT_IMAGE)}
            size={240}
            shape="square"
            className="avatar-editor__preview"
          />

          <Space orientation="vertical" size="middle" style={{ marginTop: 24, width: '100%', alignItems: 'center' }}>
            <Button
              onClick={open}
              type="primary"
              icon={<UploadOutlined />}
              size="large"
              className="avatar-editor__btn-upload"
              style={{ margin: 0 }}
            >
              Carregar Nova Foto
            </Button>

            {!removed && currentImage && currentImage !== DEFAULT_IMAGE && (
              <Button
                type="dashed"
                danger
                icon={<DeleteOutlined />}
                onClick={handleRemove}
                size="large"
                className="avatar-editor__btn-remove"
              >
                Remover Foto Atual
              </Button>
            )}
          </Space>

          <Text type="secondary" className="avatar-editor__hint">
            (Ou arrasta e larga a foto aqui)
          </Text>
        </div>
      ) : (
        <div className="avatar-editor__edit" {...getRootProps()}>
          <input {...getInputProps()} />
          <Row gutter={[32, 24]} align="middle">
            <Col xs={24} md={10} className="avatar-editor__canvas-wrapper">
              <AvatarEditor
                ref={refAvatarEditor}
                image={image}
                width={240}
                height={240}
                border={20}
                borderRadius={8}
                backgroundColor={color}
                scale={scale}
                rotate={rotate}
                position={position}
                onPositionChange={(pos) => setPosition(pos)}
                className="avatar-editor__canvas"
              />
            </Col>

            <Col xs={24} md={14}>
              <Space orientation="vertical" size="large" className="avatar-editor__controls-wrapper">
                <Button
                  onClick={open}
                  type="primary"
                  icon={<UploadOutlined />}
                  className="avatar-editor__btn-swap"
                >
                  Trocar Arquivo
                </Button>

                <div className="avatar-editor__settings">
                  <Divider titlePlacement="left" className="avatar-editor__divider">
                    Ajustes da Imagem
                  </Divider>

                  <Row align="middle" gutter={16} className="avatar-editor__slider-row">
                    <Col><ZoomOutOutlined className="avatar-editor__icon" /></Col>
                    <Col flex="auto">
                      <Slider
                        min={0.5} max={2.5} step={0.01}
                        value={scale} onChange={setScale}
                        tooltip={{ formatter: (v) => `${Math.round(v * 100)}%` }}
                      />
                    </Col>
                    <Col><ZoomInOutlined className="avatar-editor__icon" /></Col>
                  </Row>

                  <Row align="middle" gutter={16} className="avatar-editor__slider-row avatar-editor__slider-row--spaced">
                    <Col><UndoOutlined className="avatar-editor__icon" /></Col>
                    <Col flex="auto">
                      <Slider
                        min={-180} max={180} step={1}
                        value={rotate} onChange={setRotate}
                        tooltip={{ formatter: (v) => `${v}°` }}
                      />
                    </Col>
                  </Row>

                  <Space size="large" align="center" className="avatar-editor__actions">
                    <Space>
                      <FormatPainterOutlined className="avatar-editor__icon" />
                      <Text type="secondary">Cor de fundo:</Text>
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        title="Apenas visível em imagens com fundo transparente (PNG)"
                        className="avatar-editor__color-picker"
                      />
                    </Space>
                    <Popconfirm
                      title="Cancelar edição?"
                      description="Todas as alterações não guardadas serão perdidas."
                      onConfirm={handleUndo}
                      okText="Sim"
                      cancelText="Não"
                      placement="top"
                    >
                      <Button type="dashed" danger>
                        Cancelar Edição
                      </Button>
                    </Popconfirm>
                  </Space>
                </div>
              </Space>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
}

export default React.forwardRef(Avatar);