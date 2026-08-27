import { useState } from "react";
import { Dropdown, Button, Popconfirm } from "antd";
import { EllipsisOutlined, FlagOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";

import "./index.less";

function ContentActions({ canViewDeletePostButton, editMode, onDeletePost, onEdit }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
      console.log("Abrir denúncia");
    }
  };

  return (
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
        setShowDeleteConfirm(false)
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
          type="text"
          icon={<EllipsisOutlined />}
          onClick={(e) => e.stopPropagation()}
        />
      </Dropdown>
    </Popconfirm>
  );
}

export default ContentActions;
