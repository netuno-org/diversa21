import React from 'react';
import { Button, Popconfirm } from 'antd';
import {
  ClockCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { FaUserPlus } from "react-icons/fa";
import { LuUserCheck } from "react-icons/lu";

import ContentActions from "../../ContentActions";

const FRIENDSHIP_MAP = {
  none: { label: "Adicionar amigo", action: "request" },
  pending: { label: "Cancelar pedido", action: "cancel", title: "Deseja cancelar o pedido de amizade?" },
  received: { label: "Aceitar", action: "accept", title: "Deseja aceitar o pedido de amizade?" },
  friends: { label: "Amigos", action: "remove", title: "Deseja desfazer a amizade?" },
};

function ProfileHeaderActions({
  user,
  isOwnProfile,
  canEditProfile,
  friendStatus,
  canRequestFriend,
  isLoading,
  isProcessing,
  onEdit,
  onFriendAction,
  onRejectFriendRequest,
  onOpenMessages,
}) {
  const currentFriendship = FRIENDSHIP_MAP[friendStatus];
  const canShowFriendButton = !isOwnProfile && currentFriendship && (canRequestFriend || friendStatus !== "none");
  const canShowMessageButton = !isOwnProfile && friendStatus === "friends";

  const getFriendButtonIcon = () => {
    switch (friendStatus) {
      case "none": return <FaUserPlus size={19} />;
      case "pending": return <ClockCircleOutlined />;
      case "received": return <CheckOutlined />;
      case "friends": return <LuUserCheck size={19} />;
      default: return undefined;
    }
  };

  return (
    <div className="profile__actions">
      <div className="profile__action-buttons">
        {canShowFriendButton && (
          friendStatus === "none" ? (
            <Button
              type="primary"
              className="profile__edit-btn"
              icon={getFriendButtonIcon()}
              onClick={() => onFriendAction(currentFriendship.action)}
              loading={isProcessing(user.uid, "send")}
            >
              {currentFriendship.label}
            </Button>
          ) : (
            <Popconfirm
              title={currentFriendship.title}
              onConfirm={() => onFriendAction(currentFriendship.action)}
              okText="Sim"
              cancelText="Não"
            >
              <Button
                type="primary"
                className={`profile__edit-btn ${friendStatus === "friends" || friendStatus === "pending" ? "profile__secondary-btn" : ""}`}
                icon={getFriendButtonIcon()}
                disabled={isLoading}
                loading={isProcessing(user.uid, currentFriendship?.action)}
              >
                {currentFriendship.label}
              </Button>
            </Popconfirm>
          )
        )}

        {friendStatus === "received" && (
          <Popconfirm
            title="Deseja recusar o pedido de amizade?"
            onConfirm={onRejectFriendRequest}
            okText="Sim"
            cancelText="Não"
          >
            <Button
              type="primary"
              className="profile__secondary-btn"
              icon={<CloseOutlined />}
              disabled={isLoading}
              loading={isProcessing(user.uid, "reject")}
            >
              Recusar
            </Button>
          </Popconfirm>
        )}

        {canShowMessageButton && (
          <Button
            type="primary"
            className="profile__edit-btn"
            disabled={isLoading}
            onClick={() => onOpenMessages(user)}
            icon={<MessageOutlined />}
          >
            Mensagem
          </Button>
        )}
        <ContentActions
          className="profile__content-actions"
          entityType="people"
          entityUid={user.uid}
          canViewEditButton={canEditProfile}
          canViewDeletePostButton={false}
          canViewReportButton={!isOwnProfile}
          editLabel="Editar perfil"
          reportLabel="Denunciar perfil"
          onEdit={onEdit}
        />

      </div>

      {friendStatus === "received" && (
        <div className="profile__friend-request-text">
          Deseja aceitar o pedido de amizade de
          <span className="profile__friend-request-text__name">
            {` ${user.name}`}
          </span>
          ?
        </div>
      )}
    </div>
  );
}

export default ProfileHeaderActions;