import { Box, Hidden, makeStyles } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { color } from "../../assets/styles/_color";
import ActionButtons from "../../components/meeting/ActionButtons";
import SariskaMediaTransport from "sariska-media-transport";
import ReconnectDialog from "../../components/shared/ReconnectDialog";
import { useDispatch, useSelector } from "react-redux";
import {
  addRemoteTrack,
  participantLeft,
  removeRemoteTrack,
  updateLocalTrack,
  remoteTrackMutedChanged,
} from "../../store/actions/track";
import GridLayout from "../../components/meeting/GridLayout";
import SpeakerLayout from "../../components/meeting/SpeakerLayout";
import PresentationLayout from "../../components/meeting/PresentationLayout";
import Notification from "../../components/shared/Notification";
import {
  SPEAKER,
  PRESENTATION,
  GRID,
  ENTER_FULL_SCREEN_MODE,
  PARTICIPANTS_LOCAL_PROPERTIES,
  ANNOTATION_TOOLS,
} from "../../constants";
import { addMessage } from "../../store/actions/message";
import { getUserById, preloadIframes, getDefaultDeviceId, isPortrait, isMobileOrTab } from "../../utils";
import PermissionDialog from "../../components/shared/PermissionDialog";
import SnackbarBox from "../../components/shared/Snackbar";
import { unreadMessage } from "../../store/actions/chat";
import Home from "../Home";
import {
  setPresenter,
  setPinParticipant,
  setRaiseHand,
  setModerator,
  setDisconnected,
  setLayout,
} from "../../store/actions/layout";
import { setAudioLevel } from "../../store/actions/audioIndicator";
import { showNotification } from "../../store/actions/notification";
import { addSubtitle } from "../../store/actions/subtitle";
import { useHistory } from "react-router-dom";
import { setUserResolution } from "../../store/actions/layout";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import ReactGA from "react-ga4";
import {
  enableParticipantMedia,
  setCamera,
  setDevices,
  setMicrophone,
} from "../../store/actions/media";
import { addAnnotationFeature, setAnnotator } from "../../store/actions/annotation";
import { SET_ANNOTATION_FEATURE } from "../../store/actions/types";
import { getParticipantName } from '../../utils/index';

const Meeting = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const localTracks = useSelector((state) => state.localTrack);
  const conference = useSelector((state) => state.conference);
  const connection = useSelector((state) => state.connection);
  const layout = useSelector((state) => state.layout);
  const notification = useSelector((state) => state.notification);
  const snackbar = useSelector((state) => state.snackbar);
  const isOnline = useOnlineStatus();
  const enabledMediaParticipantIds = useSelector((state) => state.media?.enabledMediaParticipantIds);
  const [unmuteRequests, setUnmuteRequests] = useState([]);
  const resolution = useSelector((state) => state.media?.resolution);
  const annotation = useSelector((state) => state.annotation);
  const [dominantSpeakerId, setDominantSpeakerId] = useState(null);
  const [lobbyUser, setLobbyUser] = useState([]);
  let oldDevices = useSelector((state) => state?.media?.devices);
  
  const useStyles = makeStyles((theme) => ({
    root: {
      display: "flex",
      flexDirection: "column",
      background: color.secondaryDark,
      minHeight:
        layout.mode === ENTER_FULL_SCREEN_MODE ? "100vh" : "calc(100vh - 16px)",
    },
  }));

  const classes = useStyles();
  let ingoreFirstEvent = true;

  const allowLobbyAccess = (userId) => {
    conference.lobbyApproveAccess(userId);
    setLobbyUser((lobbyUser) => lobbyUser.filter((item) => item.id !== userId));
  };

  const denyLobbyAccess = (userId) => {
    conference.lobbyDenyAccess(userId);
    setLobbyUser((lobbyUser) => lobbyUser.filter((item) => item.id !== userId));
  };
  
  const allowUnmuteAccess = (req) => {
    // Approve the unmute request
    conference.sendCommandOnce('unmute-media-approval', {
        value: 'approved',
        attributes: { participantId: req.id, variant: req.value },
    });  

    setUnmuteRequests((prevRequests) =>
        prevRequests.filter((prevReq) => !(prevReq?.id === req.id && prevReq?.value === req.value))
    );
  };

  const rejectUnmuteAccess = (req) => {
      // Reject the unmute request
      conference.sendCommandOnce('unmute-media-approval', {
          value: 'rejected',
          attributes: { participantId: req.id, variant: req.value },
      });

      setUnmuteRequests((prevRequests) =>
        prevRequests.filter((prevReq) => !(prevReq?.id === req.id && prevReq?.value === req.value))
      );
  };

  // const allowMedia = (userId) => {
  //   dispatch(enableParticipantMedia({ participantId: userId, media: "audio" }));
  // }


  const deviceListChanged = async (devices) => {
    let selectedDeviceOld,
      audioInputDeviceOld,
      audioOuputDeviceOld,
      videoInputDeviceOld;
    if (oldDevices) {
      selectedDeviceOld = oldDevices.filter(
        (item) => item.deviceId === "default"
      );
      audioInputDeviceOld = selectedDeviceOld.find(
        (item) => item.kind === "audioinput"
      );
      audioOuputDeviceOld = selectedDeviceOld.find(
        (item) => item.kind === "audiooutput"
      );
      videoInputDeviceOld = oldDevices.filter(
        (item) => item.kind === "videoinput"
      );
    }

    const selectedDeviceNew = devices.filter(
      (item) => item.deviceId === "default"
    );
    const audioInputDeviceNew = selectedDeviceNew.find(
      (item) => item.kind === "audioinput"
    );
    const audioOuputDeviceNew = selectedDeviceNew.find(
      (item) => item.kind === "audiooutput"
    );
    const videoInputDeviceNew = selectedDeviceNew.find(
      (item) => item.kind === "videoinput"
    );

    if (
      audioInputDeviceNew?.label &&
      audioInputDeviceOld?.label &&
      audioInputDeviceNew?.label !== audioInputDeviceOld?.label
    ) {
      const audioTrack = localTracks.find(
        (track) => track.getType() === "audio"
      );
      const [newAudioTrack] = await SariskaMediaTransport.createLocalTracks({
        devices: ["audio"],
        micDeviceId: "default",
      });
      dispatch(setMicrophone("default"));
      await conference.replaceTrack(audioTrack, newAudioTrack);
      console.log("audio input update done!!!!");
    }

    if (
      videoInputDeviceNew?.label &&
      videoInputDeviceOld?.label &&
      videoInputDeviceNew?.label !== videoInputDeviceOld?.label
    ) {
      const videoTrack = localTracks.find(
        (track) => track.getType() === "video"
      );
      const [newVideoTrack] = await SariskaMediaTransport.createLocalTracks({
        devices: ["video"],
        cameraDeviceId: "default",
        resolution,
      });
      dispatch(setCamera("default"));
      await conference.replaceTrack(videoTrack, newVideoTrack);
      console.log("video input update done!!!!");
    }

    if (
      audioOuputDeviceNew?.label &&
      audioOuputDeviceOld?.label &&
      audioOuputDeviceNew?.label !== audioOuputDeviceOld?.label
    ) {
      SariskaMediaTransport.mediaDevices.setAudioOutputDevice(
        audioOuputDeviceNew.deviceId
      );
      console.log("audio output update done!!!!");
    }
    dispatch(setDevices(devices));
    oldDevices = devices;
  };

  const audioOutputDeviceChanged = (deviceId) => {
    SariskaMediaTransport.mediaDevices.setAudioOutputDevice(deviceId);
  };

  const destroy = async () => {
      if (conference.getParticipantCount() - 1 === 0) {
        try {
          await fetch(
            `https://whiteboard.sariska.io/boards/delete/${conference.connection.name}`,
            { method: "DELETE", mode: "cors" }
          );
        } catch (error) {
          console.log('error in deleting whiteboard', error);
        }
        try{
          await fetch(
            `https://etherpad.sariska.io/api/1/deletePad?apikey=27fd6f9e85c304447d3cc0fb31e7ba8062df58af86ac3f9437&padID=${conference.connection.name}`,
            { method: "GET", mode: "cors" }
          );  
        } catch (error) {
          console.log('error in deleting etherpad', error);
        }
      }
      
    if (conference?.isJoined()) {
      await conference?.leave();
    }
    for (const track of localTracks) {
      await track.dispose();
    }
    await connection?.disconnect();
    SariskaMediaTransport.mediaDevices.removeEventListener(
      SariskaMediaTransport.mediaDevices.DEVICE_LIST_CHANGED,
      deviceListChanged
    );
  };
console.log('prevrew', unmuteRequests)
  useEffect(() => {
    if (!conference) {
      return;
    }
    conference.addCommandListener('request-media-unmute', (data, id) => {
      if(conference.isModerator()){
        setUnmuteRequests((prevRequests) => [...prevRequests, {id, value: data?.value}]);
      }
    });

    conference.addCommandListener('unmute-media-approval', async(data, id) => {
      const {value, attributes: {participantId, variant}} = data;
      if (value === 'approved' && participantId === conference.myUserId()) {
          // Unmute the participant's audio track
          dispatch(
            showNotification({
              severity: "info",
              autoHide: true,
              message: `Request to enable ${variant} has been approved`,
            })
          );
          let track = localTracks.find((track) => track?.getType() === data.attributes?.variant);
          return await track.unmute();
      } 
      if(value === 'rejected' && participantId === conference.myUserId()) {
       return dispatch(
          showNotification({
            severity: "info",
            autoHide: true,
            message: `Request to enable ${variant} has been rejected`,
          })
    )}
  });

    conference.getParticipantsWithoutHidden().forEach((item) => {
      if (item._properties?.presenting === "start") {
        dispatch(
          showNotification({
            autoHide: true,
            message: `Screen sharing is being presenting by ${item._identity?.user?.name}`,
          })
        );
        dispatch(setPresenter({ participantId: item._id, presenter: true }));
      }

      if (item._properties?.handraise === "start") {
        dispatch(setRaiseHand({ participantId: item._id, raiseHand: true }));
      }
      if (item._properties?.annotation === "start") {
        dispatch(setAnnotator({ participantId: item._id, annotator: true }));
      }
      if (item._properties?.annotationTool === ANNOTATION_TOOLS.pen) {
        dispatch(addAnnotationFeature(SET_ANNOTATION_FEATURE, ANNOTATION_TOOLS.pen));
      }
      if (item._properties?.annotationTool === ANNOTATION_TOOLS.emoji) {
        dispatch(addAnnotationFeature(SET_ANNOTATION_FEATURE, ANNOTATION_TOOLS.emoji));
      }
      if (item._properties?.annotationTool === ANNOTATION_TOOLS.circle) {
        dispatch(addAnnotationFeature(SET_ANNOTATION_FEATURE, ANNOTATION_TOOLS.circle));
      }
      if (item._properties?.annotationTool === ANNOTATION_TOOLS.textbox) {
        dispatch(addAnnotationFeature(SET_ANNOTATION_FEATURE, ANNOTATION_TOOLS.textbox));
      }
      if (item._properties?.enableMedia === "audio") {
        dispatch(enableParticipantMedia({ participantId: item._id, media: "audio" }));
      }
      if (item._properties?.enableMedia === "video") {
        dispatch(enableParticipantMedia({ participantId: item._id, media: "video" }));
      }
      if (item._properties?.enableMedia === "") {
        dispatch(enableParticipantMedia({ participantId: item._id, media: "" }));
      }
      if (item._properties?.isModerator === "true") {
        dispatch(setModerator({ participantId: item._id, isModerator: true }));
      }

      if (item._properties?.resolution) {
        dispatch(
          setUserResolution({
            participantId: item._id,
            resolution: item._properties?.resolution,
          })
        );
      }
    });

    conference.addEventListener(
      SariskaMediaTransport.events.conference.TRACK_REMOVED,
      (track) => {
        dispatch(removeRemoteTrack(track));
      }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.TRACK_ADDED,
      (track) => {
        if (track.isLocal()) {
          return;
        }
        dispatch(addRemoteTrack(track));
      }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.FACIAL_EXPRESSION_ADDED,
      (expression) => {
        console.log("FACIAL_EXPRESSION_ADDED", expression);
      }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.SUBTITLES_RECEIVED,
      (id, name, text) => {
        dispatch(addSubtitle({ name, text }));
      }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.TRACK_MUTE_CHANGED,
      (track) => {
        dispatch(remoteTrackMutedChanged());
      }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.DOMINANT_SPEAKER_CHANGED,
      (id) => {
        setDominantSpeakerId(id);
      }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.LAST_N_ENDPOINTS_CHANGED,
      (enterIds, exitingIds) => {
        console.log("LAST_N_ENDPOINTS_CHANGED", enterIds, exitingIds);
      }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.PARTICIPANT_PROPERTY_CHANGED,
      (participant, key, oldValue, newValue) => {
        if (key === "presenting" && newValue === "start") {
          dispatch(
            showNotification({
              autoHide: true,
              message: `Screen sharing started by ${participant._identity?.user?.name}`,
            })
          );
          dispatch(
            setPresenter({ participantId: participant._id, presenter: true })
          );
        }

        if (key === "presenting" && newValue === "stop") {
          dispatch(
            setPresenter({ participantId: participant._id, presenter: false })
          );
        }

        if (key === PARTICIPANTS_LOCAL_PROPERTIES.HANDRAISE && newValue === "start") {
          dispatch(
            setRaiseHand({ participantId: participant._id, raiseHand: true })
          );
        }

        if (key === PARTICIPANTS_LOCAL_PROPERTIES.HANDRAISE && newValue === "stop") {
          dispatch(
            setRaiseHand({ participantId: participant._id, raiseHand: false })
          );
        }

        if (key === PARTICIPANTS_LOCAL_PROPERTIES.ANNOTATION && newValue === "start") {
          dispatch(
            setAnnotator({ participantId: participant._id, annotator: true })
          );
        }

        if (key === PARTICIPANTS_LOCAL_PROPERTIES.ANNOTATION && newValue === "stop") {
          dispatch(
            setAnnotator({ participantId: participant._id, annotator: false })
          );
        }
        if (key === PARTICIPANTS_LOCAL_PROPERTIES.ANNOTATION_TOOL && newValue === ANNOTATION_TOOLS.pen) {
          dispatch(addAnnotationFeature(SET_ANNOTATION_FEATURE, ANNOTATION_TOOLS.pen));
        }
        if (key === PARTICIPANTS_LOCAL_PROPERTIES.ANNOTATION_TOOL && newValue === ANNOTATION_TOOLS.emoji) {  
          dispatch(addAnnotationFeature(SET_ANNOTATION_FEATURE, ANNOTATION_TOOLS.emoji));
        }
        if (key === PARTICIPANTS_LOCAL_PROPERTIES.ANNOTATION_TOOL && newValue === ANNOTATION_TOOLS.circle) {
          dispatch(addAnnotationFeature(SET_ANNOTATION_FEATURE, ANNOTATION_TOOLS.circle));
        }
        if (key === PARTICIPANTS_LOCAL_PROPERTIES.ANNOTATION_TOOL && newValue === ANNOTATION_TOOLS.textbox) {
          dispatch(addAnnotationFeature(SET_ANNOTATION_FEATURE, ANNOTATION_TOOLS.textbox));
        }

        if (key === PARTICIPANTS_LOCAL_PROPERTIES.ANNOTATION_TOOL && newValue === "") {
          dispatch(addAnnotationFeature(SET_ANNOTATION_FEATURE, ''));
        }

        if (key === PARTICIPANTS_LOCAL_PROPERTIES.ENABLE_MEDIA && newValue === "audio") {
          dispatch(
            enableParticipantMedia({ participantId: participant._id, media: "audio" })
          );
        }
        if (key === PARTICIPANTS_LOCAL_PROPERTIES.ENABLE_MEDIA && newValue === "video") {
          dispatch(
            enableParticipantMedia({ participantId: participant._id, media: "video" })
          );
        }
        if (key === PARTICIPANTS_LOCAL_PROPERTIES.ENABLE_MEDIA && newValue === "") {
          dispatch(
            enableParticipantMedia({ participantId: participant._id, media: "" })
          );
        }

        if (key === "isModerator" && newValue === "true") {
          dispatch(
            setModerator({ participantId: participant._id, isModerator: true })
          );
        }

        if (key === "resolution") {
          dispatch(
            setUserResolution({
              participantId: participant._id,
              resolution: newValue,
            })
          );
        }
      }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.LOBBY_USER_JOINED,
      (id, displayName) => {
        new Audio(
          "https://sdk.sariska.io/knock_0b1ea0a45173ae6c10b084bbca23bae2.ogg"
        ).play();
        setLobbyUser((lobbyUser) => [...lobbyUser, { id, displayName }]);
      }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.MESSAGE_RECEIVED,
      (id, text, ts) => {
        dispatch(
          addMessage({
            text: text,
            user: getUserById(id, conference),
            time: new Date(),
          })
        );
        if (id !== conference.myUserId()) {
          dispatch(unreadMessage(1));
        }
      }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.NOISY_MIC,
      () => {
        dispatch(
          showNotification({
            autoHide: true,
            message: "Your mic seems to be noisy",
            severity: "info",
          })
        );
      }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.TALK_WHILE_MUTED,
      () => {
        dispatch(
          showNotification({
            autoHide: true,
            message: "Trying to speak?  your are muted!!!",
            severity: "info",
          })
        );
      }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.NO_AUDIO_INPUT,
      () => {
        dispatch(
          showNotification({
            autoHide: true,
            message: "Looks like device has no audio input",
            severity: "warning",
          })
        );
      }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.TRACK_AUDIO_LEVEL_CHANGED,
      (participantId, audioLevel) => {
        dispatch(setAudioLevel({ participantId, audioLevel }));
      }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.CONNECTION_INTERRUPTED,
      () => {
        dispatch(
          showNotification({
            message:
              "You lost your internet connection. Trying to reconnect...",
            severity: "info",
          })
        );
        ingoreFirstEvent = false;
      }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.ENDPOINT_MESSAGE_RECEIVED,
      async (participant, data) => {
        if (
          data.event === "LOBBY-ACCESS-GRANTED" ||
          data.event === "LOBBY-ACCESS-DENIED"
        ) {
          setLobbyUser((lobbyUser) =>
            lobbyUser.filter((item) => item.displayName !== data.name)
          );
        }
      }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.CONNECTION_RESTORED,
      () => {
        if (ingoreFirstEvent) {
          return;
        }
        dispatch(
          showNotification({
            message: "Your Internet connection was restored",
            autoHide: true,
            severity: "info",
          })
        );
      }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.ANALYTICS_EVENT_RECEIVED,
      (payload) => {
        const { name, action, actionSubject, source, attributes } = payload;
        ReactGA.event({
          category: name,
          action,
          label: actionSubject,
        });
      }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.KICKED,
      (id) => {
        // if a user kicked by moderator
        // kicked participant id
      }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.PARTICIPANT_KICKED,
      (actorParticipant, kickedParticipant, reason) => {}
    );

    preloadIframes(conference);
    SariskaMediaTransport.effects.createRnnoiseProcessor();
    SariskaMediaTransport.mediaDevices.addEventListener(
      SariskaMediaTransport.events.mediaDevices.DEVICE_LIST_CHANGED,
      deviceListChanged
    );
    SariskaMediaTransport.mediaDevices.addEventListener(
      SariskaMediaTransport.events.mediaDevices.AUDIO_OUTPUT_DEVICE_CHANGED,
      audioOutputDeviceChanged
    );

    window.addEventListener("beforeunload", destroy);

    return () => {
      destroy();
    };
  }, [conference]);

  useEffect(() => {
    if (!conference) {
      return;
    }
    const userLeft = (id) => {
      if (id === dominantSpeakerId) {
        setDominantSpeakerId(null);
      }
      if (id === layout.pinnedParticipant.participantId) {
        dispatch(setPinParticipant(null));
      }

      if (layout.presenterParticipantIds.find((item) => item === id)) {
        dispatch(setPresenter({ participantId: id, presenter: null }));
      }

      if (layout.raisedHandParticipantIds[id]) {
        dispatch(setRaiseHand({ participantId: id, raiseHand: null }));
      }
      if (annotation.annotator[id]) {
        dispatch(setAnnotator({ participantId: id, annotator: null }));
        dispatch(addAnnotationFeature(SET_ANNOTATION_FEATURE, ''));
      }
      dispatch(participantLeft(id));
    };
    conference.addEventListener(
      SariskaMediaTransport.events.conference.USER_LEFT,
      userLeft
    );
    return () => {
      conference.removeEventListener(
        SariskaMediaTransport.events.conference.USER_LEFT,
        userLeft
      );
      conference.removeCommandListener('request-media-unmute', () => console.log('removed request-media-unmute command'))
    };
  }, [conference, layout]);

  useEffect(() => {
    SariskaMediaTransport.setNetworkInfo({ isOnline });
  }, [isOnline]);

  // useEffect(()=> {
  //   if(isMobileOrTab()) {
  //     if(layout.type === SPEAKER)
  //     dispatch(setLayout(GRID));
  //   }
  // },[])
  
  if (!conference || !conference.isJoined()) {
    return <Home />;
  }
  let justifyContent = "space-between";
  let paddingTop = 16;
  if (layout.mode === ENTER_FULL_SCREEN_MODE) {
    justifyContent = "space-around";
    paddingTop = 0;
  }
  
  return (
    <Box
      style={{ justifyContent, paddingTop: paddingTop }}
      className={classes.root}
    >
      {layout.type === SPEAKER && (
        <SpeakerLayout dominantSpeakerId={dominantSpeakerId} />
      )}
      {/* {layout.type === GRID && (
        <GridLayout dominantSpeakerId={dominantSpeakerId} />
      )} */}
      
      {layout.type === PRESENTATION && (
        <PresentationLayout dominantSpeakerId={dominantSpeakerId} />
      )}
      
      <ActionButtons dominantSpeakerId={dominantSpeakerId} />
      {lobbyUser.map((item) => (
        <PermissionDialog
          denyLobbyAccess={denyLobbyAccess}
          allowLobbyAccess={allowLobbyAccess}
          userId={item.id}
          displayName={item.displayName}
          text={`${item.displayName ? item.displayName : 'Participant'} wants to join`}
        />
      ))}
      {unmuteRequests?.map((req) => (
        <PermissionDialog
        denyLobbyAccess={() => rejectUnmuteAccess(req)}
        allowLobbyAccess={() => allowUnmuteAccess(req)}
        userId={req?.id}
        text={`${getParticipantName(conference, req?.id) ? getParticipantName(conference, req?.id) : 'Participant'} have requested to unmute ${req?.value}`}
      />
            ))}
      <SnackbarBox notification={notification} />
      <ReconnectDialog open={layout.disconnected === "lost"} />
      <Notification snackbar={snackbar} />
    </Box>
  );
};

export default Meeting;
