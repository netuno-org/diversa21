import { useEffect, useState } from "react";
import { Card, Row, Col, Typography, Tag, Empty, Spin } from "antd";
import {
  ClockCircleOutlined,
  CheckOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  UserOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import { LuReply } from "react-icons/lu";
import { VscCommentDiscussionQuote } from "react-icons/vsc";
import { RiArticleLine } from "react-icons/ri";
import classNames from "classnames";
import _service from "@netuno/service-client";

import ListHeaderFilters from "../../../components/ListHeaderFilters";
import TimeAgo from "../../../components/TimeAgo";

import "./index.less";

const { Text, Title, Paragraph } = Typography;

const STATUS_CARDS = [
  { key: "pending", label: "Pendentes" },
  { key: "resolved", label: "Resolvidas" },
  { key: "rejected", label: "Recusadas" },
];

const TYPE_CONFIG = {
  people: { label: "Perfil", icon: <UserOutlined /> },
  post: { label: "Postagem", icon: <RiArticleLine /> },
  comment: { label: "Comentário", icon: <CommentOutlined /> },
  forum_topic: { label: "Tópico", icon: <VscCommentDiscussionQuote /> },
  forum_reply: { label: "Resposta", icon: <LuReply /> },
};

const STATUS_CONFIG = {
  pending: {
    label: "Pendente",
    icon: <ClockCircleOutlined />,
    color: "#D0990F",
  },
  resolved: {
    label: "Resolvido",
    icon: <CheckOutlined />,
    color: "#50A063",
  },
  rejected: {
    label: "Recusado",
    icon: <CloseCircleOutlined />,
    color: "error",
  },
};

function getReportPreview(report) {
  const content = report.content || {};
  if (report.entityType === "people") {
    return content.name || "";
  }
  if (report.entityType === "forum_topic") {
    return content.title || content.content || "";
  }
  return content.content || "";
}

function Reports() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    _service({
      method: "GET",
      url: "/report",
      success: ({ json }) => {
        setReports(json?.data || []);
        setLoading(false);
      },
      fail: (e) => {
        console.log("Service Error", e);
        setReports([]);
        setLoading(false);
      },
    });
  }, []);
  
  const counts = {
    pending: reports.filter((report) => report.statusCode === "pending").length,
    resolved: reports.filter((report) => report.statusCode === "resolved").length,
    rejected: reports.filter((report) => report.statusCode === "rejected").length,
  };

  const visibleReports = statusFilter === "all"
    ? reports
    : reports.filter((report) => report.statusCode === statusFilter);

  return (
    <section className="reports">
      <div className="reports__header">
        <ListHeaderFilters
          title="Denúncias"
          description="Acompanhe as denúncias da comunidade e o estado de cada análise."
          hideInputs={false}
          hideLocation={true}
          searchPlaceholder={"Buscar por Categoria..."}
        />
      </div>

      <Row gutter={[16, 16]} className="reports__stats">
        {STATUS_CARDS.map((status) => (
          <Col xs={12} sm={8} xl={8} key={status.key}>
            <Card
              className={classNames("reports__stat-card", {
                "reports__stat-card--active": statusFilter === status.key,
              })}
              onClick={() => setStatusFilter(status.key)}
            >
              <div className="reports__stat-label">
                {status.label}
              </div>
              <Title level={2} className="reports__stat-value">
                {counts[status.key]}
              </Title>
            </Card>
          </Col>
        ))}
      </Row>

      <div className="reports__count">
        <Text type="secondary">
          {visibleReports.length} {visibleReports.length !== 1 ? "Denúncias" : "Denúncia"} Encontrada{visibleReports.length !== 1 ? "s" : ""}
        </Text>
      </div>

      <div className="reports__items">
        {loading ? (
          <div className="reports__empty">
            <Spin />
          </div>
        ) : visibleReports.length === 0 ? (
          <div className="reports__empty">
            <Empty description="Nenhuma denúncia encontrada." />
          </div>
        ) : (
          visibleReports.map((report) => {
            const type = TYPE_CONFIG[report.entityType] || { label: report.entityTypeTitle, icon: <WarningOutlined /> };
            const status = STATUS_CONFIG[report.statusCode] || {
              label: report.statusTitle,
              icon: <ClockCircleOutlined />,
              color: "default",
            };
            const preview = getReportPreview(report);

            return (
              <Card className="reports__card" key={report.uid}>
                <div className="reports__card-header">
                  <div className="reports__card-identity">
                    <div className="reports__card-icon">
                      {type.icon}
                    </div>
                    <div className="reports__card-heading">
                      <Text strong className="reports__card-title">
                        {type.label}
                      </Text>
                      <span>
                        <TimeAgo sentAt={report.lastReportedAt || report.createdAt} />
                      </span>
                    </div>
                  </div>
                  <Tag
                    icon={status.icon}
                    color={status.color}
                    variant="filled"
                    className="reports__status-tag"
                  >
                    {status.label}
                  </Tag>
                </div>

                {report.totalItems >= 0 && (
                  <Tag
                    style={{ marginBottom: 10, padding: 0 }}
                    icon={<WarningOutlined />}
                    color="error"
                    variant="filled"
                    className="reports__reason-tag"
                  >
                    Quantidade:{' '}
                    {(report.totalItems === 1 || report.totalItems === 0)
                      ? "1 denúncia"
                      : `${report.totalItems} denúncias`}
                  </Tag>
                )}

                {preview && (
                  <div className="reports__preview">
                    <Title style={{ marginTop: 0 }} level={5}>
                      Conteúdo:
                    </Title>
                    <Paragraph ellipsis={{ rows: 3 }}>
                      “{preview}”
                    </Paragraph>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </section>
  );
}

export default Reports;
