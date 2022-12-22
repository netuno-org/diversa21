import { useState } from "react";
import { Button, Form, Input, notification, Space } from "antd";
import _service from "@netuno/service-client";

const { TextArea } = Input;

function Editor({ onCreated, onCancel, type, parent }) {
  const [submitting, setSubmitting] = useState(false);
  const onFinish = (values) => {
    setSubmitting(true);
    _service({
      url: "post",
      method: "POST",
      data: {...values, parent},
      success: (response) => {
        const post = response.json;
        console.log(post);
        if (onCreated) {
          onCreated(post);
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
  return (
    <Form onFinish={onFinish} layout="vertical">
      <Form.Item
        name="content"
        rules={[{ required: true }]}
        label={type === "comment" ? "Comentário" : "Publicação"}
      >
        <TextArea rows={4} />
      </Form.Item>
      <Form.Item>
        <Space>
          <Button htmlType="submit" loading={submitting} type="primary">
            {type === "comment" ? "Comentar" : "Publicar"}
          </Button>
          {type === "comment" && (
            <Button onClick={onCancel}>Cancelar</Button>
          )}
        </Space>
      </Form.Item>
    </Form>
  );
}

export default Editor;
