import {
  INSTITUTIONS_SET_LIST,
  INSTITUTIONS_SET_CURRENT,
  INSTITUTIONS_SET_FILTERS,
  INSTITUTIONS_SET_LOADING,
  INSTITUTIONS_SET_ERROR,
  INSTITUTIONS_CLEAR_CURRENT
} from '../actions/institutionsActionTypes';

const initialState = {
  list: [],
  current: null,
  filters: {
    search: '',
    country: '',
    state: '',
    city: ''
  },
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0
  },
  loading: false,
  error: null
};

export const institutionsReducer = (state = initialState, action) => {
  switch (action.type) {
    case INSTITUTIONS_SET_LIST:
      return {
        ...state,
        list: action.payload.items || [],
        pagination: {
          ...state.pagination,
          total: action.payload.total || 0
        },
        loading: false,
        error: null
      };
    case INSTITUTIONS_SET_CURRENT:
      return {
        ...state,
        current: action.payload,
        loading: false,
        error: null
      };
    case INSTITUTIONS_SET_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload
        },
        pagination: {
          ...state.pagination,
          current: 1
        }
      };
    case INSTITUTIONS_SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    case INSTITUTIONS_SET_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case INSTITUTIONS_CLEAR_CURRENT:
      return {
        ...state,
        current: null
      };
    default:
      return state;
  }
};
