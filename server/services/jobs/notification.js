import { _db } from "@netuno/server-types"

// _log.info("Job de notificações")

const institutionNotificationId = _db.queryFirst(`
    SELECT id
    FROM notification_type
    WHERE code = 'institution-post'
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
        'Novo post da sua instituição',
        post.content,
        originator.id,
        recipient.id,
        NOW(),
        NULL,
        '',
        ${institutionNotificationId}
    FROM post
    INNER JOIN people originator ON post.people_id = originator.id
    INNER JOIN people recipient ON recipient.institution_id = originator.institution_id
    WHERE moment >= NOW() - INTERVAL '11 seconds'
    ORDER BY moment DESC;
`);
