import { Avatar, Typography } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';

import _service from '@netuno/service-client';

import './index.less';

const { Paragraph } = Typography;

function InstitutionDisplay({ institution, avatarStyle, children }) {
  if (!institution) return null;

  const avatarUrl = institution.avatar
    ? _service.url(`/asset?uid=${institution.uid}&type=avatar&entity=institution`)
    : null;

  const location = [
    institution.city?.name,
    institution.state?.name,
    institution.country?.name
  ].filter(Boolean).join(', ');

  return (
    <div className="institution-display">
      <Avatar
        style={{ backgroundColor: avatarUrl ? '#fff' : '#8A6AA2', ...avatarStyle }}
        src={avatarUrl}
        shape="square"
      >
        {!avatarUrl && institution.name?.[0]}
      </Avatar>

      <div className="institution-display-content" style={{ minWidth: 0, flex: 1 }}>
        <div>
          <strong>{institution.name}</strong>
        </div>

        {location && (
          <div>
            <EnvironmentOutlined /> {location}
          </div>
        )}

        {institution.description && (
          <Paragraph
            type="secondary"
            ellipsis={{ rows: 2, tooltip: true }}
            style={{ marginBottom: 0, fontSize: 13 }}
          >
            {institution.description}
          </Paragraph>
        )}
        {children}
      </div>
    </div>
  );
}

export default InstitutionDisplay;
