import { _req, _db, _header, _exec, _out } from "@netuno/server-types"

let dbInstitution = null;

if (_req.getString('uid')) {
  dbInstitution = _db.get('institution', _req.getString('uid'));
}

if (!dbInstitution) {
  _header.status(404);
  _exec.stop();
}

const dbAvatarName = dbInstitution.getString('avatar');

const storageAvatarFile = _storage.database(
  'institution',
  'avatar',
  dbAvatarName
);

_header.contentTypePNG();
_header.noCache();

_out.copy(storageAvatarFile.inputStream());
