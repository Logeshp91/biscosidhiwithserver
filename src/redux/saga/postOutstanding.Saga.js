import { call, put } from "redux-saga/effects";
import { ApiMethod, endPoint } from "../../services/Apicall";
import actionTypes from "../actionTypes";

function* postOutstandingSaga(action) {
  try {
  const { payload, requestKey, resolve } = action;
    const response = yield call(
      ApiMethod.POST,
      endPoint.postOutstanding,
      payload
    );
    console.log("responseoutstading25",response)
    if (response?.status === 200 && response?.data?.result) {
      yield put({
        type: actionTypes.POST_OUTSTANDING_SUCCESS,
        payload: response?.data?.result,
        requestKey,
        
      });
      if (resolve) {
        resolve(response.data.result);
      }
    } else {
      yield put({
        type: actionTypes.POST_OUTSTANDING_FAILURE,
        payload: "BAD REQUEST",
        requestKey,
      });
    }
  } catch (err) {
    yield put({
      type: actionTypes.POST_OUTSTANDING_FAILURE_INVALID,
      payload: err.message || "INTERNAL SERVER ERROR",
    });
  }
}



export default postOutstandingSaga;
