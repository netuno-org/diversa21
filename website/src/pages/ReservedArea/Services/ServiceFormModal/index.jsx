import React from 'react';
import { Modal, Form, Row, Col, Input, Select, Popover, Button } from 'antd';
import { LinkOutlined, InstagramOutlined, SmileOutlined } from '@ant-design/icons';
import EmojiPicker from 'emoji-picker-react';
import ptEmojis from 'emoji-picker-react/dist/data/emojis-pt';

export default function ServiceFormModal({
  visible,
  onCancel,
  onOk,
  form,
  saving,
  isEdit,
  categories,
  cityOptions,
  handleCitySearch,
  descriptionValue,
  setDescriptionValue,
  textAreaRef,
  handleEmojiClick,
  isMobile
}) {
  return (
    <Modal
      title={isEdit ? "Editar Anúncio de Serviço" : "Novo Anúncio de Serviço"}
      open={visible}
      onCancel={onCancel}
      onOk={onOk}
      confirmLoading={saving}
      okText={isEdit ? "Guardar" : "Publicar"}
      destroyOnHidden
      width={700}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Nome"
              name="name"
              rules={[
                { required: true, message: "Insira o nome do serviço" },
                { max: 100, message: "O nome não pode ter mais de 100 caracteres" },
              ]}
            >
              <Input maxLength={100} showCount placeholder="Nome do serviço ou profissional" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Categoria"
              name="category"
              rules={[{ required: true, message: "Selecione uma categoria" }]}
            >
              <Select
                showSearch
                placeholder="Selecione..."
                options={categories.map((c) => ({ label: c.name, value: c.uid }))}
                filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label="Cidade/Estado" name="city" rules={[{ required: true, message: "Insira a localização" }]}>
              <Select
                labelInValue
                showSearch
                placeholder="Pesquisar cidade..."
                filterOption={false}
                onSearch={handleCitySearch}
                options={cityOptions}
                notFoundContent={null}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Telefone" name="phone" rules={[{ max: 30, message: "O telefone não pode ter mais de 30 caracteres" }]}>
              <Input maxLength={30} placeholder="Contacto telefónico" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Descrição"
          name="description"
          rules={[
            { required: true, message: "A descrição é obrigatória" },
            { max: 250, message: "A descrição não pode ter mais de 250 caracteres" },
          ]}
        >
          <div className="services-list__description-wrapper">
            <Input.TextArea
              style={{ resize: 'none' }}
              ref={textAreaRef}
              value={descriptionValue}
              onChange={(e) => {
                setDescriptionValue(e.target.value);
                form.setFieldsValue({ description: e.target.value });
              }}
              maxLength={250}
              showCount
              rows={5}
              placeholder="Descreva os serviços prestados..."
              className="services-list__description-input"
            />
            {!isMobile && (
              <div className="services-list__emoji-wrapper">
                <Popover
                  content={
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      skinTonesDisabled
                      previewConfig={{ showPreview: false }}
                      emojiData={ptEmojis}
                      searchPlaceholder="Pesquisar..."
                      height="320px"
                      width="280px"
                    />
                  }
                  trigger="click"
                  placement="topRight"
                >
                  <Button type="text" shape="circle" icon={<SmileOutlined />} className="services-list__emoji-btn" />
                </Popover>
              </div>
            )}
          </div>
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label="Website" name="website" rules={[{ max: 100, message: "O website não pode ter mais de 100 caracteres" }]}>
              <Input maxLength={100} showCount prefix={<LinkOutlined />} placeholder="https://" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Instagram" name="instagram" rules={[{ max: 50, message: "O instagram não pode ter mais de 50 caracteres" }]}>
              <Input maxLength={50} showCount prefix={<InstagramOutlined />} placeholder="@utilizador" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}