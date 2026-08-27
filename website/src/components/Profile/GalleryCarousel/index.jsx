import React, { useRef, useState, useEffect } from 'react';
import { Typography, Button, Spin, Popconfirm } from 'antd';
import {
  LeftOutlined,
  RightOutlined,
  CloseOutlined,
  PlusOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { MdOutlineInsertPhoto } from 'react-icons/md';
import _service from '@netuno/service-client';

import GalleryUploadModal from '../GalleryUploadModal';
import { useGalleryPhotos } from '../../../common/useGalleryPhotos.js';
import './index.less';

const { Title, Text } = Typography;

function GalleryCarousel({ userUid, isOwnProfile, title = "Fotos", onViewMore }) {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  const {
    photos,
    maxPhotos,
    loading,
    uploading,
    removingUid,
    uploadPhoto,
    removePhoto,
  } = useGalleryPhotos(userUid);

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const overflow = scrollWidth > clientWidth;
    setHasOverflow(overflow);
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [photos]);

  const handleScroll = (direction) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = direction === 'left' ? -200 : 200;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  if (!isOwnProfile && photos.length === 0 && !loading) {
    return null;
  }

  return (
    <div className="profile-carousel">
      <div className="profile-carousel__header">
        <div className="profile-carousel__title-wrapper">
          <Title level={5} className="profile-carousel__title">
            {title}
          </Title>
          {photos.length > 0 && (
            <Text type="secondary" className="profile-carousel__count">
              ({photos.length})
            </Text>
          )}
        </div>

        <div className="profile-carousel__controls">
          {isOwnProfile && (
            <Button
              size="small"
              type="dashed"
              className="profile-carousel__add-btn"
              icon={<PlusOutlined />}
              onClick={() => setUploadModalOpen(true)}
              disabled={photos.length >= maxPhotos}
            >
              Adicionar
            </Button>
          )}

          {onViewMore && photos.length > 0 && (
            <Button
              type="link"
              size="small"
              className="profile-carousel__view-more-btn"
              onClick={onViewMore}
            >
              Ver mais <ArrowRightOutlined />
            </Button>
          )}

          {hasOverflow && (
            <div className="profile-carousel__arrows">
              <Button
                shape="circle"
                size="small"
                icon={<LeftOutlined />}
                disabled={!canScrollLeft}
                onClick={() => handleScroll('left')}
              />
              <Button
                shape="circle"
                size="small"
                icon={<RightOutlined />}
                disabled={!canScrollRight}
                onClick={() => handleScroll('right')}
              />
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="profile-carousel__loading">
          <Spin size="small" />
        </div>
      ) : photos.length === 0 ? (
        <div className="profile-carousel__empty">
          <MdOutlineInsertPhoto className="profile-carousel__empty-icon" />
          <Text type="secondary">Nenhuma foto adicionada.</Text>
        </div>
      ) : (
        <div
          className="profile-carousel__track"
          ref={scrollContainerRef}
          onScroll={checkScroll}
        >
          {photos.map((p) => (
            <div key={p.uid} className="profile-carousel__item">
              <img
                src={_service.url(`/asset?uid=${p.uid}&type=photo&entity=people_photo&photo=${p.photo}`)}
                alt="Foto"
              />
              {isOwnProfile && (
                <Popconfirm
                  title="Remover esta foto?"
                  onConfirm={() => removePhoto(p.uid)}
                  okText="Sim"
                  cancelText="Não"
                >
                  <button
                    type="button"
                    className="profile-carousel__remove-btn"
                    disabled={removingUid === p.uid}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {removingUid === p.uid ? <Spin size="small" /> : <CloseOutlined />}
                  </button>
                </Popconfirm>
              )}
            </div>
          ))}

          {onViewMore && photos.length > 5 && (
            <button
              type="button"
              className="profile-carousel__more-card"
              onClick={onViewMore}
              aria-label="Ver todas as fotos"
            >
              <ArrowRightOutlined className="profile-carousel__more-icon" />
              <span>Ver mais</span>
            </button>
          )}
        </div>
      )}

      {isOwnProfile && (
        <GalleryUploadModal
          open={uploadModalOpen}
          uploading={uploading}
          onCancel={() => setUploadModalOpen(false)}
          onUpload={(file) => uploadPhoto(file, () => setUploadModalOpen(false))}
        />
      )}
    </div>
  );
}

export default GalleryCarousel;