import { _req, _header, _out, _val, _exec } from "@netuno/server-types";

import response from "#core/lib/response.js";

const uid = _req.getString('uid');
let type = _req.getString('type');
const entity = _req.getString('entity');

const dbTable = _db.get(entity, uid);

if (!dbTable) response.stopWithTableNotFound();

let dbTableName = dbTable.getString(type);

if (entity === 'people' && type === 'banner') {
  console.log("sim");
  dbTableName = dbTable.getString('cover_image');
  type = 'cover_image';
}

const storageFile = _storage.database(
  entity,
  type,
  dbTableName
);

_log.debug(`${storageFile}`);

_header.contentTypePNG();
_header.noCache();

_out.copy(storageFile.inputStream());
