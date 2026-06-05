import {_req, _db, _header, _exec, _out} from "@netuno/server-types"

let dbInstitution = null;

if (_req.getString('uid')) {
  dbInstitution = _db.get('institution', _req.getString('uid'));
}

if (!dbInstitution) {
  _header.status(404);
  _exec.stop();
}

const dbBannerName = dbInstitution.getString('cover_image');

const storageBannerFile = _storage.database(
  'institution',
  'cover_image',
  dbBannerName
);

_header.contentTypePNG();
_header.noCache();

_out.copy(storageBannerFile.inputStream());
