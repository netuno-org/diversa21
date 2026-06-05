import {_req, _db, _header, _exec, _out} from "@netuno/server-types"

let dbInstitution = null;

if (_req.getString('uid')) {
  dbInstitution = _db.get('institution', _req.getString('uid'));
}

if (!dbInstitution) {
  _header.status(404);
  _exec.stop();
}

const dbLogoName = dbInstitution.getString('logo');

const storageLogoFile = _storage.database(
  'institution',
  'logo',
  dbLogoName
);

_header.contentTypePNG();
_header.noCache();

_out.copy(storageLogoFile.inputStream());
