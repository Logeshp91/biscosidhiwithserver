import actionTypes from "../actionTypes";

const initial = {
  loading:{},
  data: {}, 
  error: {},
};

const postOutstandingReducer = (state = initial, action) => {
  switch (action.type) {
    case actionTypes.POST_OUTSTANDING_REQUEST:
      return { 
        ...state, 
        loading: { ...state.loading, [action.requestKey]: true },
        error: { ...state.error, [action.requestKey]: null }
      };

    case actionTypes.POST_OUTSTANDING_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, [action.requestKey]: false },
        data: { ...state.data, [action.requestKey]: action.payload.result || action.payload },
        error: { ...state.error, [action.requestKey]: null },
      };

    case actionTypes.POST_OUTSTANDING_FAILURE:
    case actionTypes.POST_OUTSTANDING_FAILURE_INVALID:
      return {
        ...state,
        loading: { ...state.loading, [action.requestKey]: false },
        error: { ...state.error, [action.requestKey]: action.payload },
      };

    case actionTypes.CLEAR_SOPRODUCTS:
      return {
        ...state,
        data: { ...state.data, soProducts: [] },
        loading: { ...state.loading, soProducts: false },
      };
    case actionTypes.CLEAR_SONUMBERDETAIL:
      return {
        ...state,
        data: { ...state.data, sonumberDetail: [] },
        loading: { ...state.loading, sonumberDetail: false }, // Clear loading
        error: { ...state.error, sonumberDetail: null },      // Clear error
      };
    default:
      return state;
  }
};


export default postOutstandingReducer;
