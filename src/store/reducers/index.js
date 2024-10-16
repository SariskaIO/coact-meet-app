import {CLEAR_ALL} from "../actions/types";
import {combineReducers} from "redux";
import {conference} from "./conference";
import {connection} from "./connection";
import {remoteTrack} from "./remoteTrack";
import {localTrack} from "./localTrack";
import {layout, layoutInitialState} from "./layout";
import {profile} from "./profile";
import {message} from "./message";
import {chat} from "./chat";
import {media} from "./media";
import {color} from "./color";
import {audioIndicator} from "./audioIndicator";
import {notification} from "./notification";
import {subtitle} from "./subtitle";
import {snackbar} from "./snackbar";
import { EXIT_FULL_SCREEN_MODE } from "../../constants";
import { annotation } from "./annotation";

export const appReducer = combineReducers({
    conference,
    connection,
    remoteTrack,
    localTrack,
    layout,
    profile,
    media,
    message,
    chat,
    color,
    audioIndicator,
    notification,
    subtitle,
    snackbar, 
    annotation
});

export const rootReducer = (state, action) => {
    if (action.type === 'CLEAR_ALL') {
        layoutInitialState.presenterParticipantIds = [];
        layoutInitialState.mode = EXIT_FULL_SCREEN_MODE;
        return appReducer({ localTrack: [], layout: { ...layoutInitialState} , profile: state.profile, remoteTrack:{} }, action);
    }
    return appReducer(state, action);
}
