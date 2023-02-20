import { SET_SERVER_STATUS } from "../actions/types";

const initialState = {
    data: null
};

export default function(state = initialState, action) {
    switch (action.type) {
        case SET_SERVER_STATUS:
            return {
                ...state,
                data: action.payload
            };
        default:
            return state;
    }
}
