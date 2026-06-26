import {_req, _db, _header, _exec, _out} from "@netuno/server-types"

let dbInstitution = null;

if (_req.getString('uid')) {
  dbInstitution = _db.get('institution', _req.getString('uid'));
}

if (!dbInstitution) {
  _header.status(404);
  _exec.stop();
}

const dbCoverName = dbInstitution.getString('cover_image');

const storageCoverFile = _storage.database(
  'institution',
  'cover_image',
  dbCoverName
);

_header.contentTypePNG();
_header.noCache();

_out.copy(storageCoverFile.inputStream());
