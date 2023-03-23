import axios from "axios";

import {GET_ERRORS, GET_SERVER_ERRORS, PROCESS_KILLING, SET_SERVER_STATUS} from "./types.js";

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

export const connectToServer = (serverId, userId, cmd, actionType) => dispatch => {

    const connectionData = {
        user: userId,
        server: serverId,
        option: cmd
    };
    return axios
        .post("/api/servers/connectToServer/", connectionData)
        .then(response => {
            console.log(response)
            dispatch ({
                type: actionType,
                payload: response.data
            })
        })
        .catch(err => {
            console.log(err)
            dispatch({
                type: GET_SERVER_ERRORS,
                payload: err.response.data
            });
        });
};

export const killProcess = (serverId, userId, cmd) => dispatch => {

    const connectionData = {
        user: userId,
        server: serverId,
        option: cmd
    };
    return axios
        .post("/api/servers/connectToServer/", connectionData)
        .then(response => {
            console.log(response)
            dispatch ({
                type: PROCESS_KILLING,
                payload: response.data
            })
        })
        .catch(err => {
            console.log(err)
            dispatch({
                type: PROCESS_KILLING,
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
