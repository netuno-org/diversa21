import { _service } from "@netuno/server-types";

if (_service.path === 'asset/get') {
  _service.allow();
}

if (_service.path === 'recovery/post' || _service.path === 'recovery/put') {
  _service.allow();
}