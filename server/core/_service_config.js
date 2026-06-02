import { _service } from "@netuno/server-types";

// _log.debug(`
//   user_id: ${_user.id}
//   group_id: ${_group.id}
//   _env: ${_env}
// `);

if (_header.isOptions()) {
  _service.allow();
} else if (_auth.isJWT()) {
  _service.allow();
} else if (_service.path === 'people/avatar/get' || _service.path === 'jobs/people-order') {
  _service.allow();
} else if (_service.path !== '_auth') {
  _service.deny();
}
