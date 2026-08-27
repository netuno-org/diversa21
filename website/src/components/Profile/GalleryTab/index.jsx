import React, { useState } from 'react';
import { Typography, Spin, Popconfirm } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { MdOutlineInsertPhoto } from 'react-icons/md';
import _service from '@netuno/service-client';

import GalleryUploadModal from '../GalleryUploadModal';
import { useGalleryPhotos } from '../../../common/useGalleryPhotos.js';

const { Text } = Typography;

function GalleryTab({ userUid, isOwnProfile }) {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const {
    photos,
    maxPhotos,
    loading,
    uploading,
    removingUid,
    uploadPhoto,
    removePhoto,
  } = useGalleryPhotos(userUid);

  return (
    <div className="profile__gallery">
      {maxPhotos > 0 && (
        <div className="profile__gallery-header">
          <Text type="secondary" className="profile__gallery-counter">
            <span className={photos.length >= maxPhotos ? 'profile__gallery-counter--full' : ''}>
              {photos.length}
            </span>
            {' / '}{maxPhotos} fotos
          </Text>
        </div>
      )}

      {loading ? (
        <div className="profile__gallery-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="profile__gallery-skeleton" />
          ))}
        </div>
      ) : photos.length === 0 && !isOwnProfile ? (
        <div className="profile__gallery-empty">
          <MdOutlineInsertPhoto className="profile__gallery-empty-icon" />
          <Text type="secondary">Ainda sem fotos na galeria.</Text>
        </div>
      ) : (
        <div className="profile__gallery-grid">
          {isOwnProfile && photos.length < maxPhotos && (
            <button
              type="button"
              className="profile__gallery-add"
              onClick={() => setUploadModalOpen(true)}
              aria-label="Adicionar foto à galeria"
            >
              <MdOutlineInsertPhoto className="profile__gallery-add-icon" />
              <span>Adicionar foto</span>
            </button>
          )}

          {photos.map((p) => (
            <div key={p.uid} className="profile__gallery-item">
              <img
                src={_service.url(`/asset?uid=${p.uid}&type=photo&entity=people_photo&photo=${p.photo}`)}
                alt="Foto de Galeria"
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
                    className="profile__gallery-remove"
                    disabled={removingUid === p.uid}
                    aria-label="Remover foto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {removingUid === p.uid ? <Spin size="small" /> : <CloseOutlined />}
                  </button>
                </Popconfirm>
              )}
            </div>
          ))}

          {photos.length === 0 && isOwnProfile && (
            <div className="profile__gallery-empty profile__gallery-empty--inline">
              <Text type="secondary">Adicione a primeira foto à sua galeria.</Text>
            </div>
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

export default GalleryTab;