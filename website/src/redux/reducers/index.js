import { combineReducers } from 'redux';

import { loggedUserInfoReducer } from './loggedUserInfo';
import { institutionsReducer } from './institutions';

export const Reducers = combineReducers({
  loggedUserInfoState: loggedUserInfoReducer,
  institutionsState: institutionsReducer,
});
