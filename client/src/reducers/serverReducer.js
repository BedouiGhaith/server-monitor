import { PROCESS_KILLING, SERVER_INSTALL, SERVER_PACKAGES, SET_SERVER_STATUS } from "../actions/types";

const initialState = {
    packages: null,
    installResult: null,
};

export default function(state = initialState, action) {
    switch (action.type) {
        case SET_SERVER_STATUS:
            return {
                ...state,
                data: action.payload,
            };
        case SERVER_PACKAGES:
            return {
                ...state,
                packages: action.payload,
            };
        case SERVER_INSTALL:
            return {
                ...state,
                installResult: action.payload,
            };
        case PROCESS_KILLING:
            return {
                ...state,
            };
        default:
            return state;
    }
}
