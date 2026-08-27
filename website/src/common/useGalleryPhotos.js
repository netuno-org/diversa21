import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import _service from '@netuno/service-client';

export function useGalleryPhotos(userUid) {
  const [photos, setPhotos] = useState([]);
  const [maxPhotos, setMaxPhotos] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removingUid, setRemovingUid] = useState(null);

  const fetchPhotos = useCallback(() => {
    if (!userUid) return;
    setLoading(true);
    _service({
      method: "GET",
      url: `/people/photo?uid=${userUid}`,
      success: ({ json }) => {
        if (json?.result) {
          setPhotos(json.data?.items || []);
          setMaxPhotos(json.data?.maxGalleryPhotos || 0);
        }
        setLoading(false);
      },
      fail: (err) => {
        console.error("Erro ao carregar fotos da galeria:", err);
        setLoading(false);
      }
    });
  }, [userUid]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const uploadPhoto = (file, onSuccess) => {
    const formData = new FormData();
    formData.append("photo", file);

    setUploading(true);
    _service({
      method: "POST",
      url: "/people/me/photo",
      data: formData,
      success: ({ json }) => {
        setUploading(false);
        if (json?.result) {
          if (onSuccess) onSuccess();
          fetchPhotos();
        } else {
          message.error("Não foi possível adicionar a foto.");
        }
      },
      fail: (err) => {
        console.error("Erro ao adicionar foto:", err);
        setUploading(false);
        message.error("Não foi possível adicionar a foto.");
      }
    });
  };

  const removePhoto = (photoUid) => {
    setRemovingUid(photoUid);
    _service({
      method: "DELETE",
      url: `/people/me/photo?uid=${photoUid}`,
      success: ({ json }) => {
        setRemovingUid(null);
        if (json?.result) {
          setPhotos((prev) => prev.filter((p) => p.uid !== photoUid));
        } else {
          message.error("Não foi possível remover a foto.");
        }
      },
      fail: (err) => {
        console.error("Erro ao remover foto:", err);
        setRemovingUid(null);
        message.error("Não foi possível remover a foto.");
      }
    });
  };

  return {
    photos,
    maxPhotos,
    loading,
    uploading,
    removingUid,
    fetchPhotos,
    uploadPhoto,
    removePhoto,
  };
}