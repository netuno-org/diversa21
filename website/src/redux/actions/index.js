import {
  PEOPLE_LOAD
} from './actionTypes';
import { PROFILE_LOAD, WS_LOAD } from './actionTypes';

export const peopleLoadAction = (data) => ({
  type: PEOPLE_LOAD,
  payload: data ? { ...data } : null
});

export const profileLoadAction = (data) => ({
  type: PROFILE_LOAD,
  payload: data ? { ...data } : null
});

export const wsLoadAction = (data) => ({
  type: WS_LOAD,
  payload: data ? { ...data } : null
});
