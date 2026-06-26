import { _db } from "@netuno/server-types"

// _log.info("Job de notificações")

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
