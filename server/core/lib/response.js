/*
  * Utilities to handle HTTP responses
  */

import { _header, _out, _val, _exec } from "@netuno/server-types";

const stopWithError = (code, message) => {
  _header.status(code);
  _out.json(
    _val.map()
      .set("error", message)
  );
  _exec.stop();
}

const stopWithNotCreated = (entity) => {
  stopWithError(400, `${entity}-not-created`);
}

const stopWithNotFound = (entity) => {
  stopWithError(404, `${entity}-not-found`);
}

export default {
  successWithData: (data) => {
    _out.json(
      _val.map()
        .set("result", true)
        .set("data", data)
    );
  },
  successWithoutData: () => {
    _out.json(
      _val.map()
        .set("result", true)
    );
  },

  stopWithBadRequest: (message) => stopWithError(400, message),

  // This is not to be used when the user is not logged
  // That is handled by Netuno login system
  // This is for the logged user permissions
  // e.g. the user is logged but doens't have permission to edit an institution
  stopWithPermissionDenied: () => stopWithError(403, "permission-denied"),

  // These are not for when the API user didn't pass a certain parameter
  // That is automatically handled by OpenAPI
  // So we don't need to handle that kind of error
  // These are for when the database was queried and no register was found
  stopWithNotExist: () => stopWithError(404, "not-exist"),
  stopWithUserNotFound: () => stopWithNotFound("user"),
  stopWithGroupNotFound: () => stopWithNotFound("group"),
  stopWithTableNotFound: () => stopWithNotFound("table"),
  stopWithCityNotFound: () => stopWithNotFound("city"),
  stopWithNameNotFound: () => stopWithNotFound("name"),
  stopWithEmailNotFound: () => stopWithNotFound("email"),
  stopWithGroupNotFound: () => stopWithNotFound("group"),
  stopWithInstitutionNotFound: () => stopWithNotFound("institution"),
  stopWithSlugNotFound: () => stopWithNotFound("slug"),
  stopWithStateNotFound: () => stopWithNotFound("state"),
  stopWithCountryNotFound: () => stopWithNotFound("country"),
  stopWithPostNotFound: () => stopWithNotFound("post"),
  stopWithAssetNotFound: () => stopWithNotFound("asset"),

  stopWithCityNotCreated: () => stopWithNotCreated("city"),
  stopWithStateNotCreated: () => stopWithNotCreated("state"),
  stopWithCountryNotCreated: () => stopWithNotCreated("country"),
  stopWithUserNotCreated: () => stopWithNotCreated("user"),
  stopWithPostNotCreated: () => stopWithNotCreated("post"),
  stopWithLikeNotCreated: () => stopWithNotCreated("like"),
}
