import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';
import { Row, Col, Button, Slider, Divider, Space, Typography, Popconfirm } from 'antd';
import {
  UploadOutlined, ZoomInOutlined, ZoomOutOutlined,
  UndoOutlined, FormatPainterOutlined, PictureOutlined, DeleteOutlined
} from '@ant-design/icons';
import { useDropzone } from 'react-dropzone';
import AvatarEditor from 'react-avatar-editor';

import './index.less';

const { Text } = Typography;

const DEFAULT_COVER = null;

function CoverImage({ currentImage, onRemove }, ref) {
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
    setImage(DEFAULT_COVER);
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

  const displayImage = removed ? DEFAULT_COVER : (image || currentImage);

  return (
    <div className="cover-editor">
      {!imageEditing ? (
        <div className="cover-editor__view" {...getRootProps()}>
          <input {...getInputProps()} />

          {displayImage ? (
            <img src={displayImage} alt="Capa" className="cover-editor__preview" />
          ) : (
            <div className="cover-editor__preview cover-editor__preview--empty">
              <PictureOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
            </div>
          )}

          <Space orientation="vertical" size="middle" style={{ marginTop: 24, width: '100%', alignItems: 'center' }}>
            <Button
              onClick={open}
              type="primary"
              icon={<UploadOutlined />}
              size="large"
              className="cover-editor__btn-upload"
              style={{ margin: 0 }}
            >
              Carregar Nova Capa
            </Button>

            {!removed && currentImage && (
              <Button
                type="dashed"
                danger
                icon={<DeleteOutlined />}
                onClick={handleRemove}
                size="large"
                className="cover-editor__btn-remove"
              >
                Remover Capa Atual
              </Button>
            )}
          </Space>

          <Text type="secondary" className="cover-editor__hint">
            (Ou arrasta e larga a foto aqui)
          </Text>
        </div>
      ) : (
        <div className="cover-editor__edit" {...getRootProps()}>
          <input {...getInputProps()} />
          <Row gutter={[32, 24]} align="middle">

            <Col xs={24} lg={12} className="cover-editor__canvas-wrapper">
              <AvatarEditor
                ref={refAvatarEditor}
                image={image}
                width={740}
                height={240}
                border={20}
                borderRadius={8}
                backgroundColor={color}
                scale={scale}
                rotate={rotate}
                position={position}
                onPositionChange={(pos) => setPosition(pos)}
                className="cover-editor__canvas"
                style={{ width: '100%', height: 'auto', maxWidth: '740px' }}
              />
            </Col>

            <Col xs={24} lg={12}>
              <Space orientation="vertical" size="large" className="cover-editor__controls-wrapper">
                <Button
                  onClick={open}
                  type="primary"
                  icon={<UploadOutlined />}
                  className="cover-editor__btn-swap"
                >
                  Trocar Arquivo
                </Button>

                <div className="cover-editor__settings">
                  <Divider titlePlacement="left" className="cover-editor__divider">
                    Ajustes da Capa
                  </Divider>

                  <Row align="middle" gutter={16} className="cover-editor__slider-row">
                    <Col><ZoomOutOutlined className="cover-editor__icon" /></Col>
                    <Col flex="auto">
                      <Slider
                        min={0.5} max={2.5} step={0.01}
                        value={scale} onChange={setScale}
                        tooltip={{ formatter: (v) => `${Math.round(v * 100)}%` }}
                      />
                    </Col>
                    <Col><ZoomInOutlined className="cover-editor__icon" /></Col>
                  </Row>

                  <Row align="middle" gutter={16} className="cover-editor__slider-row cover-editor__slider-row--spaced">
                    <Col><UndoOutlined className="cover-editor__icon" /></Col>
                    <Col flex="auto">
                      <Slider
                        min={-180} max={180} step={1}
                        value={rotate} onChange={setRotate}
                        tooltip={{ formatter: (v) => `${v}°` }}
                      />
                    </Col>
                  </Row>

                  <Space size="large" align="center" className="cover-editor__actions">
                    <Space>
                      <FormatPainterOutlined className="cover-editor__icon" />
                      <Text type="secondary">Cor de fundo:</Text>
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        title="Apenas visível em imagens com fundo transparente (PNG)"
                        className="cover-editor__color-picker"
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

export default React.forwardRef(CoverImage);