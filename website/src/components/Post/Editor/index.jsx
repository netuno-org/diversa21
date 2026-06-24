import { useState } from "react";
import { Button, Form, Input, notification, Space } from "antd";
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

  const clearContentForSubmit = (value) =>
    value.replace(/\n{3,}/g, "\n\n").trim();

  const onCreatedPost = (values) => {
    const cleanedContent = clearContentForSubmit(values.content);

    if (!cleanedContent) {
      form.setFields([
        {
          name: "content",
          errors: ["Digite algum conteúdo para publicar."]
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

          form.setFieldsValue({
            content: "",
          });
        }
        setSubmitting(false);
      },
      fail: (e) => {
        notification.error({
          title: `Falha ao publicar ${parent ? "comentário" : "post"}`,
        })
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
          errors: ["Digite algum conteúdo para publicar."]
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
        notification.success({
          title: "Sucesso ao editar"
        })

        setSubmitting(false);
      },
      fail: (e) => {
        notification.error({
          title: `Falha ao editar`,
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
      onFinish: onCreatedPost
    },
    post: {
      submitButtonText: "Publicar",
      showCancelButton: false,
      title: "Publicação",
      onFinish: onCreatedPost
    },
    editPost: {
      submitButtonText: "Editar",
      showCancelButton: true,
      title: "",
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
      initialValues={{
        content
      }}
    >
      <Form.Item
        name="content"
        rules={[{ required: true }]}
        label={types[type].title}
      >
        <TextArea
          className="editor-form__text-area"
          maxLength={500}
          rows={4} 
        />
      </Form.Item>

      <Form.Item className="editor-form__footer-item">
        <div className="editor-form__actions">
          <Space size="middle" className="editor-form__actions-group" align="center">
            <span className="editor-form__word-count">
              {contentValue.length}/500
            </span>

            {types[type].showCancelButton && (
              <Button 
                className="editor-form__btn editor-form__btn--cancel" 
                onClick={onCancel}
              >
                Cancelar
              </Button>
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
