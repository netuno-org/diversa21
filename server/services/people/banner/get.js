import { _req, _db, _header, _exec, _out } from "@netuno/server-types"

let dbPeople = null;

if (_req.getString('uid')) {
  dbPeople = _db.get('people', _req.getString('uid'));
}

if (!dbPeople) {
  _header.status(404);
  _exec.stop();
}

const dbBannerName = dbPeople.getString('banner');

const storageBannerFile = _storage.database(
  'people',
  'banner',
  dbBannerName
);

_header.contentTypePNG();
_header.noCache();

_out.copy(storageBannerFile.inputStream());
