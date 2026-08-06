import { useMemo, useState } from "react";
import { Card, Empty, Tag, Typography } from "antd";
import usePeople from "../../../common/usePeople.js";

import {
  MessageOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { RiMegaphoneLine } from "react-icons/ri";

import ListHeaderFilters from "../../../components/ListHeaderFilters";

import "./index.less";

const { Paragraph, Text, Title } = Typography;

const MOCK_CATEGORIES = [
  {
    uid: "cat-depressão",
    name: "Depressão",
    description: "Perguntas frequentes sobre funcionamento, horários e informações das instituições.",
    topicsCount: 2,
    repliesCount: 3,
    official: true,
    icon: <QuestionCircleOutlined />,
  },
  {
    uid: "cat-ansiedade",
    name: "Ansiedade",
    description: "Espaço para partilhar experiências e pedir apoio sobre ansiedade.",
    topicsCount: 5,
    repliesCount: 12,
    official: false,
    icon: <RiMegaphoneLine />,
  },
];

function SupportCommunity() {
  const [searchTerm, setSearchTerm] = useState("");
  const loggedUser = usePeople();

  return (
    <div className="support-community">
      <div className="support-community__header">
        <ListHeaderFilters
          title="Rede de apoio"
          searchPlaceholder="Buscar por categoria"
          createButton={loggedUser.canManageForumCategories() && {
            icon: <PlusOutlined />,
            text: "Nova categoria",
          }}
          hideLocation={true}
          onSearch={setSearchTerm}
          onSearchClear={() => setSearchTerm("")}
        />
      </div>
      <div className="support-community__count">
        <Text type="secondary">
          {MOCK_CATEGORIES.length}{" "}
          {MOCK_CATEGORIES.length !== 1 ? "categorias" : "categoria"} encontrada
          {MOCK_CATEGORIES.length !== 1 ? "s" : ""}
        </Text>
      </div>
      <div className="support-community__items">
        {MOCK_CATEGORIES.map((category) => {
          return (
            <Card key={category.uid} className="support-community__card" hoverable>
              <div className="support-community__card-body">
                <div className="support-community__content">
                  <Title level={4} className="support-community__title">
                    {category.name}
                  </Title>
                  <div className="support-community__stats">
                    <MessageOutlined />
                    <Text type="secondary">
                      {category.topicsCount} tópico{category.topicsCount !== 1 ? "s" : ""}
                      {" · "}
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
      {MOCK_CATEGORIES.length === 0 && (
        <div className="support-community__empty">
          <Empty description="Nenhuma categoria encontrada." />
        </div>
      )}
    </div>
  );
}

export default SupportCommunity;
