import React from 'react';
import { Card, Typography, Tooltip, Tag, Button, Popconfirm } from 'antd';
import { EnvironmentOutlined, CalendarOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { FaBookmark, FaRegBookmark } from 'react-icons/fa';

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
        <div className="services-list__card-header">
          <Title level={4} className="services-list__title">
            {service.name}
          </Title>
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
          {canCreateService && (
            <>
              <Button type="text" size="small" className="services-list__action-btn" onClick={(e) => onEditClick(service, e)}>
                <EditOutlined />
              </Button>
              <Popconfirm
                title="Remover serviço?"
                description="Esta ação é irreversível"
                onConfirm={(e) => onDeleteService(service.uid, e)}
                okText="Sim"
                cancelText="Não"
              >
                <Button danger type="text" size="small" className="services-list__action-btn">
                  <DeleteOutlined />
                </Button>
              </Popconfirm>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}