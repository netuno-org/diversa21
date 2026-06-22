import { _req, _header, _out, _val, _exec } from "@netuno/server-types";

import response from "#core/lib/response.js";

const uid = _req.getString('uid');
const assetName = _req.getString('assetName');
const entityName = _req.getString('entityName');

if (!uid) response.stopWithUserNotFound();
if (!assetName) response.stopWithNameNotFound();
if (!entityName) response.stopWithNameNotFound();

const dbTable = _db.get(entityName, uid);

if (!dbTable) response.stopWithTableNotFound();

const dbTableName = dbTable.getString(assetName);

const storageFile = _storage.database(
  entityName,
  assetName,
  dbTableName
);

_header.contentTypePNG();
_header.noCache();

_out.copy(storageFile.inputStream());
