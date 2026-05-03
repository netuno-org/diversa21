import { combineReducers } from '@reduxjs/toolkit';

import { peopleReducer } from './people';
import { institutionsReducer } from './institutions';

export const rootReducer = combineReducers({
  people: peopleReducer,
  institutionsState: institutionsReducer,
});
