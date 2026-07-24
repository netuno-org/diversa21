import { useState, useRef } from "react";
import { Button, Form, Input, Space, Popconfirm, Popover } from "antd";
import { SmileOutlined } from "@ant-design/icons";
import EmojiPicker from "emoji-picker-react";
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
  const contentValue = Form.useWatch("content", form) || "";
  const textAreaRef = useRef(null);

  const handleEmojiClick = (emojiData) => {
    const text = form.getFieldValue("content") || "";
    const emoji = emojiData.emoji;

    let selectionStart = text.length;
    let selectionEnd = text.length;

    const textarea = textAreaRef.current?.resizableTextArea?.textArea;
    if (textarea) {
      selectionStart = textarea.selectionStart;
      selectionEnd = textarea.selectionEnd;
    }

    const updatedText = text.substring(0, selectionStart) + emoji + text.substring(selectionEnd);
    form.setFieldsValue({ content: updatedText });

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
      form.setFields([
        {
          name: "content",
          errors: ["Digite algum conteúdo."]
        }
      ]);
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
          form.setFieldsValue({ content: "" });
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
      form.setFields([
        {
          name: "content",
          errors: ["Digite algum conteúdo."]
        }
      ]);
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
      title: "Comentário",
      cancelTitle: "Cancelar comentário?",
      onFinish: onCreatedPost
    },
    post: {
      submitButtonText: "Postar",
      showCancelButton: false,
      title: "Postagem",
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
      onFinish={types[type].onFinish}
      onClick={(e) => e.stopPropagation()}
      layout="vertical"
      initialValues={{ content }}
    >
      <Form.Item
        name="content"
        label={types[type].title}
      >
        <div style={{ position: 'relative' }}>
          <TextArea
            ref={textAreaRef}
            className="editor-form__text-area"
            maxLength={500}
            rows={4}
            placeholder={`Escreva ${parent ? "o seu comentário" : "a sua postagem"}`}
            style={{ paddingBottom: '40px' }}
          />
          <div style={{ position: 'absolute', bottom: '8px', left: '16px', zIndex: 5 }}>
            <Popover
              content={
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  skinTonesDisabled={false}
                  previewConfig={{ showPreview: false }}
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
          </div>
        </div>
      </Form.Item>

      <Form.Item className="editor-form__footer-item">
        <div className="editor-form__actions">
          <Space size="middle" className="editor-form__actions-group" align="center">
            <span className="editor-form__word-count">
              {contentValue.length}/500
            </span>

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
