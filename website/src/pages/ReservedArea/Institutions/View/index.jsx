import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Typography, Card, Spin, Button, Divider, Avatar, Space, Empty, Pagination, Tabs
} from "antd";
import {
  EditOutlined, MailOutlined, TeamOutlined,
  PhoneOutlined, EnvironmentOutlined, GlobalOutlined
} from '@ant-design/icons';
import _service from '@netuno/service-client';

import UserProfileDisplay from '../../../../components/UserProfileDisplay';
import ActivityList from "../../../../components/Activity/List";
import usePeople from "../../../../common/usePeople.js";

import "./index.less";

const { Title, Text, Paragraph } = Typography;

function View() {
  const navigate = useNavigate();
  const loggedUser = usePeople();
  const { slug } = useParams();
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersPagination, setUsersPagination] = useState({ current: 1, total: 0 });

  useEffect(() => {
    if (slug) {
      setLoading(true);
      _service({
        method: 'GET',
        url: `/institution`,
        data: { slug },
        success: ({ json }) => {
          if (json.data) {
            setInstitution(json.data);
          } else {
            setError('Instituição não encontrada.');
          }
          setLoading(false);
        },
        fail: () => {
          setError('Não foi possível carregar os dados da instituição.');
          setLoading(false);
        }
      });
    }
  }, [slug]);

  useEffect(() => {
    if (institution?.uid) fetchUsers(1);
  }, [institution]);

  const fetchUsers = (page) => {
    setUsersLoading(true);
    _service({
      method: 'GET',
      url: '/institution/people/list',
      data: { uid: institution.uid, page },
      success: ({ json }) => {
        setUsers(json.data.items);
        setUsersPagination({ current: page, total: json.data.pagination.totalCount });
        setUsersLoading(false);
      },
      fail: () => {
        setUsers([]);
        setUsersLoading(false);
      }
    });
  };

  const handleEdit = () => navigate(`/institutions/${slug}/edit`);

  const canEditInstitution = loggedUser.canManageInstitution(institution?.uid);

  if (loading) {
    return (
      <div className="institution-view">
        <div className="institution-view__loading">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (error || !institution) {
    return (
      <div className="institution-view">
        <div className="institution-view__error">
          <Empty description={error || "Instituição não encontrada."} />
          {canEditInstitution &&
            <Button type="primary" onClick={() => navigate('/institutions')}>
              Voltar à listagem
            </Button>
          }
        </div>
      </div>
    );
  }

  const membersTab = (
    <div className="institution-view__tabs-content">
      {usersLoading ? (
        <div className="institution-view__users-loading">
          <Spin size="large" />
        </div>
      ) : users.length > 0 ? (
        <>
          <div className="institution-view__users-list">
            {users.map((user) => (
              <Card key={user.uid} className="institution-view__users-card">
                <div className="institution-view__users-card-content">
                  <div className="institution-view__users-card-info">
                    <Link to={`/u/${user.username}`} style={{ color: "inherit" }}>
                      <UserProfileDisplay
                        user={user}
                        avatarStyle={{ width: 64, height: 64 }}
                      />
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {usersPagination.total > 10 && (
            <Pagination
              className="institution-view__users-pagination"
              align="center"
              total={usersPagination.total}
              current={usersPagination.current}
              pageSize={10}
              onChange={fetchUsers}
            />
          )}
        </>
      ) : (
        <div className="institution-view__users-empty">
          <Empty description="Nenhum membro encontrado nesta instituição." />
        </div>
      )}
    </div>
  );

  const membersCount = usersLoading ? '' : ` (${usersPagination.total})`;

  return (
    <section className="institution-view">
      <div className="institution-view__cover">
        {institution.cover_image ? (
          <img
            src={_service.url(`/asset?uid=${institution.uid}&type=cover_image&entity=institution`)}
            alt="Capa da Instituição"
            className="institution-view__cover-image"
          />
        ) : (
          <div className="institution-view__cover-placeholder" />
        )}
      </div>

      <Card className="institution-view__card">
        <div className="institution-view__header">
          <div className="institution-view__avatar">
            {institution.avatar ? (
              <Avatar
                src={_service.url(`/asset?uid=${institution.uid}&type=avatar&entity=institution`)}
                size={120}
                shape="square"
                style={{ backgroundColor: '#fff' }}
              />
            ) : (
              <Avatar
                size={120}
                shape="square"
                style={{ backgroundColor: '#8A6AA2', fontSize: 48 }}
              >
                {institution.name?.[0]}
              </Avatar>
            )}
          </div>
          <div className="institution-view__actions">
            {canEditInstitution && (
              <div className="institution-view__action-buttons">
                <Button
                  type="primary"
                  className="institution-view__edit-btn"
                  icon={<EditOutlined />}
                  onClick={handleEdit}
                >
                  Editar Instituição
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="institution-view__info">
          <Title level={2} className="institution-view__name">
            {institution.name}
          </Title>

          <Space size="large" className="institution-view__details" wrap>
            {(institution.city?.name || institution.country?.name || institution.state?.name) && (
              <div className="institution-view__detail-item">
                <EnvironmentOutlined />
                <Text type="secondary">
                  {institution.city?.name}{institution.city?.name && (institution.state?.name || institution.country?.name) && ', '}
                  {institution.state?.name || institution.country?.name}
                </Text>
              </div>
            )}

            {(institution.address || institution.post_code) && (
              <div className="institution-view__detail-item">
                <EnvironmentOutlined />
                <Text type="secondary">
                  {institution.address}
                  {institution.address && institution.post_code && ', '}
                  {institution.post_code}
                </Text>
              </div>
            )}

            {institution.email && (
              <div className="institution-view__detail-item">
                <MailOutlined />
                <a href={`mailto:${institution.email}`} className="institution-view__detail-link">{institution.email}</a>
              </div>
            )}

            {institution.telephone && (
              <div className="institution-view__detail-item">
                <PhoneOutlined />
                <a href={`tel:${institution.telephone}`} className="institution-view__detail-link">{institution.telephone}</a>
              </div>
            )}

            {institution.website && (
              <div className="institution-view__detail-item">
                <GlobalOutlined />
                <a
                  href={institution.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="institution-view__detail-link"
                >
                  Website
                </a>
              </div>
            )}
          </Space>
        </div>

        <Divider />

        <div className="institution-view__about">
          <Title level={4}>Sobre</Title>
          <Paragraph className="institution-view__about-text">
            {institution.description || 'Esta instituição ainda não adicionou uma descrição.'}
          </Paragraph>
        </div>
      </Card>

      <div className="institution-view__tabs">
        <Tabs
          defaultActiveKey="members"
          size="large"
          items={[
            {
              key: 'members',
              label: (
                <Space>
                  <TeamOutlined style={{ fontSize: 18 }} />
                  <span>{`Membros${membersCount}`}</span>
                </Space>
              ),
              children: membersTab
            },
            {
              key: 'activity',
              label: 'Atividade',
              children: (
                <div className="institution-view__tabs-content">
                  <ActivityList institution={institution.uid} onLoaded={() => { }} onItemRemoved={() => { }} />
                </div>
              )
            }
          ]}
        />
      </div>
    </section>
  );
}

export default View;