import { GET_SERVER_ERRORS } from "../actions/types";

const initialState = "";

export default function(state = initialState, action) {
  switch (action.type) {
    case GET_SERVER_ERRORS:
      return action.payload;
    default:
      return state;
  }
}
