import {_val, _auth, _exec} from '@netuno/server-types';

import people from "#core/lib/people.js";

const onAbort = () => {
  _auth.signInAbortWithData(
    _val.map()
      .set('error', 'invalid-user')
  );
  _exec.stop();
};

const dbPeople = people.getLogged();

if (!dbPeople) {
  onAbort();
}

const data = people.getData(dbPeople.getUID("uid"));

if (!data) {
  onAbort();
}

// _log.info(_req.getString('my-parameter'));

_auth.signInExtraData(data);
