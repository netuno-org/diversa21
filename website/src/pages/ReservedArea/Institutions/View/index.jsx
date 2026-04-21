import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Typography, Card, Spin, Breadcrumb, Button, Row, Col,
  Divider, Avatar, Space, Empty, message
} from "antd";
import {
  ArrowLeftOutlined, EditOutlined, MailOutlined,
  PhoneOutlined, EnvironmentOutlined, GlobalOutlined
} from '@ant-design/icons';
import _service from '@netuno/service-client';
import { connect } from 'react-redux';
import "./index.less";

const { Title, Text, Paragraph } = Typography;

function InstitutionView({ loggedUserInfo }) {
  const navigate = useNavigate();
  const { uid } = useParams();
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (uid) {
      setLoading(true);
      _service({
        url: `/institution?uid=${uid}`,
        method: 'GET',
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
  }, [uid]);

  const handleEdit = () => {
    navigate(`/institutions/${uid}/edit`);
  };

  if (loading) {
    return (
      <div className="institution-view">
        <div className="loading-wrapper">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (error || !institution) {
    return (
      <div className="institution-view">
        <div className="error-wrapper">
          <Empty description={error || "Instituição não encontrada."} />
          <Button type="primary" onClick={() => navigate('/institutions')}>
            Voltar à listagem
          </Button>
        </div>
      </div>
    );
  }

  return (
    <section className="institution-view">
      <div className="view-header">
        <Button
          className="go-back-btn"
          type="link"
          onClick={() => navigate('/institutions')}
        >
          <ArrowLeftOutlined /> Voltar às instituições
        </Button>
      </div>

      <Breadcrumb
        items={[
          { title: <a onClick={() => navigate('/institutions')}>Instituições</a> },
          { title: institution.name }
        ]}
        className="breadcrumb"
      />

      <div className="cover-image">
        {institution.cover_image ? (
          <img src={institution.cover_image} alt="Cover" />
        ) : (
          <div className="cover-placeholder" />
        )}
      </div>

      <div className="content-wrapper">
        <Row gutter={[32, 24]}>
          <Col xs={24} lg={8}>
            <Card className="sidebar-card">
              <div className="logo-section">
                {institution.logo ? (
                  <Avatar src={institution.logo} size={120} shape="square" />
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

              <Title level={2} className="institution-name">
                {institution.name}
              </Title>

              <Space orientation="vertical" size={4} className="location-info">
                {(institution.city || institution.country) && (
                  <Text type="secondary">
                    <EnvironmentOutlined /> {institution.city}{institution.city && institution.country && ', '}{institution.country}
                  </Text>
                )}
                {institution.state && (
                  <Text type="secondary">{institution.state}</Text>
                )}
              </Space>

              <Divider />

              <Button
                type="primary"
                icon={<EditOutlined />}
                block
                onClick={handleEdit}
              >
                Editar Instituição
              </Button>
            </Card>
          </Col>

          <Col xs={24} lg={16}>
            <Card className="details-card">
              <Title level={3}>Sobre</Title>
              <Paragraph>
                {institution.description || 'Sem descrição disponível.'}
              </Paragraph>

              <Divider titlePlacement="left">Informações de Contacto</Divider>

              <div className="contact-info">
                {institution.email && (
                  <div className="contact-item">
                    <MailOutlined />
                    <div className="contact-details">
                      <Text type="secondary">E-mail</Text>
                      <a href={`mailto:${institution.email}`}>{institution.email}</a>
                    </div>
                  </div>
                )}

                {institution.telephone && (
                  <div className="contact-item">
                    <PhoneOutlined />
                    <div className="contact-details">
                      <Text type="secondary">Telefone</Text>
                      <a href={`tel:${institution.telephone}`}>{institution.telephone}</a>
                    </div>
                  </div>
                )}

                {(institution.address || institution.post_code) && (
                  <div className="contact-item">
                    <EnvironmentOutlined />
                    <div className="contact-details">
                      <Text type="secondary">Morada</Text>
                      <Text>
                        {institution.address}
                        {institution.address && institution.post_code && ', '}
                        {institution.post_code}
                      </Text>
                    </div>
                  </div>
                )}

                {institution.website && (
                  <div className="contact-item">
                    <GlobalOutlined />
                    <div className="contact-details">
                      <Text type="secondary">Website</Text>
                      {institution.website ? (
                        <a
                          href={institution.website}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {institution.website}
                        </a>
                      ) : (
                        <Text type="secondary">Website indisponível</Text>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {(!institution.email && !institution.telephone &&
                !institution.address && !institution.website) && (
                  <Text type="secondary">Sem informações de contacto disponíveis.</Text>
                )}
            </Card>
          </Col>
        </Row>
      </div>
    </section>
  );
}

const mapStateToProps = store => {
  const { loggedUserInfoState } = store;
  return {
    loggedUserInfo: loggedUserInfoState.loggedUserInfo
  };
};

export default connect(mapStateToProps)(InstitutionView);
