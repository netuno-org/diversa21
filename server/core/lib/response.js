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
  successWithoutData: (data) => {
    _out.json(
      _val.map()
        .set("result", true)
    );
  },
  stopWithNotExist: () => stopWithError(404, "not-exist"),
  stopWithUserNotFound: () => stopWithNotFound("user"),
  stopWithCityNotFound: () => stopWithNotFound("city"),
  stopWithGroupNotFound: () => stopWithNotFound("city"),
  stopWithStateNotFound: () => stopWithNotFound("state"),
  stopWithCountryNotFound: () => stopWithNotFound("country"),
  stopWithCityNotCreated: () => stopWithNotCreated("city"),
  stopWithStateNotCreated: () => stopWithNotCreated("state"),
  stopWithCountryNotCreated: () => stopWithNotCreated("country"),
  stopWithUserNotCreated: () => stopWithNotCreated("user"),
  stopWithPostNotCreated: () => stopWithNotCreated("post"),
  stopWithLikeNotCreated: () => stopWithNotCreated("like"),
}
