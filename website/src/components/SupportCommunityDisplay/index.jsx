import { useEffect } from "react";

import { Spin, Modal, Form, Input, Typography, Button, Card, Popconfirm, Empty, Avatar } from 'antd'
import {
  DeleteOutlined,
  EditOutlined,
  FolderOpenOutlined,
  TagsOutlined
} from "@ant-design/icons";
import { IoMegaphoneOutline } from "react-icons/io5";
import { LuReply } from "react-icons/lu";

import TimeAgo from "../TimeAgo";

import './index.less'

const { Paragraph, Text, Title } = Typography;
const { TextArea } = Input;

function SupportCommunityDisplay({
  loading,
  showModal,
  onCancel,
  editingCategory,
  editingTopic,
  editingReply,
  onFinish,
  listItems,
  loggedUser,
  handleCardClick,
  openEditModal,
  handleDelete,
  mode
}) {
  const [form] = Form.useForm();
  const isReply = mode === 'reply';
  const isTopic = mode === 'topic';

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
    if (editingReply) {
      form.setFieldsValue({
        content: editingReply.content,
      });
      return;
    }
    form.resetFields();
  }, [showModal, editingCategory, editingTopic, editingReply, form]);

  const getCountLabel = () => {
    if (isReply) {
      return listItems.length !== 1 ? "respostas encontradas" : "resposta encontrada";
    }
    if (isTopic) {
      return listItems.length !== 1 ? "tópicos encontrados" : "tópico encontrado";
    }
    return listItems.length !== 1 ? "categorias encontradas" : "categoria encontrada";
  };

  const getEmptyLabel = () => {
    if (isReply) {
      return "Nenhuma resposta encontrada";
    }
    if (isTopic) {
      return "Nenhum Tópico encontrado";
    }
    return "Nenhuma categoria encontrada";
  };

  const getItemTitle = (item) => {
    if (isReply) {
      return item.people?.name;
    }
    if (isTopic) {
      return item.title;
    }
    return item.name;
  };

  const getItemDescription = (item) => {
    if (isReply || isTopic) {
      return item.content;
    }
    return item.description;
  };

  const getDeleteTitle = () => {
    if (isReply) {
      return "Tem a certeza que deseja apagar a resposta?";
    }
    if (isTopic) {
      return "Tem a certeza que deseja apagar o tópico?";
    }
    return "Tem a certeza que deseja apagar a categoria?";
  };

  const canManageItem = (item) => {
    if (isReply) {
      return loggedUser.canManagePosts() || item.people?.uid === loggedUser.data?.uid;
    }
    return loggedUser.canManageForumCategories();
  };

  const getModalTitle = () => {
    if (isReply) {
      return "Criar nova Resposta";
    }
    if (isTopic) {
      return "Criar novo Tópico";
    }
    return "Cria nova categoria";
  };

  const getSubmitLabel = () => {
    if (isReply) {
      return editingReply ? "Editar" : "Responder";
    }
    if (isTopic) {
      return editingTopic ? "Editar" : "Criar";
    }
    return editingCategory ? "Editar" : "Criar";
  };

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
            {listItems.length} {getCountLabel()}
          </Text>
        </div>
      )}
      <div className="support-community__items">
        {!loading && listItems.map((item) => {
          return (
            <Card
              key={item.uid}
              className="support-community__card"
              hoverable={!isReply}
              onClick={() => handleCardClick?.(item.uid)}
            >
              <div className="support-community__card-body">
                <div className="support-community__content">
                  <div className="support-community__title-row">
                    <Title level={4} className="support-community__title">
                      <Avatar
                        size={35}
                        className="support-community__icon-material"
                        shape="square"
                      >
                        {isReply ? <LuReply /> : isTopic ? <TagsOutlined /> : <FolderOpenOutlined />}
                      </Avatar>
                      {getItemTitle(item)}
                    </Title>
                    {canManageItem(item) && (
                      <div className="support-community__actions">
                        <Popconfirm
                          title={getDeleteTitle()}
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
                    {isReply ? (
                      <Text type="secondary">
                        <TimeAgo sentAt={item.moment} />
                      </Text>
                    ) : (
                      <>
                        <IoMegaphoneOutline />
                        {isTopic ? (
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
                      </>
                    )}
                  </div>
                  <Paragraph
                    type="secondary"
                    ellipsis={{ rows: isReply ? 3 : 1, tooltip: true }}
                    className="support-community__description"
                  >
                    {getItemDescription(item)}
                  </Paragraph>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      {!loading && listItems.length === 0 && (
        <div className="support-community__empty">
          <Empty description={getEmptyLabel()} />
        </div>
      )}
      <Modal
        open={showModal}
        onCancel={onCancel}
        footer={null}
        title={getModalTitle()}
        destroyOnHidden
        width={800}
        centered
      >
        <div style={{ marginTop: "16px" }}>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            {!isReply && (
              <Form.Item
                name={isTopic ? 'title' : 'name'}
                label={isTopic ? 'Nome do Tópico' : 'Nome da categoria'}
                rules={[{ required: true, message: "O título é obrigatório!" }]}
              >
                <Input placeholder={isTopic ? 'Nome do Tópico' : 'Nome da categoria'} />
              </Form.Item>
            )}
            <Form.Item
              name={isReply || isTopic ? 'content' : 'description'}
              label={isReply ? "Resposta" : "Descrição"}
              rules={isReply ? [
                { required: true, message: "A resposta é obrigatória!" },
                { max: 2000, message: "A resposta deve ter no máximo 2000 caracteres." },
              ] : [
                { required: true, message: "A descrição é obrigatória!" },
                { min: 50, message: "A descrição deve ter no mínimo 50 caracteres." },
                { max: 150, message: "A descrição deve ter no máximo 150 caracteres." },
              ]}
            >
              <TextArea
                placeholder={isReply ? 'Escreva a sua resposta' : isTopic ? 'Descrição do tópico' : 'Descrição da categoria'}
                rows={4}
                maxLength={isReply || isTopic ? 2000 : 150}
                showCount
                style={{ resize: "none" }}
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
              <Button style={{ marginTop: 16 }} type="primary" htmlType="submit">
                {getSubmitLabel()}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
}
export default SupportCommunityDisplay;
