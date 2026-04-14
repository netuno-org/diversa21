import {
  INSTITUTIONS_SET_LIST,
  INSTITUTIONS_SET_CURRENT,
  INSTITUTIONS_SET_FILTERS,
  INSTITUTIONS_SET_LOADING,
  INSTITUTIONS_SET_ERROR,
  INSTITUTIONS_CLEAR_CURRENT
} from './institutionsActionTypes';

export const institutionsSetList = (data) => ({
  type: INSTITUTIONS_SET_LIST,
  payload: data
});

export const institutionsSetCurrent = (data) => ({
  type: INSTITUTIONS_SET_CURRENT,
  payload: data
});

export const institutionsSetFilters = (data) => ({
  type: INSTITUTIONS_SET_FILTERS,
  payload: data
});

export const institutionsSetLoading = (data) => ({
  type: INSTITUTIONS_SET_LOADING,
  payload: data
});

export const institutionsSetError = (data) => ({
  type: INSTITUTIONS_SET_ERROR,
  payload: data
});

export const institutionsClearCurrent = () => ({
  type: INSTITUTIONS_CLEAR_CURRENT,
  payload: {}
});
