import { useState } from "react";
import { Card, Row, Col, Typography, Tag, Empty } from "antd";
import {
  ClockCircleOutlined,
  EyeOutlined,
  CheckOutlined,
  WarningOutlined
} from "@ant-design/icons";
import { LuReply } from "react-icons/lu";
import { VscCommentDiscussionQuote } from "react-icons/vsc";
import { RiArticleLine } from "react-icons/ri";
import classNames from "classnames";

import ListHeaderFilters from "../../components/ListHeaderFilters";

import "./index.less";

const { Text, Title, Paragraph } = Typography;

const STATUS_CARDS = [
  { key: "all", label: "Total" },
  { key: "pending", label: "Pendentes" },
  { key: "in_analysis", label: "Em análise" },
  { key: "resolved", label: "Resolvidas" },
];

const TYPE_CONFIG = {
  topic: { label: "Tópico", icon: <VscCommentDiscussionQuote /> },
  reply: { label: "Resposta", icon: <LuReply /> },
  post: { label: "Postagem", icon: <RiArticleLine /> },
};

const STATUS_CONFIG = {
  pending: {
    label: "Pendente",
    icon: <ClockCircleOutlined />,
  },
  in_analysis: {
    label: "Em análise",
    icon: <EyeOutlined />,
  },
  resolved: {
    label: "Resolvido",
    icon: <CheckOutlined />,
  },
};

const REASON_LABELS = {
  harassment: "Assédio ou ameaça",
  discrimination: "Discriminação ou preconceito",
  offensive: "Conteúdo ofensivo ou inadequado",
  other: "Outro motivo",
};

const MOCK_REPORTS = [
  {
    type: "topic",
    status: "pending",
    reason: "harassment",
    contentType: "text",
    content: "Você é um completo inútil e não sabe do que está falando. Se aparecer no outro tópico eu vou cuidar de você pessoalmente...",
  },
  {
    
    type: "reply",
    status: "in_analysis",
    reason: "offensive",
    contentType: "text",
    content: "Isso não deveria estar publicado aqui.",
  },
  {
    
    type: "post",
    status: "resolved",
    reason: "other",
    reasonNote: "Spam repetitivo",
    content: "Venda de material pela plataforma...",
  },
];

function getReasonLabel(report) {
  if (report.reason === "other" && report.reasonNote) {
    return `Outro: ${report.reasonNote}`;
  }
  return REASON_LABELS[report.reason];
}

function Reports() {
  const [statusFilter, setStatusFilter] = useState("all");

  const counts = {
    all: MOCK_REPORTS.length,
    pending: MOCK_REPORTS.filter((report) => report.status === "pending").length,
    in_analysis: MOCK_REPORTS.filter((report) => report.status === "in_analysis").length,
    resolved: MOCK_REPORTS.filter((report) => report.status === "resolved").length,
  };

  const reports = statusFilter === "all"
    ? MOCK_REPORTS
    : MOCK_REPORTS.filter((report) => report.status === statusFilter);

  return (
    <section className="reports">
      <div className="reports__header">
        <ListHeaderFilters
          title="Central de Denúncias"
          description="Acompanhe as denúncias da comunidade e o estado de cada análise."
          hideInputs={false}
          hideLocation={true}
          searchPlaceholder={"Buscar por Categoria..."}
        />
      </div>

      <Row gutter={[16, 16]} className="reports__stats">
        {STATUS_CARDS.map((status) => (
          <Col xs={12} md={6} key={status.key}>
            <Card
              className={classNames("reports__stat-card", {
                "reports__stat-card--active": statusFilter === status.key,
              })}
              onClick={() => setStatusFilter(status.key)}
            >
              <Text type="secondary" className="reports__stat-label">
                {status.label}
              </Text>
              <Title level={2} className="reports__stat-value">
                {counts[status.key]}
              </Title>
            </Card>
          </Col>
        ))}
      </Row>

      <div className="reports__items">
        {reports.length === 0 ? (
          <div className="reports__empty">
            <Empty description="Nenhuma denúncia encontrada." />
          </div>
        ) : (
          reports.map((report) => {
            const type = TYPE_CONFIG[report.type];
            const status = STATUS_CONFIG[report.status];

            return (
              <Card className="reports__card">
                <div className="reports__card-header">
                  <div className="reports__card-identity">
                    <div className="reports__card-icon">
                      {type.icon}
                    </div>
                    <div className="reports__card-heading">
                      <Text strong className="reports__card-title">
                        {type.label} 
                      </Text>
                      Recido: Há 23h
                    </div>
                  </div>
                  <div className="reports__status-tag">
                    <div>{status.icon}</div>
                    <div>{status.label}</div>
                  </div>
                </div>

                <Tag
                  icon={<WarningOutlined />}
                  color={'error'}
                  variant="filled"
                  className="reports__reason-tag"
                >
                  {getReasonLabel(report)}
                </Tag>

                <div className="reports__preview">
                    <Paragraph ellipsis={{ rows: 3 }}>
                      “{report.content}”
                    </Paragraph>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </section>
  );
}

export default Reports;
