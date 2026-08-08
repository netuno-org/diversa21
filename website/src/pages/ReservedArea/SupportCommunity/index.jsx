import { useEffect, useState } from "react";
import _service from '@netuno/service-client';
import usePeople from "../../../common/usePeople.js";

import globalNotification from "../../../common/globalNotification.js";

import ListHeaderFilters from "../../../components/ListHeaderFilters";

import { Card, Empty, Form, Input, Typography, Modal, Spin, Button, Popconfirm } from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { IoMegaphoneOutline } from "react-icons/io5";
import { LuReply } from "react-icons/lu";

import "./index.less";

const { Paragraph, Text, Title } = Typography;
const { TextArea } = Input;

function SupportCommunity() {
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();
  const loggedUser = usePeople();

  useEffect(() => {
    handleListCategories();
  }, []);

  const handleListCategories = (name = '') => {
    setLoading(true);
    _service({
      method: 'GET',
      url: "/forum/category/list",
      data: { name },
      success: ({ json }) => {
        if (json) {
          setCategoryList(json.data.items);
        }
        setLoading(false);
      },
      fail: (e) => {
        console.log("Service Error", e);
        setLoading(false);
      }
    });
  };

  const handleCreateCategory = (values) => {
    setLoading(true);
    _service({
      method: 'POST',
      url: "/forum/category",
      data: {
        name: values.name,
        description: values.description
      },
      success: ({ json }) => {
        if (json) {
          globalNotification.success({
            title: 'Categoria Criada',
            description: 'A categoria foi criada com sucesso.',
          });
          closeModal();
          handleListCategories();
          return;
        }
        setLoading(false);
      },
      fail: (e) => {
        globalNotification.error({
          title: "Error",
          description: "Não foi possível criar a categoria.",
        });
        console.log("Service Error", e);
        setLoading(false);
      }
    });
  };

  const handleUpdateCategory = (values) => {
    setLoading(true);
    _service({
      method: 'PUT',
      url: "/forum/category",
      data: {
        uid: editingCategory.uid,
        name: values.name,
        description: values.description,
      },
      success: ({ json }) => {
        if (json) {
          globalNotification.success({
            title: 'Categoria Atualizada',
            description: 'A categoria foi atualizada com sucesso.',
          });
          closeModal();
          handleListCategories();
          return;
        }
        setLoading(false);
      },
      fail: (e) => {
        globalNotification.error({
          title: "Error",
          description: "Não foi possível atualizar a categoria.",
        });
        console.log("Service Error", e);
        setLoading(false);
      }
    });
  };

  const handleDeleteCategory = (uid) => {
    setLoading(true);
    _service({
      method: 'DELETE',
      url: "/forum/category",
      data: { uid },
      success: ({ json }) => {
        if (json) {
          globalNotification.success({
            title: 'Categoria Removida',
            description: 'A categoria foi removida com sucesso.',
          });
          handleListCategories();
          return;
        }
        setLoading(false);
      },
      fail: (e) => {
        globalNotification.error({
          title: "Error",
          description: "Não foi possível remover a categoria.",
        });
        console.log("Service Error", e);
        setLoading(false);
      }
    });
  };

  const handleSearchCategory = (value) => {
    handleListCategories(value);
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    form.resetFields();
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      description: category.description,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    form.resetFields();
  };

  const onFinish = (values) => {
    if (editingCategory) {
      handleUpdateCategory(values);
      return;
    }
    handleCreateCategory(values);
  };

  return (
    <div className="support-community">
        <ListHeaderFilters
          title="Rede de apoio"
          searchPlaceholder="Buscar por categoria"
          createButton={loggedUser.canManageForumCategories() && {
            icon: <PlusOutlined />,
            text: "Criar categoria",
            onClick: openCreateModal,
          }}
          hideLocation={true}
          onSearch={handleSearchCategory}
          onSearchClear={() => handleListCategories("")}
        />
      {loading && (
        <div className="support-community__loading">
          <Spin size="large" />
        </div>
      )}
      {!loading && (
        <div className="support-community__count">
          <Text type="secondary">
            {categoryList.length}{" "}
            {categoryList.length !== 1 ? "categorias" : "categoria"} encontrada
            {categoryList.length !== 1 ? "s" : ""}
          </Text>
        </div>
      )}
      <div className="support-community__items">
        {!loading && categoryList.map((category) => {
          return (
            <Card key={category.uid} className="support-community__card" hoverable>
              <div className="support-community__card-body">
                <div className="support-community__content">
                  <div className="support-community__title-row">
                    <Title level={4} className="support-community__title">
                      {category.name}
                    </Title>
                    {loggedUser.canManageForumCategories() && (
                      <div className="support-community__actions">
                        <Popconfirm
                          title="Tem a certeza que deseja apagar a categoria?"
                          description="Esta ação é irreversível"
                          onConfirm={() => handleDeleteCategory(category.uid)}
                          okText="Sim"
                          cancelText="Não"
                        >
                          <Button danger type="link" className="support-community__action-btn">
                            <DeleteOutlined />
                          </Button>
                        </Popconfirm>
                        <Button
                          type="link"
                          className="support-community__action-btn"
                          onClick={() => openEditModal(category)}
                        >
                          <EditOutlined />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="support-community__stats">
                    <IoMegaphoneOutline />
                    <Text type="secondary">
                      {category.topicsCount} tópico{category.topicsCount !== 1 ? "s" : ""}
                      {" | "}
                      <LuReply />
                      {category.repliesCount} resposta{category.repliesCount !== 1 ? "s" : ""}
                    </Text>
                  </div>
                    <Paragraph
                      type="secondary"
                      ellipsis={{ rows: 1, tooltip: true }}
                      className="support-community__description"
                    >
                      {category.description}
                    </Paragraph>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      {!loading && categoryList.length === 0 && (
        <div className="support-community__empty">
          <Empty description="Nenhuma categoria encontrada." />
        </div>
      )}
      <Modal
        open={showModal}
        onCancel={closeModal}
        footer={null}
        title={editingCategory ? "Editar categoria" : "Criar uma nova categoria"}
        destroyOnHidden
        centered
      >
        <div style={{ marginTop: "16px" }}>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="name"
              label="Nome da categoria"
              rules={[{ required: true, message: "O título é obrigatório!" }]}
            >
              <Input placeholder="Nome da categoria" />
            </Form.Item>
            <Form.Item
              name="description"
              label="Descrição"
              rules={[
                { required: true, message: "A descrição é obrigatória!" },
                { min: 50, message: "A descrição deve ter no mínimo 50 caracteres." },
                { max: 150, message: "A descrição deve ter no máximo 150 caracteres." },
              ]}
            >
              <TextArea
                placeholder="Descrição da categoria"
                rows={4}
                maxLength={150}
                showCount
                style={{ resize: "none" }}
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
              <Button style={{ marginTop: 16 }} type="primary" htmlType="submit">
                {editingCategory ? "Editar" : "Criar"}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
}

export default SupportCommunity;
