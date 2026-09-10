import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import _service from "@netuno/service-client";
import globalNotification from "../../../../common/globalNotification.js";

import TimeAgo from "../../../../components/TimeAgo";
import HistoryModal from "./HistoryModal";

import {
  Avatar,
  Button,
  Card,
  Empty,
  Form,
  Pagination,
  Space,
  Spin,
  Tag,
  Typography,
  Input,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CloseOutlined,
  HistoryOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { LuReply } from "react-icons/lu";
import { VscCommentDiscussionQuote } from "react-icons/vsc";
import { RiArticleLine } from "react-icons/ri";

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

function getReportAuthor(report) {
  const content = report?.content;
  if (!content) {
    return null;
  }
  return content.author || (report.entityType === "people" ? content : null);
}

function peopleAvatarUrl(people) {
  if (people?.avatar && people?.uid) {
    return _service.url(`/asset?uid=${people.uid}&type=avatar&entity=people`);
  }
  return "/images/profile-default.png";
}

function ReportPage({ uid }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loadedUid, setLoadedUid] = useState(uid);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("/images/profile-default.png");
  const [reopening, setReopening] = useState(false);

  const [form] = Form.useForm();
  const actionRef = useRef(null);

  if (uid !== loadedUid) {
    setLoadedUid(uid);
    setPage(1);
    setReopening(false);
  }

  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get("status");
  const navigate = useNavigate();

  const fetchReport = (onDone, currentPage = page) => {
    if (!uid) {
      return;
    }
    _service({
      method: "GET",
      url: "/report",
      data: { reportUid: uid, page: currentPage },
      success: ({ json }) => {
        const data = json?.data || null;
        const nextNotes = data?.resolutionNotes || "";
        setReport(data);
        setTotalCount(data?.pagination?.totalCount ?? 0);
        if (data?.uid !== report?.uid || nextNotes !== (report?.resolutionNotes || "")) {
          form.setFieldsValue({ solution: nextNotes });
        }
        setLoading(false);
        onDone?.();
      },
      fail: (e) => {
        console.log("Service Error", e);
        setReport(null);
        setTotalCount(0);
        setLoading(false);
        onDone?.();
      },
    });
  };

  useEffect(() => {
    setLoading(true);
    fetchReport();
  }, [uid, page]);

  useEffect(() => {
    setAvatarUrl(peopleAvatarUrl(getReportAuthor(report)));
  }, [report]);

  const handleStatusChange = (status, notesRaw = "") => {
    const notes = notesRaw.trim();
    const previousStatus = report?.statusCode;
    const previousNotes = report?.resolutionNotes;

    setUpdating(true);
    setReport((prev) => (prev
      ? { ...prev, statusCode: status, resolutionNotes: notes || prev.resolutionNotes }
      : prev));

    _service({
      method: "PUT",
      url: "/report",
      data: {
        reportUid: uid,
        status,
        ...(notes ? { resolutionNotes: notes } : {}),
      },
      success: () => {
        fetchReport(() => {
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
          setReopening(false);
          setUpdating(false);
        });
      },
      fail: (e) => {
        console.log("Service Error", e);
        setReport((prev) => (prev
          ? { ...prev, statusCode: previousStatus, resolutionNotes: previousNotes }
          : prev));
        globalNotification.error({
          title: "Não foi possível atualizar",
          description: "Tente novamente em instantes.",
        });
        setUpdating(false);
      },
    });
  };

  const handleSaveSolution = (values) => {
    const action = actionRef.current;
    if (!action) {
      return;
    }
    const solution = (values.solution || "")
      .replace(/[^\S\n]+/g, " ")
      .replace(/\n{3,}/g, "\n\n");
    handleStatusChange(action, solution);
  };

  const handleStartReopen = () => {
    form.setFieldsValue({ solution: report?.resolutionNotes || "" });
    setReopening(true);
  };

  const handleCancelReopen = () => {
    form.setFieldsValue({ solution: report?.resolutionNotes || "" });
    setReopening(false);
  };

  if (loading && !report) {
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

  const iconType = TYPE_CONFIG[report.entityType];
  const reportStatus = STATUS_CONFIG[report.statusCode];
  const reportedContent = report.content || {};
  const reportList = report.items || [];
  const reportHistory = report.history || [];
  const author = getReportAuthor(report);
  const isRejected = report.statusCode === "rejected";
  const actionClass = isRejected ? "reject" : "resolve";
  const isTopic = report.entityType === "forum_topic";
  const previewTitle = isTopic ? reportedContent.title : "";
  const previewBody = report.entityType === "people" ? "" : (reportedContent.content || "");
  const showResolvedBy = report.statusCode !== "pending" && report.resolvedBy?.name;
  const isEditing = report.statusCode === "pending" || reopening;

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
              <div className="report-page__icon">{iconType?.icon}</div>
            )}
            <div className="report-page__heading">
              {author?.name && (
                author.username ? (
                  <Link
                    className="report-page__author-link"
                    to={`/u/${author.username}`}
                  >
                    <span className="report-page__author-info">
                      {author.name}
                    </span>
                  </Link>
                ) : (
                  <span className="report-page__author-info">
                    {author.name}
                  </span>
                )
              )}
              {reportedContent.moment && (
                <Text type="secondary" className="report-page__published-at">
                  <TimeAgo sentAt={reportedContent.moment} />
                </Text>
              )}
            </div>
          </div>
          <div className="report-page__container-tag-type">
            <div className="report-page__type">
              {iconType?.icon && (
                <span className="report-page__type-icon">{iconType.icon}</span>
              )}
              <Title level={5} className="report-page__title">
                {report.entityTypeTitle}
              </Title>
            </div>
            <Tag
              icon={reportStatus.icon}
              color={reportStatus.color}
              variant="filled"
              className="report-page__status-tag"
            >
              {reportStatus.label}
            </Tag>
          </div>
        </div>
        {(previewTitle || previewBody || showResolvedBy) && (
          <div className="report-page__preview">
            {previewTitle && (
              <Title level={5}>{previewTitle}</Title>
            )}
            {previewBody && (
              <Paragraph>
                {isTopic ? previewBody : `“${previewBody}”`}
              </Paragraph>
            )}
            {showResolvedBy && (
              <div className="report-page__resolved-info">
                <Text type="secondary" className="report-page__resolved-by">
                  Analisado por {report.resolvedBy.name}
                </Text>
                <Text type="secondary">
                  <TimeAgo sentAt={report.resolvedAt || report.createdAt} />
                </Text>
              </div>
            )}
          </div>
        )}
        <div className="report-page__actions">
          {isEditing ? (
            <Form
              form={form}
              initialValues={{ solution: report.resolutionNotes || "" }}
              onFinish={handleSaveSolution}
              className="report-page__form"
            >
              <Form.Item
                name="solution"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: "Descreva a solução antes de resolver ou recusar a denúncia.",
                  },
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Descreva a solução..."
                  maxLength={500}
                  showCount
                  style={{ resize: "none" }}
                  disabled={updating}
                />
              </Form.Item>
              <div className="report-page__form-footer">
                {reportHistory.length > 0 && (
                  <Button
                    type="link"
                    htmlType="button"
                    className="report-page__history-button"
                    icon={<HistoryOutlined />}
                    onClick={() => setHistoryOpen(true)}
                  >
                    Histórico
                  </Button>
                )}
                <Space>
                  <Button
                    type="dashed"
                    htmlType="submit"
                    className="report-page__action-resolve"
                    icon={<CheckOutlined />}
                    loading={updating}
                    onClick={() => { actionRef.current = "resolved"; }}
                  >
                    Resolvida
                  </Button>
                  <Button
                    type="dashed"
                    htmlType="submit"
                    className="report-page__action-reject"
                    icon={<CloseCircleOutlined />}
                    loading={updating}
                    onClick={() => { actionRef.current = "rejected"; }}
                  >
                    Recusar
                  </Button>
                  {reopening && (
                    <Button
                      type="dashed"
                      color="primary"
                      htmlType="button"
                      className="report-page__action-cancel"
                      disabled={updating}
                      onClick={handleCancelReopen}
                    >
                      Cancelar
                    </Button>
                  )}
                </Space>
              </div>
            </Form>
          ) : (
            <>
              <div className={`report-page__solution report-page__solution--${isRejected ? "rejected" : "resolved"}`}>
                {report.resolutionNotes}
              </div>
              <div className="report-page__solution-actions">
                {reportHistory.length >= 0 && (
                  <Button
                    type="link"
                    className="report-page__history-button"
                    icon={<HistoryOutlined />}
                    onClick={() => setHistoryOpen(true)}
                  >
                    Histórico
                  </Button>
                )}
                <Button
                  type="dashed"
                  className={`report-page__action-${actionClass} report-page__action-${actionClass}--confirmed`}
                  icon={isRejected ? <CloseCircleOutlined /> : <CheckOutlined />}
                  loading={updating}
                  onClick={handleStartReopen}
                >
                  Clique Para Alterar
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
      <HistoryModal
        open={historyOpen}
        history={reportHistory}
        reportStatus={STATUS_CONFIG}
        onClose={() => setHistoryOpen(false)}
      />
      <div className="report-page__count">
        <Text type="secondary">
          {reportList.length} {reportList.length > 1 ? "Denúncias" : "Denúncia"} Encontrada{reportList.length > 1 ? "s" : ""}
        </Text>
      </div>
      <div className="report-page__items">
        {loading ? (
          <div className="report-page__items-loading">
            <Spin />
          </div>
        ) : reportList.length === 0 ? (
          <Empty description="Nenhum registo individual encontrado." />
        ) : (
          reportList.map((item) => (
            <Card key={item.uid} className="report-page__item">
              <div className="report-page__reporter">
                <Avatar
                  className="report-page__avatar"
                  size={50}
                  src={peopleAvatarUrl(item.reporter)}
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
              <div>
                {item.reasonTitle && (
                  <Tag className="report-page__reason" color="error" variant="filled">
                    {item.reasonTitle}
                  </Tag>
                )}
                {item.description && (
                  <Paragraph className="report-page__item-description">
                    {item.description}
                  </Paragraph>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
      {!loading && totalCount > 0 && (
        <div className="report-page__pagination">
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
export default ReportPage;