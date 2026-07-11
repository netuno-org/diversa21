import { useState, useCallback } from 'react';
import { notification } from 'antd';
import _service from '@netuno/service-client';

const ACTION_CONFIG = {
  send: {
    method: "POST",
    successMessage: "Solicitação enviada",
    successDescription: "A solicitação de amizade foi enviada com sucesso.",
    errorMessage: "Erro ao enviar solicitação",
    errorDescription: "Não foi possível enviar a solicitação de amizade.",
  },
  cancel: {
    method: "DELETE",
    successMessage: "Solicitação cancelada",
    successDescription: "A solicitação de amizade foi cancelada com sucesso.",
    errorMessage: "Erro ao cancelar solicitação",
    errorDescription: "Não foi possível cancelar a solicitação de amizade.",
  },
  accept: {
    method: "PUT",
    successMessage: "Pedido aceito",
    successDescription: "O pedido de amizade foi aceito com sucesso.",
    errorMessage: "Erro ao aceitar pedido",
    errorDescription: "Não foi possível aceitar o pedido de amizade.",
  },
  reject: {
    method: "DELETE",
    successMessage: "Pedido recusado",
    successDescription: "O pedido de amizade foi recusado com sucesso.",
    errorMessage: "Erro ao recusar pedido",
    errorDescription: "Não foi possível recusar o pedido de amizade.",
  },
  remove: {
    method: "DELETE",
    successMessage: "Amizade desfeita",
    successDescription: "Você não está mais conectado com este usuário.",
    errorMessage: "Erro ao desfazer amizade",
    errorDescription: "Não foi possível desfazer a amizade.",
  },
};

function useFriendActions() {
  const [processing, setProcessing] = useState({});

  const run = useCallback((action, uid, { onSuccess, onError, silent = false } = {}) => {
    const config = ACTION_CONFIG[action];
    if (!config || !uid) {
      return;
    }

    setProcessing(prev => ({ ...prev, [uid]: action }));

    _service({
      method: config.method,
      url: "/friend",
      data: { uid },
      success: (response) => {
        setProcessing(prev => ({ ...prev, [uid]: null }));
        if (!silent) {
          notification.success({
            message: config.successMessage,
            description: config.successDescription,
          });
        }
        onSuccess && onSuccess(response);
      },
      fail: (error) => {
        console.error(error);
        setProcessing(prev => ({ ...prev, [uid]: null }));
        if (!silent) {
          notification.error({
            message: config.errorMessage,
            description: config.errorDescription,
          });
        }
        onError && onError(error);
      },
    });
  }, []);

  const isProcessing = useCallback((uid, action) =>
    action ? processing[uid] === action : !!processing[uid],
    [processing]);

  const isAnyProcessing = useCallback(() =>
    Object.values(processing).some(Boolean),
    [processing]);

  return { run, isProcessing, isAnyProcessing };
}

export default useFriendActions;