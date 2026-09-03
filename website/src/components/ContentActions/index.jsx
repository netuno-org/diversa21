import { useEffect, useState } from "react";

import _service from "@netuno/service-client";

import globalNotification from "../../common/globalNotification";

import { Dropdown, Button, Popconfirm, Modal, Form, Input, Radio, Skeleton } from "antd";
import { EllipsisOutlined, FlagOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";

import "./index.less";

const { TextArea } = Input;

function ContentActions({
  entityType,
  entityUid,
  canViewDeletePostButton,
  canViewEditButton = canViewDeletePostButton,
  canViewReportButton = true,
  editMode,
  onDeletePost,
  onEdit,
  editLabel = "Editar",
  reportLabel = "Denunciar",
  className,
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [listReason, setListReason] = useState([]);
  const [loading, setLoading] = useState(false)
  const [submiting, setSubmiting] = useState(false)

  const [form] = Form.useForm();

  const items = [
    ...(canViewEditButton && !editMode
      ? [{
        key: "edit",
        label: editLabel,
        icon: <EditOutlined />,
        className: "content-actions-item--edit",
      }]
      : []),
    ...(canViewDeletePostButton
      ? [{
        key: "delete",
        label: "Deletar",
        icon: <DeleteOutlined />,
        className: "content-actions-item--delete",
      }]
      : []),
    ...(canViewReportButton
      ? [{
        key: "report",
        label: reportLabel,
        icon: <FlagOutlined />,
        className: "content-actions-item--report",
      }]
      : []),
  ];

  useEffect(() => {
    if (!reportOpen || listReason.length > 0) {
      return;
    }
    setLoading(true)
    _service({
      method: "GET",
      url: "/report/reason",
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

  const handleSubmit = ({ reason, description }) => {
    setSubmiting(true)
    _service({
      method: "POST",
      url: "/report",
      data: {
        entityType,
        entityUid,
        reason,
        description
      },
      success: () => {
        globalNotification.success({
          title: "Denúncia enviada.",
          description: "Denúncia enviada com sucesso.",
        });
        setSubmiting(false)
        closeModal()
      },
      fail: (e) => {
        globalNotification.error({
          title: "Error",
          description: "Não foi possível enviar a denúncia.",
        });
        console.log("Service Error", e);
        setSubmiting(false)
      },
    });
  };

  return (
    <div className={`container-report${className ? ` ${className}` : ""}`}>
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
            className="container-report__trigger"
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
        title="Selecione uma das opções abaixo."
        destroyOnHidden
        centered
        onClick={(e) => e.stopPropagation()}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onClick={(e) => e.stopPropagation()}
        >
          <Form.Item
            name="reason"
            rules={[{ required: true, message: "Selecione um motivo" }]}
          >
            <div>
              {loading ? (
                <Skeleton title={false} active paragraph={{ rows: 5, width: ["40%", "40%", "20%", "45%", "10%"] }} />
              ) : (
                <Radio.Group
                  className="container-report__options"
                  options={listReason.map((reason) => ({
                    label: reason.title,
                    value: reason.code,
                  }))}
                />
              )}
            </div>
          </Form.Item>
          <Form.Item
            name="description"
            rules={[{ required: false }]}
          >
            <TextArea
              placeholder="Faça uma breve descrição da denúncia..."
              disabled={loading || submiting}
              rows={5}
              maxLength={300}
              showCount
              style={{ resize: "none" }}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, paddingTop: '20px', textAlign: "right" }}>
            <Button type="primary" disabled={submiting || loading} loading={submiting} htmlType="submit">
              Enviar
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ContentActions;
