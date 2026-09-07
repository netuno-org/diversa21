import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Avatar,
  Button,
  Card,
  Empty,
  Space,
  Spin,
  Tag,
  Typography,
  Input,
  Form
} from "antd";
import {
  ArrowLeftOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { LuReply } from "react-icons/lu";
import { VscCommentDiscussionQuote } from "react-icons/vsc";
import { RiArticleLine } from "react-icons/ri";
import _service from "@netuno/service-client";

import TimeAgo from "../../../../components/TimeAgo";
import globalNotification from "../../../../common/globalNotification.js";

import "./index.less";

const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;

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

function ReportPage({ uid }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("/images/profile-default.png");
  const [solution, setSolution] = useState("");

  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get("status");
  const navigate = useNavigate();

  const fetchReport = () => {
    if (!uid) {
      return;
    }

    _service({
      method: "GET",
      url: "/report",
      data: { reportUid: uid },
      success: ({ json }) => {
        setReport(json?.data || null);
        setLoading(false);
      },
      fail: (e) => {
        console.log("Service Error", e);
        setReport(null);
        setLoading(false);
      },
    });
  };

  useEffect(() => {
    fetchReport();
  }, [uid]);

  useEffect(() => {
    const people = report?.content?.author
      || (report?.entityType === "people" ? report?.content : null);

    if (people?.avatar && people?.uid) {
      setAvatarUrl(
        _service.url(`/asset?uid=${people.uid}&type=avatar&entity=people&t=${Date.now()}`)
      );
      return;
    }
    setAvatarUrl("/images/profile-default.png");
  }, [report]);

  const handleStatusChange = (status) => {
    const previousStatus = report?.statusCode;
    setUpdating(true);
    setReport((prev) => (prev ? { ...prev, statusCode: status } : prev));
    _service({
      method: "PUT",
      url: "/report",
      data: { reportUid: uid, status },
      success: () => {
        const notification = status === "pending"
          ? globalNotification.warning
          : globalNotification.success;
        notification({
          title: "Denúncia atualizada",
          description: status === "resolved"
            ? "A denúncia foi marcada como resolvida."
            : status === "pending"
              ? "A denúncia voltou para pendente."
              : "A denúncia foi recusada.",
        });
        fetchReport();
        setUpdating(false);
      },
      fail: (e) => {
        console.log("Service Error", e);
        setReport((prev) => (prev ? { ...prev, statusCode: previousStatus } : prev));
        globalNotification.error({
          title: "Não foi possível atualizar",
          description: "Tente novamente em instantes.",
        });
        setUpdating(false);
      },
    });
  };
  console.log(report)
  if (loading) {
    return (
      <section className="report-page">
        <div className="report-page__empty">
          <Spin />
        </div>
      </section>
    );
  }

  if (!report) {
    return (
      <section className="report-page">
        <div className="report-page__empty">
          <Empty description="Denúncia não encontrada." />
        </div>
      </section>
    );
  }

  const type = TYPE_CONFIG[report.entityType];
  const statusConfig = STATUS_CONFIG[report.statusCode];
  const preview = getReportPreview(report);
  const items = report.items || [];

  const author = report.content?.author
    || (report.entityType === "people" ? report.content : null);

  return (
    <section className="report-page">
      <Button
        type="link"
        className="report-page__back"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(statusFilter ? `/reports?status=${statusFilter}` : "/reports")}
      >
        Voltar às denúncias
      </Button>
      <Card className="report-page__card">
        <div className="report-page__header">
          <div className="report-page__identity">
            {author ? (
              <Avatar
                className="report-page__avatar"
                size={50}
                src={avatarUrl}
                icon={<UserOutlined />}
                shape="square"
              />
            ) : (
              <div className="report-page__icon">{type?.icon}</div>
            )}
            <div className="report-page__heading">
              {author?.name && (
                <span className="report-page__author-info">
                  {author.name}
                </span>
              )}
              <Text type="secondary">
                Última:{" "}
                <TimeAgo sentAt={report.resolvedAt || report.createdAt} />
              </Text>
            </div>
          </div>

          <div className="report-page__container-tag-type">
            <div className="report-page__type">
              {type?.icon && (
                <span className="report-page__type-icon">{type.icon}</span>
              )}
              <Title level={5} className="report-page__title">
                {report.entityTypeTitle}
              </Title>
            </div>
            <Tag
              icon={statusConfig.icon}
              color={statusConfig.color}
              variant="filled"
              className="report-page__status-tag"
            >
              {statusConfig.label}
            </Tag>
          </div>
        </div>
        {preview && (
          <div className="report-page__preview">
            {report.entityType === "forum_topic" && report.content?.title && (
              <Title level={5}>{report.content.title}</Title>
            )}
            <Paragraph>
              {report.entityType === "forum_topic" && report.content?.content
                ? report.content.content
                : `“${preview}”`}
            </Paragraph>

          </div>
        )}
        {(report.statusCode === "pending"
          || report.statusCode === "resolved"
          || report.statusCode === "rejected") && (
          <div className="report-page__actions">
            <Form.Item
              name="description"
              layout="vertical"
            >
              <TextArea
                rows={4}
                placeholder="Descreva a solução..."
                maxLength={500}
                showCount
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                disabled={report.statusCode !== "pending"}
                style={{ resize: "none" }}
              />
            </Form.Item>
            <Space>
              {report.statusCode !== "rejected" && (
                <Button
                  type="dashed"
                  className={`report-page__action-resolve${report.statusCode === "resolved" ? " report-page__action-resolve--confirmed" : ""}`}
                  icon={<CheckOutlined />}
                  loading={updating}
                  onClick={() => handleStatusChange(
                    report.statusCode === "resolved" ? "pending" : "resolved"
                  )}
                >
                  {report.statusCode === "resolved"
                    ? "Clique Para Alterar"
                    : "Resolvida"}
                </Button>
              )}
              {report.statusCode !== "resolved" && (
                <Button
                  type="dashed"
                  className={`report-page__action-reject${report.statusCode === "rejected" ? " report-page__action-reject--confirmed" : ""}`}
                  icon={<CloseCircleOutlined />}
                  loading={updating}
                  onClick={() => handleStatusChange(
                    report.statusCode === "rejected" ? "pending" : "rejected"
                  )}
                >
                  {report.statusCode === "rejected"
                    ? "Clique para Alterar"
                    : "Recusar"}
                </Button>
              )}
            </Space>
          </div>
        )}
        {report.statusCode !== "pending" && report.resolvedBy?.name && (
          <Text type="secondary" className="report-page__resolved-by">
            Analisado por {report.resolvedBy.name}
          </Text>
        )}

      </Card>

      <div className="report-page__count">
        <Text type="secondary">
          {items.length} {items.length > 1 ? "Denúncias" : "Denúncia"} Encontrada{items.length > 1 ? "s" : ""}
        </Text>
      </div>

      {items.length === 0 ? (
        <Empty description="Nenhum registo individual encontrado." />
      ) : (
        items.map((item) => (
          <Card key={item.uid} className="report-page__item">
            <div className="report-page__item-header">
              <div className="report-page__reporter">
                <Avatar
                  className="report-page__avatar"
                  size={50}
                  src={item.reporter?.avatar && item.reporter?.uid
                    ? _service.url(`/asset?uid=${item.reporter.uid}&type=avatar&entity=people&t=${Date.now()}`)
                    : "/images/profile-default.png"}
                  icon={<UserOutlined />}
                  shape="square"
                />
                <div>
                  <Text className="report-page__author-info">
                    {item.reporter?.name}
                  </Text>
                  <div>
                    <TimeAgo sentAt={item.moment} />
                  </div>
                </div>
              </div>
            </div>
            <div>
              {item.reasonTitle && (
                <Tag className="report-page__reason" color="error" variant="filled">
                  {item.reasonTitle}
                </Tag>
              )}
              {item.description && (
                <div>
                  <Paragraph className="report-page__item-description">
                    {item.description}
                  </Paragraph>
                </div>
              )}
            </div>
          </Card>
        ))
      )}
    </section>
  );
}

export default ReportPage;