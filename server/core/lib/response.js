import {_header, _out, _val, _exec} from "@netuno/server-types";

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

  stopWithNotExist: () => stopWithError(404, "not-exist"),

  stopWithUserNotFound: () => stopWithNotFound("user"),
  stopWithGroupNotFound: () => stopWithNotFound("group"),
  stopWithCityNotFound: () => stopWithNotFound("city"),
  stopWithGroupNotFound: () => stopWithNotFound("group"),
  stopWithInstitutionNotFound: () => stopWithNotFound("institution"),
  stopWithStateNotFound: () => stopWithNotFound("state"),
  stopWithCountryNotFound: () => stopWithNotFound("country"),
  stopWithPostNotFound: () => stopWithNotFound("post"),

  stopWithCityNotCreated: () => stopWithNotCreated("city"),
  stopWithStateNotCreated: () => stopWithNotCreated("state"),
  stopWithCountryNotCreated: () => stopWithNotCreated("country"),
  stopWithUserNotCreated: () => stopWithNotCreated("user"),
  stopWithPostNotCreated: () => stopWithNotCreated("post"),
  stopWithLikeNotCreated: () => stopWithNotCreated("like"),
}
