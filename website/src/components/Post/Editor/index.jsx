import { useState } from "react";
import { Button, Form, Input, notification, Space } from "antd";
import _service from "@netuno/service-client";

const { TextArea } = Input;

function Editor({
  onSubmitted,
  onCancel,
  type,
  uid,
  parent,
  content
}) {
  const [submitting, setSubmitting] = useState(false);

  const onCreatedPost = (values) => {
    setSubmitting(true);
    _service({
      url: "post",
      method: "POST",
      data: {...values, parent},
      success: (response) => {
        const post = response.json;
        post.likes = 0;
        post.comments = 0;
        console.log(post);
        if (onSubmitted) {
          onSubmitted(post);
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
    setSubmitting(true);
    _service({
      url: "post",
      method: "PUT",
      data: {
        ...values,
        uid
      },
      success: (response) => {
        if (onSubmitted) {
          onSubmitted(values);
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
      onFinish={types[type].onFinish}
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
        <TextArea rows={4} />
      </Form.Item>
      <Form.Item>
        <Space>
          <Button htmlType="submit" loading={submitting} type="primary">
            {types[type].submitButtonText}
          </Button>
          {types[type].showCancelButton && (
            <Button onClick={onCancel}>Cancelar</Button>
          )}
        </Space>
      </Form.Item>
    </Form>
  );
}

export default Editor;
