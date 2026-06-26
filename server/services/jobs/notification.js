import { _db } from "@netuno/server-types"

// _log.info("Job de notificações")

const friendRequestNotificationTypeId = _db.queryFirst(`
    SELECT id
    FROM notification_type
    WHERE code = 'friend-request'
`).getInt("id");

const friendRequestAcceptedNotificationTypeId = _db.queryFirst(`
    SELECT id
    FROM notification_type
    WHERE code = 'friend-request-accepted'
`).getInt("id");

const friendPostNotificationTypeId = _db.queryFirst(`
    SELECT id
    FROM notification_type
    WHERE code = 'friend-post'
`).getInt("id");

const friendLikeNotificationTypeId = _db.queryFirst(`
    SELECT id
    FROM notification_type
    WHERE code = 'friend-like'
`).getInt("id");

const friendCommentNotificationTypeId = _db.queryFirst(`
    SELECT id
    FROM notification_type
    WHERE code = 'friend-comment'
`).getInt("id");

const institutionPostNotificationTypeId = _db.queryFirst(`
    SELECT id
    FROM notification_type
    WHERE code = 'institution-post'
`).getInt("id");

const institutionCommentNotificationTypeId = _db.queryFirst(`
    SELECT id
    FROM notification_type
    WHERE code = 'institution-comment'
`).getInt("id");

const institutionLikeNotificationTypeId = _db.queryFirst(`
    SELECT id
    FROM notification_type
    WHERE code = 'institution-like'
`).getInt("id");

const myPostLikeNotificationTypeId = _db.queryFirst(`
    SELECT id
    FROM notification_type
    WHERE code = 'my-post-like'
`).getInt("id");

const myPostCommentNotificationTypeId = _db.queryFirst(`
    SELECT id
    FROM notification_type
    WHERE code = 'my-post-comment'
`).getInt("id");

_db.execute(`
    INSERT INTO notification (
        id,
        title,
        content,
        originator_id,
        recipient_id,
        sent_at,
        read_at,
        extra,
        type_id
    )
    SELECT
        NEXTVAL('notification_id'),
        '@' || originator_user.user AS originator_username,
        'Quer ser seu amigo.',
        originator.id,
        recipient.id,
        NOW(),
        NULL,
        '',
        ${friendRequestNotificationTypeId}
    FROM friend 
    INNER JOIN people originator ON friend.people_id = originator.id 
    INNER JOIN people recipient ON friend.friend_id = recipient.id
    INNER JOIN netuno_user originator_user ON originator.people_user_id = originator_user.id
    LEFT JOIN notification_opt_out
        ON notification_opt_out.people_id = recipient.id
        AND notification_opt_out.type_id = ${friendRequestNotificationTypeId} 
    WHERE 1 = 1
        AND request_at >= NOW() - INTERVAL '11 seconds'
        AND originator.id <> recipient.id
        AND notification_opt_out.id IS NULL
    ORDER BY request_at DESC;
`);

_db.execute(`
    INSERT INTO notification (
        id,
        title,
        content,
        originator_id,
        recipient_id,
        sent_at,
        read_at,
        extra,
        type_id
    )
    SELECT
        NEXTVAL('notification_id'),
        '@' || originator_user.user AS originator_username,
        'Aceitou seu pedido de amizade.',
        originator.id,
        recipient.id,
        NOW(),
        NULL,
        '',
        ${friendRequestAcceptedNotificationTypeId}
    FROM friend 
    INNER JOIN people originator ON friend.friend_id = originator.id 
    INNER JOIN people recipient ON friend.people_id = recipient.id
    INNER JOIN netuno_user originator_user ON originator.people_user_id = originator_user.id
    LEFT JOIN notification_opt_out
        ON notification_opt_out.people_id = recipient.id
        AND notification_opt_out.type_id = ${friendRequestAcceptedNotificationTypeId} 
    WHERE 1 = 1
        AND accepted_at >= NOW() - INTERVAL '11 seconds'
        AND originator.id <> recipient.id
        AND notification_opt_out.id IS NULL
    ORDER BY accepted_at DESC;
`);

_db.execute(`
    INSERT INTO notification (
        id,
        title,
        content,
        originator_id,
        recipient_id,
        sent_at,
        read_at,
        extra,
        type_id
    )
    SELECT
        NEXTVAL('notification_id'),
        '@' || originator_user.user AS originator_username,
        'Membro da sua instituição fez um novo post.',
        originator.id,
        recipient.id,
        NOW(),
        NULL,
        '{ "postUid": "' || post.uid || '" }',
        ${institutionPostNotificationTypeId}
    FROM post
    INNER JOIN people originator ON post.people_id = originator.id
    INNER JOIN people recipient
        ON recipient.institution_id = originator.institution_id
        AND recipient.id <> originator.id
    INNER JOIN netuno_user originator_user ON originator.people_user_id = originator_user.id
    LEFT JOIN notification_opt_out
        ON notification_opt_out.people_id = recipient.id
        AND notification_opt_out.type_id = ${institutionPostNotificationTypeId} 
    WHERE 1 = 1
        AND post.moment >= NOW() - INTERVAL '11 seconds'
        AND originator.id <> recipient.id
        AND notification_opt_out.id IS NULL
    ORDER BY post.moment DESC;
`);

_db.execute(`
    INSERT INTO notification (
        id,
        title,
        content,
        originator_id,
        recipient_id,
        sent_at,
        read_at,
        extra,
        type_id
    )
    SELECT
        NEXTVAL('notification_id'),
        '@' || originator_user.user AS originator_username,
        'Comentou em um post seu.',
        originator.id,
        recipient.id,
        NOW(),
        NULL,
        '{ "postUid": "' || comment.uid || '" }',
        ${myPostCommentNotificationTypeId} 
    FROM post comment
    INNER JOIN post parent ON comment.parent_id = parent.id 
    INNER JOIN people originator ON comment.people_id = originator.id
    INNER JOIN people recipient ON recipient.id = parent.people_id
    INNER JOIN netuno_user originator_user ON originator.people_user_id = originator_user.id
    LEFT JOIN notification_opt_out
        ON notification_opt_out.people_id = recipient.id
        AND notification_opt_out.type_id = ${myPostCommentNotificationTypeId} 
    WHERE 1 = 1
        AND comment.moment >= NOW() - INTERVAL '11 seconds'
        AND originator.id <> recipient.id
        AND notification_opt_out.id IS NULL
    ORDER BY comment.moment DESC;
`);
