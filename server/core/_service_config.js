_log.debug(`
  user_id: ${_user.id}
  group_id: ${_group.id}
  _env: ${_env}
`);

// if (_auth.isJWT() && (_group.id == 1 || _group.id == 2) && (_user.id == 1 || _user.id == 2)) {
if (_header.isOptions()) {
  _service.allow();
} else if (_auth.isJWT()) {
  _log.debug("allowed");
  _service.allow();
} else if (_service.path !== '_auth') {
  _log.debug("denied");
  _service.deny();
}

// if (
//   _service.path == '_auth'
//     // || _service.path == 'people/avatar/get'
//     // || _service.path == 'people/post'
//     // || _service.path == 'people/options'
//     // || _service.path == 'recovery/put'
//     // || _service.path == 'recovery/post'
//     // || _service.path == 'recovery/options'
// ) {
//     _service.allow()
// }
