import { _service } from "@netuno/server-types";

// _log.debug(`
//   user_id: ${_user.id}
//   group_id: ${_group.id}
//   _env: ${_env}
// `);

if (_service.path === 'people/avatar/get') {
  _service.allow();
}
