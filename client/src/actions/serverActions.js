import axios from "axios";

import {GET_ERRORS, GET_SERVER_ERRORS, SET_SERVER_STATUS} from "./types.js";

export const addServer = (serverData, history) => dispatch => {
    axios
        .post("/api/servers/add_server/", serverData)
        .then(_ => history.push("/dashboard"))
        .catch(err =>
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data

            })
        );
};

export const connectToServer = (serverId, userId, cmd) => dispatch => {

    const connectionData = {
        user: userId,
        server: serverId,
        option: cmd
    };
    return axios
        .post("/api/servers/connectToServer/", connectionData)
        .then(response => { dispatch ({
            type: SET_SERVER_STATUS,
            payload: response.data
        })
        })
        .catch(err => {
            dispatch({
                type: GET_SERVER_ERRORS,
                payload: err.response.data
            });
        });
};

export const setServerStatus = response => {
    return {
        type: SET_SERVER_STATUS,
        payload: response
    };
};
