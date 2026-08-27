import { useState } from "react";
import { Dropdown, Button, Popconfirm, Modal, Form, Input, Radio } from "antd";
import { EllipsisOutlined, FlagOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";

import "./index.less";

const { TextArea } = Input;

function ContentActions({ canViewDeletePostButton, editMode, onDeletePost, onEdit }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportType, setReportType] = useState("reasons");
  const [otherReason, setOtherReason] = useState(false)

  const [form] = Form.useForm();

  const items = [
    ...(canViewDeletePostButton
      ? [
        ...(!editMode
          ? [{
            key: "edit",
            label: "Editar",
            icon: <EditOutlined />,
            className: "content-actions-item--edit",
          }]
          : []),
        {
          key: "delete",
          label: "Deletar",
          icon: <DeleteOutlined />,
          className: "content-actions-item--delete",
        },
      ]
      : []),
    {
      key: "report",
      label: "Denunciar",
      icon: <FlagOutlined />,
      className: "content-actions-item--report",
    },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === "edit") {
      onEdit?.();
      return;
    }

    if (key === "delete") {
      setShowDeleteConfirm(true);
      return;
    }

    if (key === "report") {
      setReportOpen(true);
    }
  };

  const closeModal = () => {
    setReportOpen(false);
    form.resetFields();
  };

  const handleSubmit = () => {
    closeModal();
  };

  return (
    <div className="container-report">
      <Popconfirm
        title="Tem a certeza que quer remover a postagem?"
        description="Esta ação é irreversível"
        open={showDeleteConfirm}
        onClick={(e) => e.stopPropagation()}
        onConfirm={(e) => {
          e?.stopPropagation?.();
          onDeletePost?.();
          setShowDeleteConfirm(false);
        }}
        onCancel={(e) => {
          e?.stopPropagation?.();
          setShowDeleteConfirm(false);
        }}
        okText="Sim"
        cancelText="Não"
      >
        <Dropdown
          menu={{
            items,
            onClick: handleMenuClick,
          }}
          trigger={["click"]}
          placement="bottomRight"
          dropdownRender={(menu) => (
            <div
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {menu}
            </div>
          )}
        >
          <Button
            style={{height: '20px'}}
            color="primary"
            variant="outlined"
            icon={<EllipsisOutlined />}
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      </Popconfirm>
      <Modal
        open={reportOpen}
        onCancel={closeModal}
        footer={null}
        title="Denunciar"
        destroyOnHidden
        centered
        onClick={(e) => e.stopPropagation()}
      >
        <div >
          <Radio.Group
            className="container-report__options"
            options={[
              {
                label: "Assédio ou ameaça",
                value: "harassment",
              },
              {
                label: "Discriminação ou preconceito",
                value: "discrimination",
              },
              {
                label: "Conteúdo ofensivo ou inadequado",
                value: "offensive",
              },
              {
                label: "Outro motivo",
                value: "other",
              },
            ]}
            onChange={(e) => {
              if (e.target.value === "other") {
                setOtherReason(true);
              } else {
                setOtherReason(false)
              }
            }}
          />
        </div>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onClick={(e) => e.stopPropagation()}
        >
          {otherReason === true &&
            <Form.Item
              name="description"
              rules={[{ required: false }]}
            >
              <TextArea
                placeholder="Descreva o motivo da denúncia..."
                rows={5}
                maxLength={500}
                showCount
                style={{ resize: "none", marginTop: '20px' }}
              />
            </Form.Item>
          }
          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Button type="primary" htmlType="submit">
              Enviar
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ContentActions;
