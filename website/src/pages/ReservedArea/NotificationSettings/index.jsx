import { useEffect, useState } from 'react';
import { Card, Switch, Typography, Spin, Empty } from 'antd';
import _service from '@netuno/service-client';

import ListHeaderFilters from '../../../components/ListHeaderFilters/index.jsx';
import globalNotification from "../../../common/globalNotification.js";

import './index.less';

const { Text } = Typography;

function NotificationSettings() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCode, setLoadingCode] = useState(null);

  const sections = [
    {
      key: 'requests',
      title: 'Pedidos',
      codes: ['friend-request', 'friend-request-accepted'],
    },
    {
      key: 'posts',
      title: 'Postagens',
      codes: ['friend-post', 'institution-post'],
    },
    {
      key: 'comments',
      title: 'Comentários',
      codes: ['institution-comment', 'friend-comment', 'my-post-comment'],
    },
    {
      key: 'likes',
      title: 'Curtidas',
      codes: ['institution-like', 'friend-like', 'my-post-like'],
    },
    {
      key: 'messages',
      title: 'Mensagens',
      codes: ['message'],
    },
  ];

  const labelMap = {
    'institution-post': 'Postagem de alguém da instituição',
    'friend-post': 'Postagem de amigo',
    'institution-comment': 'Comentário de alguém da instituição',
    'institution-like': 'Curtida de alguém da instituição',
    'friend-like': 'Curtida de amigo',
    'my-post-like': 'Curtida em seu post',
  };

  const descMap = {
    'friend-request': 'Recebe uma notificação quando alguém envia um pedido de amizade para você.',
    'friend-request-accepted': 'Recebe quando um pedido de amizade que você enviou foi aceito.',
    'friend-post': 'Recebe quando um dos seus amigos publica uma nova postagem.',
    'institution-post': 'Recebe quando alguém da sua instituição publica uma nova postagem.',
    'friend-comment': 'Recebe quando alguém comenta em publicações de amigos que você acompanha.',
    'institution-comment': 'Recebe quando alguém da sua instituição comenta em publicações relevantes.',
    'my-post-comment': 'Recebe quando alguém comenta em uma das suas postagens.',
    'friend-like': 'Recebe quando um amigo curte uma publicação que você acompanha.',
    'institution-like': 'Recebe quando alguém da sua instituição curte uma publicação que você acompanha.',
    'my-post-like': 'Recebe quando alguém curte uma das suas postagens.',
    'message': 'Recebe quando alguém envia uma mensagem privada para você.'
  };

  const groupedSections = sections.map((section) => ({
    ...section,
    items: types.filter((type) => section.codes.includes(type.code)),
  })).filter((section) => section.items.length > 0);

  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = () => {
    setLoading(true);
    _service({
      url: 'notification/opt_out',
      method: 'GET',
      success: ({ json }) => {
        setTypes(json.data || []);
        setLoading(false);
      },
      fail: (e) => {
        globalNotification.error({
          title: 'Falha ao carregar tipos de notificação.'
        });
        console.error('Service Error', e);
        setLoading(false);
      }
    });
  };

  const onToggle = (code, currentlyBlocked) => {
    setLoadingCode(code);

    _service({
      url: 'notification/opt_out',
      method: currentlyBlocked ? 'DELETE' : 'POST',
      data: { type: code },
      success: () => {
        setTypes(types.map(t =>
          t.code === code ? { ...t, blocked: !currentlyBlocked } : t
        ));
        setLoadingCode(null);
      },
      fail: (e) => {
        globalNotification.error({
          title: 'Falha ao atualizar preferência de notificação.'
        });
        console.error('Service Error', e);
        setLoadingCode(null);
      }
    });
  };

  return (
    <section className="notification-settings-page">
      <div className="notification-settings-page__header">
        <ListHeaderFilters title="Preferências de Notificações" hideInputs={true} />
      </div>

      <Card className="notification-settings-page__card" variant="borderless">
        {loading ? (
          <div className="notification-settings-page__loading">
            <Spin />
          </div>
        ) : types.length === 0 ? (
          <Empty description="Não há tipos de notificação disponíveis." />
        ) : (
          <div className="notification-settings-page__list">
            {groupedSections.map((section) => (
              <div key={section.key} className="notification-settings-page__section">
                <div className="notification-settings-page__section-title">
                  <Text strong>{section.title}</Text>
                </div>
                {section.items.map((type) => (
                  <div key={type.code} className="notification-settings-page__item">
                    <div className="notification-settings-page__item-info">
                      <Text strong>{labelMap[type.code] || type.name}</Text>
                      <Text type="secondary" style={{ fontSize: 13, marginTop: 6 }}>
                        {descMap[type.code] || `Recebe notificações relacionadas: ${type.name.toLowerCase()}.`}
                      </Text>
                    </div>
                    <Switch
                      checked={!type.blocked}
                      loading={loadingCode === type.code}
                      onChange={() => onToggle(type.code, type.blocked)}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </Card>
    </section>
  );
}

export default NotificationSettings;