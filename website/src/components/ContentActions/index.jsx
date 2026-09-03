import { useEffect, useState } from "react";

import _service from "@netuno/service-client";

import { Dropdown, Button, Popconfirm, Modal, Form, Input, Radio, Skeleton } from "antd";
import { EllipsisOutlined, FlagOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";

import "./index.less";

const { TextArea } = Input;

function ContentActions({ canViewDeletePostButton, canViewReportButton = true, editMode, onDeletePost, onEdit }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [listReason, setListReason] = useState([]);
  const [loading, setLoading] = useState(false)

  const [form] = Form.useForm();

  useEffect(() => {
    if (!reportOpen || listReason.length > 0) {
      return;
    }
    setLoading(true)
    _service({
      url: "/report/reason",
      method: "GET",
      success: ({ json }) => {
        if (json) {
          setListReason(json.data || []);
        }
        setLoading(false)
      },
      fail: (e) => {
        console.log("Service Error", e);
        setLoading(false)
      },
    });
  }, [reportOpen]);

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
    ...(canViewReportButton
      ? [{
        key: "report",
        label: "Denunciar",
        icon: <FlagOutlined />,
        className: "content-actions-item--report",
      }]
      : []),
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
            style={{ height: '20px' }}
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
          {loading ? (
            <Skeleton title={false} active paragraph={{ rows: 5, width: ["40%", "40%", "20%", "45%", "10%"] }} />
          ) : (
            <Radio.Group
              className="container-report__options"
              options={listReason.map((reason) => ({
                label: reason.title,
                value: reason.uid,
              }))}
              onChange={(e) => {
                const selected = listReason.find((reason) => reason.uid === e.target.value);
              }}
            />
          )}
        </div>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onClick={(e) => e.stopPropagation()}
        >
          <Form.Item
            name="description"
            rules={[{ required: false }]}
          >
            <TextArea
              placeholder="Faça uma breve descrção da denúncia..."
              disabled={loading}
              rows={5}
              maxLength={300}
              showCount
              style={{ resize: "none", marginTop: '20px' }}
            />
          </Form.Item>
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
