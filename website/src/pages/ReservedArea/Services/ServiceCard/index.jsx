import React from 'react';
import { Card, Typography, Tooltip, Tag, Button } from 'antd';
import { EnvironmentOutlined, CalendarOutlined } from '@ant-design/icons';
import { FaBookmark, FaRegBookmark } from 'react-icons/fa';

import ContentActions from '../../../../components/ContentActions';

const { Title, Paragraph, Text } = Typography;

export default function ServiceCard({
  service,
  categories,
  canCreateService,
  formatDate,
  onOpenService,
  onToggleFavorite,
  onEditClick,
  onDeleteService
}) {
  return (
    <Card className="services-list__card" hoverable onClick={() => onOpenService(service)}>
      <div className="services-list__card-content">
        
        <div className="services-list__card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Title level={4} className="services-list__title" style={{ flex: 1 }}>
            {service.name}
          </Title>
          <div onClick={(e) => e.stopPropagation()} style={{ marginLeft: 8 }}>
            <ContentActions
              entityType="service"
              entityUid={service.uid}
              canViewDeletePostButton={canCreateService}
              canViewEditButton={canCreateService}
              canViewReportButton={false}
              onEdit={() => onEditClick(service)}
              onDeletePost={() => onDeleteService(service.uid)}
            />
          </div>
        </div>

        <div className="services-list__card-subheader">
          {service.category?.name && (
            <Tooltip title={categories.find((c) => c.uid === service.category.uid)?.description}>
              <Tag className="services-list__category-tag">{service.category.name}</Tag>
            </Tooltip>
          )}
          <div className="services-list__card-location">
            <EnvironmentOutlined />
            <Text className="services-list__info-text">
              {service.city?.name}, {service.state?.name}
            </Text>
          </div>
        </div>

        {service.description && (
          <Paragraph className="services-list__description" ellipsis={{ rows: 3 }}>
            {service.description}
          </Paragraph>
        )}
      </div>

      <Button
        className="services-list__view-more-btn"
        type="default"
        block
        onClick={(e) => {
          e.stopPropagation();
          onOpenService(service);
        }}
      >
        Ver mais
      </Button>

      <div className="services-list__card-footer-actions">
        <div className="services-list__card-date">
          {service.createdAt && (
            <>
              <CalendarOutlined />
              <Text className="services-list__info-text">
                {formatDate(service.createdAt)}
              </Text>
            </>
          )}
        </div>

        <div className="services-list__card-actions" onClick={(e) => e.stopPropagation()}>
          <Tooltip title={service.isFavorite ? "Remover dos favoritos." : "Adicionar aos favoritos."}>
            <Button
              type="text"
              size="small"
              icon={
                service.isFavorite ? (
                  <FaBookmark className="services-list__bookmark-filled" />
                ) : (
                  <FaRegBookmark className="services-list__bookmark-outlined" />
                )
              }
              onClick={(e) => onToggleFavorite(service, e)}
              className="services-list__favorite-btn"
            />
          </Tooltip>
        </div>
      </div>
    </Card>
  );
}