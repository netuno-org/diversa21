import { Avatar } from 'antd';
import {
  EnvironmentOutlined,
  GlobalOutlined,
  MailOutlined,
  PhoneOutlined
} from '@ant-design/icons';

import _service from '@netuno/service-client';

import './index.less';

function InstitutionDisplay({ institution, avatarStyle, children }) {
  if (!institution) return null;

  const avatarUrl = institution.logo
    ? _service.url(`/institution/logo?uid=${institution.uid}`)
    : null;

  const location = [
    institution.city?.name,
    institution.state?.name,
    institution.country?.name
  ].filter(Boolean).join(', ');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      
      <Avatar
        style={{ backgroundColor: '#8A6AA2', ...avatarStyle }}
        src={avatarUrl}
        shape="square"
      >
        {!avatarUrl && institution.name?.[0]}
      </Avatar>

      <div className="user-profile-display-content">

        <div>
          <strong>{institution.name}</strong>
        </div>

        {institution.email && (
          <div>
            <MailOutlined /> {institution.email}
          </div>
        )}

        {institution.telephone && (
          <div>
            <PhoneOutlined /> {institution.telephone}
          </div>
        )}

        {location && (
          <div>
            <EnvironmentOutlined /> {location}
          </div>
        )}

        {institution.website && (
          <div>
            <GlobalOutlined /> {institution.website}
          </div>
        )}

        {children}

      </div>
    </div>
  );
}

export default InstitutionDisplay;