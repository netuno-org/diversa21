import { useState } from "react";
import { Button, Form, Input, notification, Space } from "antd";
import _service from "@netuno/service-client";

const { TextArea } = Input;

function Editor({
  onSubmited,
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
        console.log(post);
        if (onSubmited) {
          onSubmited(post);
        }
        setSubmitting(false);
      },
      fail: (e) => {
        notification.error({
          message: `Falha ao publicar ${parent ? "comentário" : "post"}`,
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
        if (onSubmited) {
          onSubmited(values);
        }
        notification.success({
          message: "Sucesso ao editar"
        })

        setSubmitting(false);
      },
      fail: (e) => {
        notification.error({
          message: `Falha ao editar`,
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
