// _log.debug(`
//   user_id: ${_user.id}
//   group_id: ${_group.id}
//   _env: ${_env}
// `);

if (_header.isOptions()) {
  _service.allow();
} else if (_auth.isJWT()) {
  _log.debug("allowed");
  _service.allow();
} else if (_service.path == 'people/avatar/get') {
  _service.allow();
} else if (_service.path !== '_auth') {
  _log.debug("denied");
  _service.deny();
}
