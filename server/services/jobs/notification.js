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
        'Membro da sua instituição fez um novo post.',
        post.content,
        originator.id,
        recipient.id,
        NOW(),
        NULL,
        '{ "postUid": "' || post.uid || '" }',
        ${institutionNotificationId}
    FROM post
    INNER JOIN people originator ON post.people_id = originator.id
    INNER JOIN people recipient ON recipient.institution_id = originator.institution_id
    LEFT JOIN notification_opt_out
        ON notification_opt_out.people_id = recipient.id
        AND notification_opt_out.type_id = ${institutionNotificationId} 
    WHERE 1 = 1
      AND moment >= NOW() - INTERVAL '11 seconds'
      AND originator.id <> recipient.id
      AND notification_opt_out.id IS NULL
    ORDER BY moment DESC;
`);
