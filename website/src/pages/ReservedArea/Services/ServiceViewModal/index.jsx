import React from 'react';
import { Modal, Typography, Tooltip, Tag, Button } from 'antd';
import { EnvironmentOutlined, CalendarOutlined, PhoneOutlined, LinkOutlined, InstagramOutlined } from '@ant-design/icons';

const { Paragraph, Text } = Typography;

export default function ServiceViewModal({
  serviceDetails,
  categories,
  onClose,
  formatDate
}) {
  return (
    <Modal
      title={serviceDetails ? serviceDetails.name : ""}
      open={!!serviceDetails}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Fechar
        </Button>,
      ]}
      destroyOnHidden
    >
      {serviceDetails && (
        <div className="services-list__details">
          <div className="services-list__card-subheader">
            {serviceDetails.category?.name && (
              <Tooltip title={categories.find((c) => c.uid === serviceDetails.category.uid)?.description}>
                <Tag className="services-list__category-tag">{serviceDetails.category.name}</Tag>
              </Tooltip>
            )}
            <div className="services-list__card-location">
              <EnvironmentOutlined />
              <Text className="services-list__info-text">
                {serviceDetails.city?.name}, {serviceDetails.state?.name} / {serviceDetails.country?.name}
              </Text>
            </div>
          </div>
          {serviceDetails.description && (
            <Paragraph className="services-list__description">{serviceDetails.description}</Paragraph>
          )}
          <div className="services-list__card-meta">
            {serviceDetails.phone && (
              <div className="services-list__meta-item">
                <PhoneOutlined /> <a href={`tel:${serviceDetails.phone}`}>{serviceDetails.phone}</a>
              </div>
            )}
            {serviceDetails.website && (
              <div className="services-list__meta-item">
                <LinkOutlined />{" "}
                <a
                  href={serviceDetails.website.startsWith("http") ? serviceDetails.website : `https://${serviceDetails.website}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {serviceDetails.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
            {serviceDetails.instagram && (
              <div className="services-list__meta-item">
                <InstagramOutlined />{" "}
                <a
                  href={`https://instagram.com/${serviceDetails.instagram.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  @{serviceDetails.instagram.replace(/^@/, "")}
                </a>
              </div>
            )}
          </div>
          {serviceDetails.createdAt && (
            <div className="services-list__card-footer-actions">
              <div className="services-list__card-date">
                <CalendarOutlined />
                <Text className="services-list__info-text">
                  {formatDate(serviceDetails.createdAt)}
                </Text>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}