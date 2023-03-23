import {PROCESS_KILLING, SET_SERVER_STATUS} from "../actions/types";

const initialState = {};

export default function(state = initialState, action) {
    switch (action.type) {
        case SET_SERVER_STATUS:
            return {
                ...state,
                data: action.payload
            };
        case PROCESS_KILLING:
            return {
                ...state,
            };
            default:
            return state;
    }
}
