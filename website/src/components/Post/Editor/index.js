import { useState } from "react";
import { Button, Form, Input } from 'antd';
import _service from "@netuno/service-client";

const { TextArea } = Input;

function Editor({onCreated}) {
    const [submitting, setSubmitting] = useState(false);
    const onFinish = (values) => {
        setSubmitting(true);
        _service({
            url: "post",
            method: "POST",
            data: values,
            success: (response) => {
              const post = response.json;
              console.log(post);
              if (onCreated) {
                onCreated(post);
              }         
              setSubmitting(false);
            },
            fail: (e) => {
              console.error(e);
              setSubmitting(false);
            }
        })
    }
    return (
        <Form onFinish={onFinish} layout="vertical">
        <Form.Item name="content" rules={[{required:true}]} label="Publicação">
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit" loading={submitting} type="primary">
            Publicar
          </Button>
        </Form.Item>
      </Form>
    )
}

export default Editor;