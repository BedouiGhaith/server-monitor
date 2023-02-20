import { combineReducers } from "redux";
import authReducer from "./authReducer";
import errorReducer from "./errorReducer";
import serverReducer from "./serverReducer.js";
import serverErrorReducer from "./serverErrorReducer";

export default combineReducers({
  auth: authReducer,
  errors: errorReducer,
  server: serverReducer,
  serverError: serverErrorReducer

});
