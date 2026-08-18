import { useState, useEffect } from "react";

import { Spin, Modal, Form, Input, Typography, Button, Card, Popconfirm, Empty, Avatar } from 'antd'
import {
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  FolderOpenOutlined,
  TagsOutlined
} from "@ant-design/icons";
import { IoMegaphoneOutline } from "react-icons/io5";
import { LuReply } from "react-icons/lu";
import { VscCommentDiscussionQuote } from "react-icons/vsc";

import TimeAgo from "../TimeAgo";

import './index.less'

const { Paragraph, Text, Title } = Typography;
const { TextArea } = Input;

function ReplyDescription({ content }) {
  const [expanded, setExpanded] = useState(false);
  const [isEllipsis, setIsEllipsis] = useState(false);

  useEffect(() => {
    setExpanded(false);
    setIsEllipsis(false);
  }, [content]);

  return (
    <>
      <Paragraph
        type="primary"
        ellipsis={expanded ? false : { rows: 4, onEllipsis: setIsEllipsis }}
        className="support-community__description"
      >
        {content}
      </Paragraph>
      {(isEllipsis || expanded) && (
        <Button
          style={{ padding: 0 }}
          type="link"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          {expanded ? "Ver menos" : "Ver mais"}
        </Button>
      )}
    </>
  );
}

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
    if (mode === 'reply') {
      return listItems.length !== 1 ? "respostas encontradas" : "resposta encontrada";
    } else if (mode === 'topic') {
      return listItems.length !== 1 ? "tópicos encontrados" : "tópico encontrado";
    }
    return listItems.length !== 1 ? "categorias encontradas" : "categoria encontrada";
  };

  const getEmptyText = () => {
    if (mode === 'reply') {
      return "Nenhuma resposta encontrada";
    } else if (mode === 'topic') {
      return "Nenhum Tópico encontrado";
    }
    return "Nenhuma categoria encontrada";
  };

  const getItemTitle = (item) => {
    if (mode === 'reply') {
      return item.people?.name;
    } else if (mode === 'topic') {
      return item.title;
    }
    return item.name;
  };

  const getItemDescription = (item) => {
    if (mode === 'reply' || mode === 'topic') {
      return item.content;
    }
    return item.description;
  };

  const getDeleteTitle = () => {
    if (mode === 'reply') {
      return "Tem a certeza que deseja apagar a resposta?";
    } else if (mode === 'topic') {
      return "Tem a certeza que deseja apagar o tópico?";
    }
    return "Tem a certeza que deseja apagar a categoria?";
  };
  const canManageItem = (item) => {
    if (mode === 'topic' || mode === 'reply') {
      return loggedUser.canManagePosts() || item.people?.uid === loggedUser.data?.uid;
    }
    return loggedUser.canManageForumCategories();
  };

  const getModalTitle = () => {
    if (mode === 'reply') {
      return "Criar nova Resposta";
    } else if (mode === 'topic') {
      return "Criar novo Tópico";
    }
    return "Cria nova categoria";
  };

  const getSubmitLabel = () => {
    if (mode === 'reply') {
      return editingReply ? "Editar" : "Responder";
    } else if (mode === 'topic') {
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
              hoverable={mode !== 'reply'}
              onClick={() => handleCardClick?.(item.uid)}
            >
              <div className="support-community__card-body">
                <div className="support-community__content">
                  <div className="support-community__title-row">
                    <Avatar
                      size={35}
                      className="support-community__icon-material"
                      shape="square"
                    >
                      {mode === 'reply' ? <LuReply /> : mode === 'topic' ? <TagsOutlined /> : <FolderOpenOutlined />}
                    </Avatar>
                    <div className="support-community__heading">
                      <Title ellipsis={1} level={4} className="support-community__title">
                        {getItemTitle(item)}
                      </Title>
                      <div className="support-community__meta">
                        {mode === 'topic' && item.people?.name && (
                          <span>Autor : {item.people.name}</span>
                        )}
                        {mode === 'topic' && (
                          <span className="support-community__meta-item">
                            <VscCommentDiscussionQuote />
                            {item.repliesCount} resposta{item.repliesCount !== 1 ? "s" : ""}
                          </span>
                        )}
                        {mode === 'category' && (
                          <span className="support-community__meta-item">
                            <TagsOutlined />
                            {item.topicsCount} tópico{item.topicsCount !== 1 ? "s" : ""}
                            {' '}
                            encontrado{item.topicsCount !== 1 ? "s" : ""}
                          </span>
                        )}
                        {item.moment && (
                          <span className="support-community__meta-item">
                            <ClockCircleOutlined />
                            <TimeAgo sentAt={item.moment} />
                          </span>
                        )}
                      </div>
                    </div>
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
                  {mode === 'reply' ? (
                    <ReplyDescription content={getItemDescription(item)} />
                  ) : (
                    <Paragraph
                      type="primary"
                      style={{marginTop: 12}}
                      ellipsis={{ rows: 3, tooltip: false }}
                      className="support-community__description"
                    >
                      {getItemDescription(item)}
                    </Paragraph>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      {!loading && listItems.length === 0 && (
        <div className="support-community__empty">
          <Empty description={getEmptyText()} />
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
            {mode !== 'reply' && (
              <Form.Item
                name={mode === 'topic' ? 'title' : 'name'}
                label={mode === 'topic' ? 'Nome do Tópico' : 'Nome da categoria'}
                rules={[{ required: true, message: "O título é obrigatório!" }]}
              >
                <Input placeholder={mode === 'topic' ? 'Nome do Tópico' : 'Nome da categoria'} />
              </Form.Item>
            )}
            <Form.Item
              name={mode === 'reply' || mode === 'topic' ? 'content' : 'description'}
              label={mode === 'reply' ? "Resposta" : "Descrição"}
              rules={mode === 'reply' || mode === 'topic' ? [
                { required: true, message: mode === 'reply' ? "A resposta é obrigatória!" : "A descrição é obrigatória!" },
                { max: 2000, message: mode === 'reply' ? "A resposta deve ter no máximo 2000 caracteres." : "A descrição deve ter no máximo 2000 caracteres." },
              ] : [
                { required: true, message: "A descrição é obrigatória!" },
                { min: 30, message: "A descrição deve ter no mínimo 30 caracteres." },
                { max: 150, message: "A descrição deve ter no máximo 150 caracteres." },
              ]}
            >
              <TextArea
                placeholder={mode === 'reply' ? 'Escreva a sua resposta' : mode === 'topic' ? 'Descrição do tópico' : 'Descrição da categoria'}
                rows={4}
                maxLength={mode === 'reply' || mode === 'topic' ? 2000 : 150}
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
