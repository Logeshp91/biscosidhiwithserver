import { call, put } from "redux-saga/effects";
import { ApiMethod, endPoint } from "../../services/Apicall";
import actionTypes from "../actionTypes";

function* postCustomerListSaga(action) {
  try {
    const { payload, requestKey, resolve, append } = action;

    const response = yield call(ApiMethod.POST, endPoint.postCustomerList, payload);

    if (response?.status === 200 && response?.data?.result !== undefined) {
      const result = response.data.result;

      yield put({
        type: actionTypes.POST_CUSTOMERLIST_SUCCESS,
        payload: result,
        requestKey,
      });

      if (resolve) resolve(result); // ✅ correct return
    } else {
      yield put({
        type: actionTypes.POST_CUSTOMERLIST_FAILURE,
        payload: "BAD REQUEST",
        requestKey,
      });
    }
  } catch (err) {
    yield put({
      type: actionTypes.POST_CUSTOMERLIST_FAILURE_INVALID,
      payload: err.message || "INTERNAL SERVER ERROR",
      requestKey: action.requestKey,
    });
  }
}

export default postCustomerListSaga;
