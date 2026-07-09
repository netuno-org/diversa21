import { useEffect, useState } from 'react';
import { Card, Switch, Typography, Spin, notification, Empty } from 'antd';
import _service from '@netuno/service-client';

import ListHeaderFilters from '../../../components/ListHeaderFilters/index.jsx';

import './index.less';

const { Text } = Typography;

function NotificationSettings() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCode, setLoadingCode] = useState(null);

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
        notification.error({ message: 'Falha ao carregar tipos de notificação.' });
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
        notification.error({ message: 'Falha ao atualizar preferência de notificação.' });
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
            {types.map((type) => (
              <div key={type.code} className="notification-settings-page__item">
                <div className="notification-settings-page__item-info">
                  <Text strong>{type.name}</Text>
                </div>
                <Switch
                  checked={!type.blocked}
                  loading={loadingCode === type.code}
                  onChange={() => onToggle(type.code, type.blocked)}
                />
              </div>
            ))}
          </div>
        )}
      </Card>
    </section>
  );
}

export default NotificationSettings;