import { _val } from "@netuno/server-types";

import people from "#core/lib/people.js";
import notifications, { notificationTypes } from "#core/lib/notifications.js";
import response from "#core/lib/response.js";

const dbPeopleLogged = people.getLogged();

notifications.clearAllMessageNotifications(dbPeopleLogged.getInt("id"));

people.wsSendAsService(
  dbPeopleLogged,
  _val.map()
    .set("method", "POST")
    .set("service", "notification/read")
    .set(
      "content",
      _val.map()
        .set("type", notificationTypes.MESSAGE)
        .set("all", true)
    )
);

response.successWithoutData();
