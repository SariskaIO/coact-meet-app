import {Box, makeStyles} from '@material-ui/core';
import React, {useEffect, useState} from 'react'
import {color} from '../../assets/styles/_color';
import ActionButtons from '../../components/meeting/ActionButtons';
import SariskaMediaTransport from 'sariska-media-transport';
import Navbar from '../../components/shared/Navbar'
import ReconnectDialog from "../../components/shared/ReconnectDialog";
import {useDispatch, useSelector} from "react-redux";
import {addRemoteTrack, participantLeft, removeRemoteTrack, remoteTrackMutedChanged} from "../../store/actions/track";
import GridLayout from "../../components/meeting/GridLayout";
import SpeakerLayout from "../../components/meeting/SpeakerLayout";
import PresentationLayout from "../../components/meeting/PresentationLayout";
import {SPEAKER, PRESENTATION, GRID, EXIT_FULL_SCREEN_MODE, ENTER_FULL_SCREEN_MODE} from "../../constants";
import {addMessage} from "../../store/actions/message";
import {getUserById, preloadIframes} from "../../utils";
import PermissionDialog from "../../components/shared/PermissionDialog";
import SnackbarBox from '../../components/shared/Snackbar';
import {unreadMessage} from '../../store/actions/chat';
import {clearAllReducers} from "../../store/actions/conference";
import Home from "../Home";
import {setPresenter, setPinParticipant, setRaiseHand} from "../../store/actions/layout";
import {setAudioLevel} from "../../store/actions/audioIndicator";
import {showNotification} from "../../store/actions/notification";
import { addSubtitle } from '../../store/actions/subtitle';

const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex",
        flexDirection: "column",
        background: color.secondaryDark,
        minHeight: '100vh',
    }
}));

const Meeting = () => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const localTracks = useSelector(state => state.localTrack);
    const conference = useSelector(state => state.conference);
    const connection = useSelector(state => state.connection);
    const layout = useSelector(state => state.layout);
    const notification = useSelector(state => state.notification);
    const [dominantSpeakerId, setDominantSpeakerId] = useState(null);
    const [lobbyUserJoined, setLobbyUserJoined] = useState({});

    const allowLobbyAccess = () => {
        conference.lobbyApproveAccess(lobbyUserJoined.id)
        setLobbyUserJoined({});
    }

    const denyLobbyAccess = () => {
        conference.lobbyDenyAccess(lobbyUserJoined.id);
        setLobbyUserJoined({});
    }

    const updateNetwork = () => { // set internet connectivity status
        if (!window.navigator.onLine) {
            dispatch(showNotification({
                message: "You lost your internet connection. Trying to reconnect...",
                severity: "info",
                autoHide: false
            }));
        }
        setTimeout(() => {
            if (window.navigator.onLine && !layout.disconnected) {
                dispatch(showNotification({message: "Internet Recovered!!!", autoHide: true, severity: "info"}));
            }
        }, 5000);
        SariskaMediaTransport.setNetworkInfo({isOnline: window.navigator.onLine});
    };

    const destroy = async () => {
        if (conference?.isJoined()) {
             await conference?.leave();
        }
        for (const track of localTracks) {
            await track.dispose();
        }
        await connection?.disconnect();
        window.removeEventListener("offline", updateNetwork);
        window.removeEventListener("online", updateNetwork);
        // dispatch(clearAllReducers());
    }

    useEffect(() => {
        if (!conference) {
            return;
        }
        conference.getParticipantsWithoutHidden().forEach(item=>{
            if (item._properties?.presenting === "start") {
                dispatch(showNotification({autoHide: true, message: `Screen sharing is being presenting by ${item._identity?.user?.name}`}));
                dispatch(setPresenter({participantId: item._id, presenter: true}));
            }
            if (item._properties?.handraise === "start") {
                dispatch(setRaiseHand({ participantId: item._id, raiseHand: true}));
            }
        });

        conference.addEventListener(SariskaMediaTransport.events.conference.TRACK_ADDED, (track) => {
            if (track.isLocal()) {
                return;
            }
            dispatch(addRemoteTrack(track));
        });

        conference.addEventListener(SariskaMediaTransport.events.conference.SUBTITLES_RECEIVED, (id, name, text) => {
            dispatch(addSubtitle({name,text}));
        });

        conference.addEventListener(SariskaMediaTransport.events.conference.TRACK_REMOVED, (track) => {
            dispatch(removeRemoteTrack(track));
        });

        conference.addEventListener(SariskaMediaTransport.events.conference.TRACK_MUTE_CHANGED, (track) => {
            dispatch(remoteTrackMutedChanged());
        });

        conference.addEventListener(SariskaMediaTransport.events.conference.DOMINANT_SPEAKER_CHANGED, (id) => {
            setDominantSpeakerId(id);
        });

        conference.addEventListener(SariskaMediaTransport.events.conference.PARTICIPANT_PROPERTY_CHANGED, (participant, key, oldValue, newValue) => {
            if (key === "presenting" && newValue === "start") {
                dispatch(showNotification({ autoHide: true, message: `Screen sharing started by ${participant._identity?.user?.name}`}));
                dispatch(setPresenter({participantId: participant._id, presenter: true}));
            }
            
            if (key === "presenting" && newValue === "stop") {
                dispatch(setPresenter({participantId: participant._id, presenter: false}));
            }

            if (key === "handraise" && newValue === "start") {
                dispatch(setRaiseHand({ participantId: participant._id, raiseHand: true}));
            }

            if (key === "handraise" && newValue === "stop") {
                dispatch(setRaiseHand({ participantId: participant._id, raiseHand: false}));
            }
        });

        conference.addEventListener(SariskaMediaTransport.events.conference.USER_LEFT, (id) => {
            if (id === layout.pinnedParticipantId) {
                dispatch(setPinParticipant(null))
            }
            if ( layout.presenterParticipantIds.find(item=>item===id)) {
                dispatch(setPresenter({participantId: id, presenter: false}));
            }
            dispatch(participantLeft());
        });

        conference.addEventListener(SariskaMediaTransport.events.conference.USER_ROLE_CHANGED, (id) => {
            if (conference.isModerator()) {
                conference.enableLobby();
            }
        });

        conference.addEventListener(SariskaMediaTransport.events.conference.LOBBY_USER_JOINED, (id, displayName) => {
            new Audio("https://sdk.sariska.io/knock_0b1ea0a45173ae6c10b084bbca23bae2.ogg").play();
            setLobbyUserJoined({id, displayName});
        });

        conference.addEventListener(SariskaMediaTransport.events.conference.MESSAGE_RECEIVED, (id, text, ts) => {
            dispatch(addMessage({text: text, user: getUserById(id, conference)}));
            if (id !== conference.myUserId()) {
                dispatch(unreadMessage(1))
            }
        });

        conference.addEventListener(SariskaMediaTransport.events.conference.NOISY_MIC, () => {
            dispatch(showNotification({autoHide: true, message: "Your mic seems to be noisy", severity: "info"}));
        });

        conference.addEventListener(SariskaMediaTransport.events.conference.TALK_WHILE_MUTED, () => {
            dispatch(showNotification({autoHide: true, message: "Trying to speak?  your are muted!!!", severity: "info"}));
        });

        conference.addEventListener(SariskaMediaTransport.events.conference.NO_AUDIO_INPUT, () => {
            dispatch(showNotification({autoHide: true, message: "Looks like device has no audio input", severity: "warning"}));
        });

        conference.addEventListener(SariskaMediaTransport.events.conference.TRACK_AUDIO_LEVEL_CHANGED, (participantId, audioLevel) => {
            dispatch(setAudioLevel({participantId, audioLevel}));
        });

        conference.addEventListener(SariskaMediaTransport.events.connectionQuality.LOCAL_STATS_UPDATED, (a, b)=>{
            //console.log("LOCAL_STATS_UPDATED", a, b);
        });


        conference.addEventListener(SariskaMediaTransport.events.connectionQuality.REMOTE_STATS_UPDATED, (a, b) => {
            //console.log("REMOTE_STATS_UPDATED", a, b);
        });

        conference.addEventListener(SariskaMediaTransport.events.conference.PARTICIPANT_CONN_STATUS_CHANGED, (a, b) => {
            //console.log("PARTICIPANT_CONN_STATUS_CHANGED", a, b);
        });

        conference.addEventListener(SariskaMediaTransport.events.conference.PARTICIPANT_CONN_STATUS_CHANGED, (a, b) => {
            //console.log("PARTICIPANT_CONN_STATUS_CHANGED", a, b);
        });

        conference.addEventListener(SariskaMediaTransport.events.conference.E2E_RTT_CHANGED, (participant, e2eRtt)=>{
            //console.log("participant, e2eRtt", participant, e2eRtt)
        });

        window.addEventListener("offline", updateNetwork);
        window.addEventListener("online", updateNetwork);
        window.addEventListener("beforeunload", destroy);
        preloadIframes(conference);
        
        return () => {
            destroy();
        };
    }, [conference]);


    if (!conference || !conference.isJoined()) {
        return <Home/>;
    }

    let justifyContent = "center";
    if ( layout.mode === ENTER_FULL_SCREEN_MODE ) {
        justifyContent = "space-around";
    }

    console.log("layoutlayout", layout);


    return (
        <Box style={{ justifyContent }} className={classes.root}>
            <Navbar dominantSpeakerId={dominantSpeakerId}/>
            { layout.type === SPEAKER &&
                <SpeakerLayout dominantSpeakerId={dominantSpeakerId}/>
            }
            { layout.type === GRID &&
                <GridLayout dominantSpeakerId={dominantSpeakerId}/>
            }
            { layout.type === PRESENTATION && 
                <PresentationLayout dominantSpeakerId={dominantSpeakerId}/>
            }
            <ActionButtons dominantSpeakerId={dominantSpeakerId}/>
            {lobbyUserJoined.id && <PermissionDialog
                denyLobbyAccess={denyLobbyAccess}
                allowLobbyAccess={allowLobbyAccess}
                displayName={lobbyUserJoined.displayName}/>}

            <SnackbarBox notification={notification}/>
            <ReconnectDialog open={layout.disconnected}/>
        </Box>
    )
}

export default Meeting
