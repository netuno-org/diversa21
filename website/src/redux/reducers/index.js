import { combineReducers } from '@reduxjs/toolkit';

import { peopleReducer } from './people';
import { institutionsReducer } from './institutions';
import { wsReducer } from './ws';

export const rootReducer = combineReducers({
  people: peopleReducer,
  institutionsState: institutionsReducer,
  ws: wsReducer
});
