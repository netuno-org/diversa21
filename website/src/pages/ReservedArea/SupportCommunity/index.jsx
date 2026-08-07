import { useEffect, useState } from "react";
import _service from '@netuno/service-client';
import usePeople from "../../../common/usePeople.js";

import { Card, Empty, Form, Input, Typography, Modal, Spin, Button } from "antd";

import {
  MessageOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  EnterOutlined
} from "@ant-design/icons";
import { RiMegaphoneLine } from "react-icons/ri";
import { IoMegaphoneOutline } from "react-icons/io5";
import { LuReply } from "react-icons/lu";

import ListHeaderFilters from "../../../components/ListHeaderFilters";

import "./index.less";

const { Paragraph, Text, Title } = Typography;
const { TextArea } = Input;

function SupportCommunity() {
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const loggedUser = usePeople();

  useEffect(() => {
    fetchCategories();
  }, [])

  const fetchCategories = (name = '') => {
    setLoading(true);
    _service({
      url: "/forum/category/list",
      method: 'GET',
      data: { name },
      success: ({ json }) => {
        if (json) {
          setCategoryList(json.data);
        }
        setLoading(false);
      },
      fail: (e) => {
        console.log("Service Error", e);
        setLoading(false);
      }
    });
  };

  const handleSearchCategory = (value) => {
    fetchCategories(value);
  };

  return (
    <div className="support-community">
      <div className="support-community__header">
        <ListHeaderFilters
          title="Rede de apoio"
          searchPlaceholder="Buscar por categoria"
          createButton={loggedUser.canManageForumCategories() && {
            icon: <PlusOutlined />,
            text: "Criar categoria",
            onClick: () => {
              setShowModal(true);
            },
          }}
          hideLocation={true}
          onSearch={handleSearchCategory}
          onSearchClear={() => fetchCategories("")}
        />
      </div>
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
                  <Title level={4} className="support-community__title">
                    {category.name}
                  </Title>
                  <div className="support-community__stats">
                    <IoMegaphoneOutline />
                    <Text type="secondary">
                      {category.topicsCount} tópico{category.topicsCount !== 1 ? "s" : ""}
                      {" · "}
                      <LuReply />
                      {category.repliesCount} resposta{category.repliesCount !== 1 ? "s" : ""}
                    </Text>
                  </div>
                  {category.description && (
                    <Paragraph
                      type="secondary"
                      ellipsis={{ rows: 2, tooltip: true }}
                      className="support-community__description"
                    >
                      {category.description}
                    </Paragraph>
                  )}
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
        onCancel={() => setShowModal(false)}
        footer={null}
        title="Criar uma nova categoria"
        destroyOnHidden
        centered
      >
        <div style={{ marginTop: "16px" }}>
          <Form layout="vertical">
            <Form.Item
              name="name"
              label="Nome da categoria"
              rules={[{ required: true, message: "O título é obrigatório!" }]}
            >
              <Input placeholder="Nome da categoria" />
            </Form.Item>
            <Form.Item name="description" label="Descrição"
              rules={[{ required: true, message: "A descrição é obrigatória!" }]}>
              <TextArea
                placeholder="Descrição da categoria"
                rows={4}
                maxLength={150}
                showCount
                style={{ resize: "none" }}
              />
            </Form.Item>
            <Button
              type="primary"
              >Criar
            </Button>
          </Form>
        </div>
      </Modal>
    </div>
  );
}

export default SupportCommunity;
