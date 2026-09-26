import React from 'react';
import { Modal, Form, Input } from 'antd';

export default function CategoryFormModal({
  visible,
  onCancel,
  onOk,
  form,
  saving
}) {
  return (
    <Modal
      title="Criar categoria de serviço"
      open={visible}
      onCancel={onCancel}
      onOk={onOk}
      confirmLoading={saving}
      okText="Criar"
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Nome da categoria"
          name="name"
          rules={[{ required: true, message: "Nome da categoria é obrigatório" }]}
        >
          <Input placeholder="Ex: Saúde" />
        </Form.Item>
        <Form.Item label="Descrição" name="description">
          <Input.TextArea rows={3} style={{resize: 'none'}} maxLength={250} showCount placeholder="Breve descrição da categoria." />
        </Form.Item>
      </Form>
    </Modal>
  );
}