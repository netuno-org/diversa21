import { useEffect, useState } from "react";

import { Spin, Modal, Form, Input, Typography, Button, Card, Popconfirm, Empty, Avatar } from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  FolderOpenOutlined,
  TagsOutlined
} from "@ant-design/icons";
import { IoMegaphoneOutline } from "react-icons/io5";
import { LuReply } from "react-icons/lu";

import './index.less'

const { Paragraph, Text, Title } = Typography;
const { TextArea } = Input;

function SupportCommunityDisplay({
  loading,
  showModal,
  onCancel,
  editingCategory,
  editingTopic,
  onFinish,
  listItems,
  loggedUser,
  handleCardClick,
  openEditModal,
  handleDelete,
  mode,
  categoryName
}) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!showModal) {
      return;
    }
    if (editingCategory) {
      form.setFieldsValue({
        name: editingCategory.name,
        description: editingCategory.description,
      });
      return;
    }
    if (editingTopic) {
      form.setFieldsValue({
        title: editingTopic.title,
        content: editingTopic.content,
      });
      return;
    }
    form.resetFields();
  }, [showModal, editingCategory, editingTopic, form]);

  return (
    <div className="support-community"
      onClick={(e) => e.stopPropagation()}
    >
      {loading && (
        <div className="support-community__loading">
          <Spin size="large" />
        </div>
      )}
      {!loading && (
        <div className="support-community__count">
          <Text type="secondary">
            {listItems.length}{" "}
            {listItems.length !== 1 ? "categorias" : "categoria"} encontrada
            {listItems.length !== 1 ? "s" : ""}
          </Text>
        </div>
      )}
      {categoryName && (
        <div className="support-community__category">
          <Avatar
            size={50}
            className="support-community__icon-material"
            shape="square"
          >
            <FolderOpenOutlined />
          </Avatar>
          <div className="support-community__category-text">
            <Text type="secondary" className="support-community__category-label">
              Categoria selecionada:
            </Text>
            <Text type="secondary" className="support-community__category-name">
              {categoryName}
            </Text>
          </div>
        </div>
      )}
      <div className="support-community__items">
        {!loading && listItems.map((item) => {
          return (
            <Card key={item.uid} className="support-community__card" hoverable onClick={() => handleCardClick(item.uid)}>
              <div className="support-community__card-body">
                <div className="support-community__content">
                  <div className="support-community__title-row">
                    <Title level={4} className="support-community__title">
                      <Avatar
                        size={35}
                        className="support-community__icon-material"
                        shape="square"
                      >
                        {mode === 'topic' ? <TagsOutlined /> : <FolderOpenOutlined />}
                      </Avatar>
                      {mode === 'topic' ? item.title : item.name}
                    </Title>
                    {loggedUser.canManageForumCategories() && (
                      <div className="support-community__actions">
                        <Popconfirm
                          title="Tem a certeza que deseja apagar a categoria?"
                          description="Esta ação é irreversível"
                          onConfirm={(e) => {
                            e?.stopPropagation?.();
                            handleDelete(item.uid);
                          }}
                          onCancel={(e) => e?.stopPropagation?.()}
                          okText="Sim"
                          cancelText="Não"
                        >
                          <Button
                            danger
                            type="link"
                            className="support-community__action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <DeleteOutlined />
                          </Button>
                        </Popconfirm>
                        <Button
                          type="link"
                          className="support-community__action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(item);
                          }}
                        >
                          <EditOutlined />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="support-community__stats">
                    <IoMegaphoneOutline />
                    {mode === 'topic' ? (
                      <Text type="secondary">
                        <LuReply /> {item.repliesCount} resposta{item.repliesCount !== 1 ? "s" : ""}
                        {item.people?.name ? ` · ${item.people.name}` : ""}
                      </Text>
                    ) : (
                      <Text type="secondary">
                        {item.topicsCount} tópico{item.topicsCount !== 1 ? "s" : ""}
                        {" | "}
                        <LuReply />
                        {item.repliesCount} resposta{item.repliesCount !== 1 ? "s" : ""}
                      </Text>
                    )}
                  </div>
                  <Paragraph
                    type="secondary"
                    ellipsis={{ rows: 1, tooltip: true }}
                    className="support-community__description"
                  >
                    {mode === 'topic' ? item.content : item.description}
                  </Paragraph>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      {!loading && listItems.length === 0 && (
        <div className="support-community__empty">
          <Empty description={`${mode === 'topic' ? 'Nenhum Tópico encontrado' : 'Nenhuma categoria encontrada'}`} />
        </div>
      )}
      <Modal
        open={showModal}
        onCancel={onCancel}
        footer={null}
        title={`${mode === 'topic' ? 'Criar novo Tópico' : 'Cria nova categoria'}`}
        destroyOnHidden
        centered
      >
        <div style={{ marginTop: "16px" }}>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              name={`${mode === 'topic' ? 'title' : 'name'}`}
              label={`${mode === 'topic' ? 'Nome do Tópico' : 'Nome da categoria'}`}
              rules={[{ required: true, message: "O título é obrigatório!" }]}
            >
              <Input placeholder={`${mode === 'topic' ? 'Nome do Tópico' : 'Nome da categoria'}`} />
            </Form.Item>
            <Form.Item
              name={`${mode === 'topic' ? 'content' : 'description'}`}
              label="Descrição"
              rules={[
                { required: true, message: "A descrição é obrigatória!" },
                { min: 50, message: "A descrição deve ter no mínimo 50 caracteres." },
                { max: 150, message: "A descrição deve ter no máximo 150 caracteres." },
              ]}
            >
              <TextArea
                placeholder="Descrição da categoria"
                rows={4}
                maxLength={150}
                showCount
                style={{ resize: "none" }}
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
              {
                mode === 'topic' ?
                  <Button style={{ marginTop: 16 }} type="primary" htmlType="submit">
                    {editingTopic ? "Editar" : "Criar"}
                  </Button> :
                  <Button style={{ marginTop: 16 }} type="primary" htmlType="submit">
                    {editingCategory ? "Editar" : "Criar"}
                  </Button>
              }
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
}
export default SupportCommunityDisplay;
