import { _req, _db, _exec, _header, _out, _val } from "@netuno/server-types";

import institution from "#core/lib/institution.js";
import response from "#core/lib/response.js";

const slug = _req.getString('slug');

const data = institution.getBySlug(slug);

if (!data) {
  response.stopWithInstitutionNotFound();
}

response.successWithData(data);
