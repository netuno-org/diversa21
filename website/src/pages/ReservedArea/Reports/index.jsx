import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, Row, Col, Typography, Tag, Empty, Spin } from "antd";
import {
  ClockCircleOutlined,
  CheckOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  UserOutlined,
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
  { key: "all", label: "Total", countSingular: "Encontrada", countPlural: "Encontradas" },
  { key: "pending", label: "Pendentes", countSingular: "Pendente", countPlural: "Pendentes" },
  { key: "resolved", label: "Resolvidas", countSingular: "Resolvida", countPlural: "Resolvidas" },
  { key: "rejected", label: "Recusadas", countSingular: "Recusada", countPlural: "Recusadas" },
];

const TYPE_CONFIG = {
  people: { icon: <UserOutlined /> },
  post: { icon: <RiArticleLine /> },
  comment: { icon: <VscCommentDiscussionQuote /> },
  forum_topic: { icon: <VscCommentDiscussionQuote /> },
  forum_reply: { icon: <LuReply /> },
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
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const statusFilter = searchParams.get("status") || "all";

  useEffect(() => {
    setLoading(true);
    _service({
      method: "GET",
      url: "/report/list",
      success: ({ json }) => {
        setReports(json?.data?.items || []);
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
    all: reports.length,
    pending: reports.filter((report) => report.statusCode === "pending").length,
    resolved: reports.filter((report) => report.statusCode === "resolved").length,
    rejected: reports.filter((report) => report.statusCode === "rejected").length,
  };

  const visibleReports = statusFilter === "all"
    ? reports
    : reports.filter((report) => report.statusCode === statusFilter);

  const handleCardClick = (uid) => {
    const status = searchParams.get("status");
    const query = status ? `?status=${status}` : "";

    window.open(`/reports/${uid}${query}`, "_blank", "noopener,noreferrer");
  };

  const activeStatusCard =
    STATUS_CARDS.find((item) => item.key === statusFilter) || STATUS_CARDS[0];
  const countSuffix = visibleReports.length === 1
    ? activeStatusCard.countSingular
    : activeStatusCard.countPlural;

  return (
    <section className="reports">
      <div className="reports__header">
        <ListHeaderFilters
          title="Denúncias"
          searchPlaceholder="Buscar por tipo..."
          description="Acompanhe as denúncias da comunidade e o estado de cada análise."
          hideInputs={false}
          hideLocation={true}
        />
      </div>

      <Row gutter={[16, 16]} className="reports__stats">
        {STATUS_CARDS.map((status) => (
          <Col xs={12} sm={12} xl={6} key={status.key}>
            <Card
              className={classNames("reports__stat-card", {
                "reports__stat-card--active": statusFilter === status.key,
              })}
              onClick={() => setSearchParams({ status: status.key })}
            >
              <div className="reports__stat-label">
                {status.label}
              </div>
              {loading ? (
                <Spin size="small" className="reports__stat-spin" />
              ) : (
                <Title level={2} className="reports__stat-value">
                  {counts[status.key]}
                </Title>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      <div className="reports__count">
        <Text type="secondary">
          {visibleReports.length} {visibleReports.length !== 1 ? "Denúncias" : "Denúncia"} {countSuffix}
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
            const type = TYPE_CONFIG[report.entityType];
            const status = STATUS_CONFIG[report.statusCode];
            const preview = getReportPreview(report);

            return (
              <Card className="reports__card" onClick={() => handleCardClick(report.uid)} key={report.uid} >
                <div className="reports__card-header">
                  <div className="reports__card-identity">
                    <div className="reports__card-icon">
                      {type.icon}
                    </div>
                    <div className="reports__card-heading">
                      <Text strong className="reports__card-title">
                        {report.entityTypeTitle}
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

                <Tag
                  style={{ marginBottom: 10, padding: 0 }}
                  icon={<WarningOutlined />}
                  color="error"
                  variant="filled"
                  className="reports__reason-tag"
                >
                  Quantidade:{' '}
                  {report.totalItems === 1
                    ? "1 denúncia"
                    : `${report.totalItems} denúncias`}
                </Tag>

                {preview && (
                  <div className="reports__preview">
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
