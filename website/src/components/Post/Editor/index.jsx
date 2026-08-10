import { useState, useRef } from "react";
import { Button, Form, Input, Space, Popconfirm, Popover, Grid } from "antd";
import { SmileOutlined } from "@ant-design/icons";
import EmojiPicker from "emoji-picker-react";
import ptEmojis from "emoji-picker-react/dist/data/emojis-pt";
import globalNotification from "../../../common/globalNotification";
import _service from "@netuno/service-client";

const { TextArea } = Input;

import './index.less';

function Editor({
  onSubmitted,
  onCancel,
  type,
  uid,
  parent,
  content
}) {
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [contentValue, setContentValue] = useState(content || "");
  const textAreaRef = useRef(null);

  const screens = Grid.useBreakpoint();
  const isMobile = screens.lg === false;

  const getGraphemeCount = (str) => {
    if (typeof Intl.Segmenter === "function") {
      const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
      return Array.from(segmenter.segment(str)).length;
    }
    return str.length;
  };

  const handleEmojiClick = (emojiData) => {
    const text = contentValue;
    const emoji = emojiData.emoji;

    let selectionStart = text.length;
    let selectionEnd = text.length;

    const textarea = textAreaRef.current?.resizableTextArea?.textArea;
    if (textarea) {
      selectionStart = textarea.selectionStart;
      selectionEnd = textarea.selectionEnd;
    }

    const updatedText = text.substring(0, selectionStart) + emoji + text.substring(selectionEnd);
    
    if (getGraphemeCount(updatedText) > 500) {
      return;
    }

    setContentValue(updatedText);

    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        const cursorPosition = selectionStart + emoji.length;
        textarea.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 10);
  };

  const clearContentForSubmit = (value) => {
    return (value || "").replace(/\n{3,}/g, "\n\n").trim();
  };

  const onCreatedPost = (values) => {
    const cleanedContent = clearContentForSubmit(values.content);

    if (!cleanedContent) {
      globalNotification.info({
        title: "Digite algum conteúdo."
      });
      return;
    }

    setSubmitting(true);
    _service({
      url: "post",
      method: "POST",
      data: { ...values, content: cleanedContent, parent },
      success: (response) => {
        const post = response.json;
        post.likes = 0;
        post.comments = 0;
        if (onSubmitted) {
          onSubmitted(post);
          setContentValue("");
        }
        globalNotification.success({
          title: `${parent ? "Comentário criado" : "Postagem criada"} com sucesso.`
        });
        setSubmitting(false);
      },
      fail: (e) => {
        globalNotification.error({
          title: `Falha ao criar ${parent ? "comentário" : "post"}`,
        });
        setSubmitting(false);
      },
    });
  };

  const onEditPost = (values) => {
    const cleanedContent = clearContentForSubmit(values.content);

    if (!cleanedContent) {
      globalNotification.info({
        title: "Digite algum conteúdo."
      });
      return;
    }

    setSubmitting(true);
    _service({
      url: "post",
      method: "PUT",
      data: {
        ...values,
        content: cleanedContent,
        uid
      },
      success: (response) => {
        if (onSubmitted) {
          onSubmitted({ ...values, content: cleanedContent });
        }
        globalNotification.success({
          title: `Sucesso ao editar ${parent ? "comentário" : "postagem"}`
        });

        setSubmitting(false);
      },
      fail: (e) => {
        globalNotification.error({
          title: `Falha ao editar ${parent ? "comentário" : "postagem"}`,
        });

        setSubmitting(false);
      },
    });
  }

  const types = {
    comment: {
      submitButtonText: "Comentar",
      showCancelButton: true,
      title: "",
      cancelTitle: "Cancelar comentário?",
      onFinish: onCreatedPost
    },
    post: {
      submitButtonText: "Postar",
      showCancelButton: false,
      title: "",
      cancelTitle: "",
      onFinish: onCreatedPost
    },
    editPost: {
      submitButtonText: "Editar",
      showCancelButton: true,
      title: "",
      cancelTitle: "Cancelar edição?",
      onFinish: onEditPost
    }
  }

  return (
    <Form
      className={`editor-form editor-form--${type}`}
      form={form}
      onFinish={(values) => {
        types[type].onFinish({ ...values, content: contentValue });
      }}
      onClick={(e) => e.stopPropagation()}
      layout="vertical"
      initialValues={{ content }}
    >
      <Form.Item
        label={types[type].title}
      >
        <div className="editor-form__custom-container">
          <TextArea
            ref={textAreaRef}
            className="editor-form__text-area"
            rows={5}
            placeholder={`Escreva ${parent ? "o seu comentário" : "a sua postagem"}`}
            value={contentValue}
            onChange={(e) => {
              const val = e.target.value;
              if (getGraphemeCount(val) <= 500 || getGraphemeCount(val) < getGraphemeCount(contentValue)) {
                setContentValue(val);
              }
            }}
          />
          <div className="editor-form__emoji-bar">
            {!isMobile && (
              <Popover
                content={
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    skinTonesDisabled={false}
                    previewConfig={{ showPreview: false }}
                    emojiData={ptEmojis}
                    searchPlaceholder="Pesquisar..."
                    height="360px"
                    width="310px"
                  />
                }
                trigger="click"
                placement="topRight"
                overlayClassName="messages__chat-emoji-popover"
              >
                <Button
                  type="text"
                  shape="circle"
                  icon={<SmileOutlined />}
                  style={{ fontSize: 20, color: '#8c8c8c' }}
                />
              </Popover>
            )}
            <span className="editor-form__word-count" style={{ marginLeft: 'auto', color: '#8c8c8c', fontSize: '12px' }}>
              {getGraphemeCount(contentValue)}/500
            </span>
          </div>
        </div>
      </Form.Item>

      <Form.Item className="editor-form__footer-item">
        <div className="editor-form__actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ flex: '1 1 auto', minWidth: '200px' }}>
            {getGraphemeCount(contentValue) >= 500 && (
              <span style={{ color: '#ff4d4f', fontSize: '13px', fontWeight: '500', fontFamily: 'inherit', display: 'block', textAlign: 'left' }}>
                Você não pode ultrapassar o limite de 500 caracteres.
              </span>
            )}
          </div>
          <Space size="middle" className="editor-form__actions-group" align="center" style={{ flex: '0 0 auto' }}>

            {types[type].showCancelButton && (
              <Popconfirm
                title={types[type].cancelTitle}
                description="Todas as alterações não guardadas serão perdidas."
                onConfirm={onCancel}
                okText="Sim"
                cancelText="Não"
                placement="top"
              >
                <Button className="editor-form__btn editor-form__btn--cancel">
                  Cancelar
                </Button>
              </Popconfirm>
            )}

            <Button
              className="editor-form__btn editor-form__btn--submit"
              htmlType="submit"
              loading={submitting}
              type="primary"
            >
              {types[type].submitButtonText}
            </Button>
          </Space>
        </div>
      </Form.Item>
    </Form>
  );
}

export default Editor;
