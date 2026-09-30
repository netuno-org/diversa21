import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, Row, Col, Typography, Tag, Empty, Spin, Select, Input, Pagination, DatePicker } from "antd";
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
const { RangePicker } = DatePicker;

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

const EMPTY_STATUS_COUNTS = {
  all: 0,
  pending: 0,
  resolved: 0,
  rejected: 0,
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
  const [searchEntityType, setSearchEntityType] = useState('all');
  const [reportedUser, setReportedUser] = useState("");
  const [reporterUser, setReporterUser] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState(EMPTY_STATUS_COUNTS);

  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get("status") || "all";

  const fetchList = ({
    status,
    entityType,
    reported,
    reporter,
    dates,
    currentPage,
  }) => {
    const startDate = dates?.[0]?.format("YYYY-MM-DD");
    const endDate = dates?.[1]?.format("YYYY-MM-DD");
    setLoading(true);
    _service({
      method: "GET",
      url: "/report/list",
      data: {
        page: currentPage,
        ...(status && status !== "all" ? { status } : {}),
        ...(entityType && entityType !== "all" ? { entityType } : {}),
        ...(reported.trim() ? { reportedUser: reported.trim() } : {}),
        ...(reporter.trim() ? { reporterUser: reporter.trim() } : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
      },
      success: ({ json }) => {
        setReports(json?.data?.items || []);
        setTotalCount(json?.data?.pagination?.totalCount ?? 0);
        setStatusCounts({
          ...EMPTY_STATUS_COUNTS,
          ...(json?.data?.statusCounts || {}),
        });
        setLoading(false);
      },
      fail: (e) => {
        console.log("Service Error", e);
        setReports([]);
        setTotalCount(0);
        setLoading(false);
      },
    });
  };

  useEffect(() => {
    fetchList({
      status: statusFilter,
      entityType: searchEntityType,
      reported: reportedUser,
      reporter: reporterUser,
      dates: dateRange,
      currentPage: page,
    });
  }, [page, statusFilter, searchEntityType, reportedUser, reporterUser, dateRange]);

  const handleCardClick = (uid) => {
    const status = searchParams.get("status");
    const query = status ? `?status=${status}` : "";

    navigate(`/reports/${uid}${query}`);
  };

  const handleCardMouseDown = (event, uid) => {
    if (event.button !== 1) return;

    const status = searchParams.get("status");
    const query = status ? `?status=${status}` : "";

    window.open(`/reports/${uid}${query}`, "_blank", "noopener,noreferrer");
  };

  const activeStatusCard =
    STATUS_CARDS.find((item) => item.key === statusFilter) || STATUS_CARDS[0];
  const visibleCount = reports.length;
  const countSuffix = visibleCount > 1
    ? activeStatusCard.countPlural
    : activeStatusCard.countSingular;

  return (
    <section className="reports">
      <div className="reports__header">
        <ListHeaderFilters
          title="Denúncias"
          description="Acompanhe as denúncias da comunidade e o estado de cada análise."
          hideInputs={true}
          hideLocation={true}
        />
        <Row gutter={[16, 16]} className="reports__stats">
          {STATUS_CARDS.map((status) => (
            <Col xs={12} sm={12} xl={6} key={status.key}>
              <Card
                className={classNames("reports__stat-card", {
                  "reports__stat-card--active": statusFilter === status.key,
                })}
                onClick={() => {
                  setPage(1);
                  setSearchParams({ status: status.key });
                }}
              >
                <div className="reports__stat-label">
                  {status.label}
                </div>
                {loading ? (
                  <Spin size="small" className="reports__stat-spin" />
                ) : (
                  <Title level={2} className="reports__stat-value">
                    {statusCounts[status.key] ?? 0}
                  </Title>
                )}
              </Card>
            </Col>
          ))}
        </Row>
        <div className="reports__filters">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Input.Search
                placeholder="Denunciado..."
                onSearch={(value) => {
                  setPage(1);
                  setReportedUser(value);
                }}
                enterButton={true}
                allowClear
              />
            </Col>
            <Col xs={24} md={12}>
              <Input.Search
                placeholder="Quem denunciou..."
                onSearch={(value) => {
                  setPage(1);
                  setReporterUser(value);
                }}
                enterButton={true}
                allowClear
              />
            </Col>
            <Col xs={24} md={12}>
              <Select
                allowClear
                placeholder="Tipo"
                style={{ width: "100%" }}
                options={[
                  { value: "post", label: "Publicação" },
                  { value: "comment", label: "Comentário" },
                  { value: "people", label: "Perfil" },
                  { value: "forum_topic", label: "Tópico" },
                  { value: "forum_reply", label: "Resposta" },
                ]}
                onChange={(value) => {
                  setPage(1);
                  setSearchEntityType(value || "all");
                }}
              />
            </Col>
            <Col xs={24} md={12}>
              <RangePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                allowClear
                value={dateRange}
                onChange={(dates) => {
                  setPage(1);
                  setDateRange(dates);
                }}
              />
            </Col>
          </Row>
        </div>
      </div>

      <div className="reports__count">
        <Text type="secondary">
          {visibleCount} {visibleCount > 1 ? "Denúncias" : "Denúncia"} {countSuffix}
        </Text>
      </div>

      <div className="reports__items">
        {loading ? (
          <div className="reports__empty">
            <Spin />
          </div>
        ) : reports.length === 0 ? (
          <div className="reports__empty">
            <Empty description="Nenhuma denúncia encontrada." />
          </div>
        ) : (
          reports.map((report) => {
            const type = TYPE_CONFIG[report.entityType];
            const status = STATUS_CONFIG[report.statusCode];
            const preview = getReportPreview(report);

            return (
              <Card className="reports__card" onClick={() => handleCardClick(report.uid)} onMouseDown={(event) => handleCardMouseDown(event, report.uid)} key={report.uid} >
                <div className="reports__card-header">
                  <div className="reports__card-identity">
                    <div className="reports__card-icon">
                      {type?.icon}
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
      {!loading && totalCount > 0 && (
        <div className="reports__pagination">
          <Pagination
            current={page}
            pageSize={10}
            total={totalCount}
            onChange={(nextPage) => setPage(nextPage)}
          />
        </div>
      )}
    </section>
  );
}

export default Reports;
