import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

import _service from "@netuno/service-client";

import TimeAgo from "../TimeAgo";

import { Spin, Modal, Form, Input, Typography, Button, Card, Popconfirm, Empty, Avatar, Popover, Grid } from 'antd'
import {
  DeleteOutlined,
  EditOutlined,
  FolderOpenOutlined,
  TagsOutlined,
  SmileOutlined,
  LikeOutlined,
  LikeFilled
} from "@ant-design/icons";
import { LuReply } from "react-icons/lu";
import { VscCommentDiscussionQuote } from "react-icons/vsc";
import EmojiPicker from "emoji-picker-react";
import ptEmojis from "emoji-picker-react/dist/data/emojis-pt";

import './index.less'

const { Paragraph, Text } = Typography;
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
  handleLike,
  loadingLike,
  mode
}) {
  const [avatarUrl, setAvatarUrl] = useState("/images/profile-default.png");
  const [form] = Form.useForm();
  const [descriptionValue, setDescriptionValue] = useState("");
  const textAreaRef = useRef(null);

  const screens = Grid.useBreakpoint();
  const isMobile = screens.lg === false;

  const titleMaxLength = mode === 'category' ? 50 : 250;
  const descriptionMaxLength = mode === 'topic' ? 5000 : mode === 'reply' ? 2500 : 500;

  useEffect(() => {
    if (!showModal) {
      setDescriptionValue("");
      return;
    }
    if (editingCategory) {
      form.setFieldsValue({
        name: editingCategory.name,
        description: editingCategory.description,
      });
      setDescriptionValue(editingCategory.description || "");
      return;
    }
    if (editingTopic) {
      form.setFieldsValue({
        title: editingTopic.title,
        content: editingTopic.content,
      });
      setDescriptionValue(editingTopic.content || "");
      return;
    }
    if (editingReply) {
      form.setFieldsValue({
        content: editingReply.content,
      });
      setDescriptionValue(editingReply.content || "");
      return;
    }
    setDescriptionValue("");
    form.resetFields();
  }, [showModal, editingCategory, editingTopic, editingReply, form]);

  const handleEmojiClick = (emojiData) => {
    const text = descriptionValue;
    const emoji = emojiData.emoji;

    let selectionStart = text.length;
    let selectionEnd = text.length;

    const textarea = textAreaRef.current?.resizableTextArea?.textArea;
    if (textarea) {
      selectionStart = textarea.selectionStart;
      selectionEnd = textarea.selectionEnd;
    }

    const updatedText = text.substring(0, selectionStart) + emoji + text.substring(selectionEnd);
    if (updatedText.length > descriptionMaxLength) {
      return;
    }

    setDescriptionValue(updatedText);
    const fieldName = mode === 'reply' || mode === 'topic' ? 'content' : 'description';
    form.setFieldsValue({ [fieldName]: updatedText });

    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(selectionStart + emoji.length, selectionStart + emoji.length);
      }
    }, 50);
  };

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
      {!loading && listItems.length > 0 && mode !== 'reply' && (
        <div className="support-community__count">
          <Text type="secondary">
            {listItems.length} {getCountLabel()}
          </Text>
        </div>
      )}
      <div className="support-community__items">
        {!loading && listItems.map((item) => {
          const activityAt = mode === 'category' ? item.lastActivityAt : item.moment;
          const avatarSrc = (mode === 'topic' || mode === 'reply') && item.people?.avatar && item.people?.uid
            ? _service.url(`/asset?uid=${item.people.uid}&type=avatar&entity=people`)
            : avatarUrl;
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
                    {mode === 'category' ?
                      <div className="support-community__icon-material">
                        <FolderOpenOutlined />
                      </div> :
                      <Link to={`/u/${item?.people?.user}`}>
                        <Avatar
                          size={50}
                          className="support-community__avatar"
                          shape="square"
                          src={avatarSrc}
                        />
                      </Link>
                    }
                    <div className="support-community__heading">
                      {mode === 'topic' ? (
                        <Paragraph
                          ellipsis={{ rows: 2 }}
                          className="support-community__title"
                        >
                          {getItemTitle(item)}
                        </Paragraph>
                      ) : mode === 'reply' ? (
                        <Link
                          className="support-community__title-link"
                          to={`/u/${item.people?.user}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <p className="support-community__title">
                            {getItemTitle(item)}
                          </p>
                        </Link>
                      ) : (
                        <p className="support-community__title">
                          {getItemTitle(item)}
                        </p>
                      )}
                      {mode === 'topic' ? (
                        <div className="support-community__meta">
                          {item.people?.name && (
                            <span>Autor: {item.people.name}</span>
                          )}
                          {item.moment && (
                            <span className="support-community__meta-item">
                              <TimeAgo sentAt={item.moment} />
                            </span>
                          )}
                        </div>
                      ) : mode === 'reply' && activityAt ? (
                        <div className="support-community__meta">
                          <span className="support-community__meta-item">
                            <TimeAgo sentAt={activityAt} />
                          </span>
                        </div>
                      ) : null}
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
                    <>
                      <div className="support-community__description">
                        {item.content}
                      </div>
                      <Button
                        style={{alignSelf: 'start'}}
                        type="link"
                        className="support-community__like-btn"
                        onClick={(e) => {handleLike(item)}}
                        loading={loadingLike === item.uid}
                        disabled={loadingLike === item.uid}
                      >
                        {item.liked ? <LikeFilled /> : <LikeOutlined />}
                        {item.likes || 0}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Paragraph
                        ellipsis={{ rows: 5 }}
                        className="support-community__description"
                      >
                        {getItemDescription(item)}
                      </Paragraph>
                      {mode === 'topic' && item.repliesCount > 0 && (
                        <div className="support-community__meta support-community__meta--secondary">
                          <span className="support-community__meta-item">
                            <VscCommentDiscussionQuote />
                            {item.repliesCount} resposta{item.repliesCount !== 1 ? "s" : ""}
                          </span>
                          {item.lastActivityAt && (
                            <span className="support-community__meta-item">
                              <span>Última:</span>
                              <TimeAgo sentAt={item.lastActivityAt} />
                            </span>
                          )}
                        </div>
                      )}
                      {mode === 'category' && (
                        <div className="support-community__meta support-community__meta--secondary">
                          <span className="support-community__meta-item">
                            <TagsOutlined />
                            {item.topicsCount} tópico{item.topicsCount > 1 ? "s" : ""}
                            {' '}
                            criado{item.topicsCount > 1 ? "s" : ""}
                          </span>
                          {activityAt && (
                            <span className="support-community__meta-item">
                              <span>Última:</span>
                              <TimeAgo sentAt={activityAt} />
                            </span>
                          )}
                        </div>
                      )}
                    </>
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
                rules={[
                  { required: true, message: "O título é obrigatório!" },
                  {
                    max: titleMaxLength,
                    message: mode === 'topic'
                      ? "O título deve ter no máximo 250 caracteres."
                      : "O nome deve ter no máximo 50 caracteres.",
                  },
                ]}
              >
                <Input
                  className="support-community__title-input"
                  placeholder={mode === 'topic' ? 'Nome do Tópico' : 'Nome da categoria'}
                  maxLength={titleMaxLength}
                  showCount
                />
              </Form.Item>
            )}
            <Form.Item
              name={mode === 'reply' || mode === 'topic' ? 'content' : 'description'}
              label={mode === 'reply' ? "Resposta" : "Descrição"}
              rules={mode === 'reply' || mode === 'topic' ? [
                { required: true, message: mode === 'reply' ? "A resposta é obrigatória!" : "A descrição é obrigatória!" },
                { max: descriptionMaxLength, message: mode === 'reply' ? "A resposta deve ter no máximo 2500 caracteres." : "A descrição deve ter no máximo 5000 caracteres." },
              ] : [
                { required: true, message: "A descrição é obrigatória!" },
                { min: 30, message: "A descrição deve ter no mínimo 30 caracteres." },
                { max: descriptionMaxLength, message: "A descrição deve ter no máximo 500 caracteres." },
              ]}
            >
              <div style={{ position: 'relative' }}>
                <TextArea
                  ref={textAreaRef}
                  value={descriptionValue}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDescriptionValue(val);
                    const fieldName = mode === 'reply' || mode === 'topic' ? 'content' : 'description';
                    form.setFieldsValue({ [fieldName]: val });
                  }}
                  placeholder={mode === 'reply' ? 'Escreva a sua resposta' : mode === 'topic' ? 'Descrição do tópico' : 'Descrição da categoria'}
                  rows={5}
                  maxLength={descriptionMaxLength}
                  showCount
                  style={{ resize: "none", paddingBottom: '36px' }}
                />
                {!isMobile && (
                  <div style={{ position: 'absolute', left: '8px', bottom: '8px', zIndex: 10 }}>
                    <Popover
                      content={
                        <EmojiPicker
                          onEmojiClick={handleEmojiClick}
                          skinTonesDisabled={false}
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
                      <Button
                        type="text"
                        shape="circle"
                        icon={<SmileOutlined />}
                        style={{ fontSize: 18, color: '#8c8c8c' }}
                      />
                    </Popover>
                  </div>
                )}
              </div>
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
