import { _req, _header, _out, _db, _storage } from "@netuno/server-types";

import response from "#core/lib/response.js";

const uid = _req.getString('uid');
const type = _req.getString('type');
const entity = _req.getString('entity');

const dbTable = _db.get(entity, uid);

if (!dbTable) {
  response.stopWithTableNotFound();
}

const dbTableName = dbTable.getString(type);

if (dbTableName === "") {
  response.stopWithTableNotFound();
}

const storageFile = _storage.database(
  entity,
  type,
  dbTableName
);

_header.contentTypePNG();
_header.noCache();

_out.copy(storageFile.inputStream());
