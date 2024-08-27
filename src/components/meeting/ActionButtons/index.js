import {
  Badge,
  Box,
  Button,
  Drawer,
  Hidden,
  makeStyles,
  Tooltip,
  Typography,
} from "@material-ui/core";
import React, { useEffect, useRef, useState } from "react";
import SariskaMediaTransport from "sariska-media-transport";
import { color } from "../../../assets/styles/_color";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import classnames from "classnames";
import CallEndIcon from "@material-ui/icons/CallEnd";
import ColorLensIcon from '@material-ui/icons/ColorLens';
import GestureIcon from '@material-ui/icons/Gesture';
import SentimentSatisfiedOutlinedIcon from '@material-ui/icons/SentimentSatisfiedOutlined';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import RadioButtonUncheckedOutlinedIcon from '@material-ui/icons/RadioButtonUncheckedOutlined';
import TextFieldsIcon from '@material-ui/icons/TextFields';
import LayersClearIcon from '@material-ui/icons/LayersClear';
import MicIcon from "@material-ui/icons/Mic";
import MicOffIcon from "@material-ui/icons/MicOff";
import VideocamIcon from "@material-ui/icons/Videocam";
import VideocamOffIcon from "@material-ui/icons/VideocamOff";
import ScreenShareIcon from "@material-ui/icons/ScreenShare";
import StopScreenShareIcon from '@material-ui/icons/StopScreenShare';
import PanToolIcon from "@material-ui/icons/PanTool";
import GroupIcon from "@material-ui/icons/Group";
import ChatIcon from "@material-ui/icons/Chat";
import ViewListIcon from "@material-ui/icons/ViewList";
import ViewComfyIcon from "@material-ui/icons/ViewComfy";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import CloseIcon from '@material-ui/icons/Close';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import {
  addLocalTrack,
  localTrackMutedChanged,
  removeLocalTrack,
} from "../../../store/actions/track";
import {
  ENTER_FULL_SCREEN_MODE,
  EXIT_FULL_SCREEN_MODE,
  GRID,
  PRESENTATION,
  SHARED_DOCUMENT,
  SPEAKER,
  RECORDING_ERROR_CONSTANTS,
  WHITEBOARD,
  GET_PRESENTATION_STATUS,
  RECEIVED_PRESENTATION_STATUS,
  streamingMode,
  PARTICIPANTS_LOCAL_PROPERTIES,
  ANNOTATION_TOOLS,
} from "../../../constants";
import {
  setFullScreen,
  setLayout,
  setPresenter,
  setPresentationtType,
} from "../../../store/actions/layout";
import { clearAllReducers } from "../../../store/actions/conference";
import {
  exitFullscreen,
  formatAMPM,
  getRandomColor,
  isFullscreen,
  isModerator,
  isModeratorLocal,
  requestFullscreen,
  startStreamingInSRSMode,
  stopStreamingInSRSMode,
} from "../../../utils";
import classNames from "classnames";
import ParticipantDetails from "../../shared/ParticipantDetails";
import { unreadMessage } from "../../../store/actions/chat";
import { withStyles } from "@material-ui/styles";
import ChatPanel from "../../shared/Chat";
import MoreAction from "../../shared/MoreAction";
import DrawerBox from "../../shared/DrawerBox";
import { addSubtitle } from "../../../store/actions/subtitle";
import { showSnackbar } from "../../../store/actions/snackbar";
import StyledTooltip from "../../shared/StyledTooltip";
import LiveStreamingDetails from "../../shared/LiveStreamingDetails";
import { showNotification } from "../../../store/actions/notification";
import googleApi from "../../../utils/google-apis";
import LiveStreamDialog from "../../shared/LiveStreamDialog";
import { SET_ANNOTATION_FEATURE, SET_ANNOTATION_STYLE } from "../../../store/actions/types";
import { addAnnotationFeature, clearAllAnnotation, removeAnnotationFeature, setAnnotator, updateAnnotationStyle } from "../../../store/actions/annotation";

const StyledBadge = withStyles((theme) => ({
  badge: {
    background: color.primary,
    top: 6,
    right: 10,
  },
}))(Badge);

const useStyles = makeStyles((theme) => ({
  root: {
    height: "44px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    bottom: "16px",
    width: "100%",
    position: "fixed",
    color: color.white,
    [theme.breakpoints.down("md")]: {
      bottom: "0px",
      background: color.secondaryDark,
      height: '72px'
    },
    "& svg": {
      padding: "8px",
      borderRadius: "8px",
      marginRight: "2px",
      [theme.breakpoints.down("md")]: {
        background: color.secondary,
        borderRadius: '50%',
        marginRight: "6px !important",
      },
      "&:hover": {
        opacity: "0.8",
        cursor: "pointer",
        color: color.primaryLight,
      },
    },
  },
  active: {
    opacity: "0.8",
    cursor: "pointer",
    color: color.red,
  },
  panTool: {
    fontSize: "18px",
    padding: "12px !important",
    marginRight: "12px",
    [theme.breakpoints.down("md")]: {
      marginRight: "6px !important",
    },
  },
  infoContainer: {
    marginLeft: "20px",
    display: "flex",
    width: "350px",
  },
  separator: {
    marginLeft: "10px",
    marginRight: "10px",
  },
  screenShare: {
    padding: "8px",
    marginRight: "2px",
    borderRadius: "8px",
    [theme.breakpoints.down("md")]: {
      background: color.secondary,
      borderRadius: '50%',
      marginRight: "6px",
    },
  },
  permissions: {
    display: "flex",
    alignItems: "center",
    padding: "0px 5px",
    backgroundColor: color.secondary,
    borderRadius: "7.5px",
    marginRight: "24px",
    [theme.breakpoints.down("sm")]: {
      backgroundColor: "transparent",
      margin: 'auto',
      position: 'relative',
      bottom: '0px'
    },
  },
  end: {
    background: `${color.red} !important`,
    borderColor: `${color.red} !important`,
    padding: "2px 12px !important",
    textAlign: "center",
    borderRadius: "30px !important",
    width: "42px",
    fontSize: "36px",
    marginRight: 0,
    "&:hover": {
      opacity: "0.8",
      background: `${color.red} !important`,
      cursor: "pointer",
      color: `${color.white} !important`,
    },
    [theme.breakpoints.down("sm")]: {
      padding: "8px !important",
      width: "40px",
      fontSize: "24px",
    },
  },
  liveBox: {
    display: 'flex',
    alignItems: 'center',
    border: `1px solid ${color.red}`,
    borderRadius: '30px',
    paddingLeft: '8px',
    paddingRight: '8px',
    marginLeft: '8px',
    '&:hover': {
      cursor: 'pointer'
    }
  },
  dot: {
    padding: '2px !important',
    fontSize: '1rem'
  },
  live: {
    color: color.red,
    padding: '6px 6px 6px 0',
    minWidth: '36px',
  },
  subIcon: {
    border: "none !important",
    marginRight: "0px !important",
    marginLeft: "4px !important",
  },
  more: {
    marginRight: "0px !important",
  },
  drawer: {
    "& .MuiDrawer-paper": {
      overflowX: "hidden",
      top: "16px",
      bottom: "80px",
      right: "16px",
      borderRadius: "10px",
      height: "89%",
      width: "360px",
      backgroundColor: color.secondary,
      overflowY: "auto",
    },
  },
  list: {
    padding: theme.spacing(3, 3, 0, 3),
    height: "100%",
  },
  title: {
    color: color.white,
    fontWeight: "400",
    marginLeft: "8px",
    fontSize: "28px",
    lineHeight: "1",
    [theme.breakpoints.down("sm")]: {
      marginLeft: 0,
      fontSize: '24px'
    }
  },
  participantHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    "& svg": {
      color: color.white
    }
  },
  chatList: {
    height: "100%",
    padding: theme.spacing(3, 3, 0, 3),
  },
  chat: {
    marginRight: "0px !important",
    fontSize: "20px",
    padding: "10px !important",
    [theme.breakpoints.down("md")]: {
      marginRight: '6px !important'
    }
  },
  moreActionList: {
    height: "100%",
    width: "260px",
    padding: theme.spacing(1, 0, 0, 0),
    backgroundColor: color.secondary,
  },
}));

const ActionButtons = ({ dominantSpeakerId }) => {
  const history = useHistory();
  const audioTrack = useSelector((state) => state.localTrack).find((track) =>
    track.isAudioTrack()
  );
  const videoTrack = useSelector((state) => state.localTrack).find((track) =>
    track.isVideoTrack()
  );
  const classes = useStyles();
  const dispatch = useDispatch();
  const conference = useSelector((state) => state.conference);
  const myUserId = conference.myUserId()
  const localTracks = useSelector((state) => state.localTrack);
  const [presenting, setPresenting] = useState(false);
  const [time, setTime] = useState(formatAMPM(new Date()));
  const profile = useSelector((state) => state.profile);
  const layout = useSelector((state) => state.layout);
  const annotation = useSelector((state) => state.annotation);
  const unread = useSelector((state) => state.chat.unreadMessage);
  const [raiseHand, setRaiseHand] = useState(false);
  const [annotatingColor, setAnnotatingColor] = useState('#fff');
  const [featureStates, setFeatureStates] = useState({});
  const [chatState, setChatState] = React.useState({
    right: false,
  });
  const [liveState, setLiveState] = React.useState({
    right: false,
  });
  const [participantState, setParticipantState] = React.useState({
    right: false,
  });
  const [moreActionState, setMoreActionState] = React.useState({
    right: false,
  });
  const initialAnnotationState = {
    pen: false,
    circle: false, 
    textBox: false,
    emoji: false
  }
  const { feature } = useSelector(state => state.annotation);
  const [openLivestreamDialog, setOpenLivestreamDialog] = useState(false);
  const [broadcasts, setBroadcasts] = useState([]);
  const [streamingUrls, setStreamingUrls] = useState([]);
  const [streamKey, setStreamKey] = useState('');

  const skipResize = false;
  const streamingSession = useRef(null);
  
  const action = (actionData) => {
    featureStates[actionData.key] = actionData.value;
    setFeatureStates({ ...featureStates });
  };
  
  const muteAudio = async () => {
    await audioTrack?.mute();
    dispatch(localTrackMutedChanged());
  };

  const unmuteAudio = async () => {
    await audioTrack?.unmute();
    dispatch(localTrackMutedChanged());
  };

  const muteVideo = async () => {
    await videoTrack?.mute();
    dispatch(localTrackMutedChanged());
  };

  const unmuteVideo = async () => {
    await videoTrack?.unmute();
    dispatch(localTrackMutedChanged());
  };

  const removeLocalParticipantProperties = () => {
    conference.setLocalParticipantProperty(PARTICIPANTS_LOCAL_PROPERTIES.ANNOTATION, "stop");
    conference.setLocalParticipantProperty(PARTICIPANTS_LOCAL_PROPERTIES.ANNOTATION_TOOL, "");
  }

  const updateColor = () => {
    if(!isModeratorLocal(conference)) {
      return dispatch(
        showNotification({
          severity: "error",
          autoHide: true,
          message: "You are not moderator!!",
        })
      );
    };
    let randomColor = getRandomColor();
    setAnnotatingColor(randomColor);
    dispatch(
      showNotification({
        severity: "info",
        autoHide: true,
        message: `Color of Annotation changed to ${randomColor}`,
      })
    );
    if(annotation.feature === ANNOTATION_TOOLS.pen){
      dispatch(updateAnnotationStyle(SET_ANNOTATION_STYLE, randomColor));
    }else{
      removeLocalParticipantProperties();
      dispatch(updateAnnotationStyle(SET_ANNOTATION_STYLE, randomColor));
    }
  }

  const startAnnotation = (tool) => {
    if(!isModeratorLocal(conference)) {
      return dispatch(
        showNotification({
          severity: "error",
          autoHide: true,
          message: "You are not moderator!!",
        })
      );
    };
      dispatch(
        showNotification({
          severity: "info",
          autoHide: true,
          message: `Successfully selected the ${tool.toLowerCase()}`,
        })
      );

    dispatch(addAnnotationFeature(SET_ANNOTATION_FEATURE, tool));
    dispatch(setAnnotator({ participantId: myUserId, annotator: true, annotationTool: tool}));
    conference.setLocalParticipantProperty(PARTICIPANTS_LOCAL_PROPERTIES.ANNOTATION, "start");
    conference.setLocalParticipantProperty(PARTICIPANTS_LOCAL_PROPERTIES.ANNOTATION_TOOL, tool);
  }

  const stopAnnotation = () => {
    if(!isModeratorLocal(conference)) {
      return dispatch(
        showNotification({
          severity: "error",
          autoHide: true,
          message: "You are not moderator!!",
        })
      );
    };
    dispatch(
      showNotification({
        severity: "info",
        autoHide: true,
        message: `Successfully stopped the annotation`,
      })
    );
    dispatch(removeAnnotationFeature(SET_ANNOTATION_FEATURE));
    dispatch(setAnnotator({ participantId: myUserId, annotator: false, annotationTool: '' }));
    removeLocalParticipantProperties()
  }

  // const enableEmoji = () => {
  //   setIsAnnotation(prev => ({...prev, emoji: true}));
  //   dispatch(addAnnotationFeature(SET_ANNOTATION_FEATURE, ANNOTATION_TOOLS.emoji));
  //   dispatch(setAnnotator({ participantId: myUserId, annotator: true, annotationTool: ANNOTATION_TOOLS.emoji }));
  //   conference.setLocalParticipantProperty(PARTICIPANTS_LOCAL_PROPERTIES.ANNOTATION, "start");
  //   conference.setLocalParticipantProperty(PARTICIPANTS_LOCAL_PROPERTIES.ANNOTATION_TOOL, "emoji");
  // }

  // const disableEmoji = () => {
  //   setIsAnnotation(prev => ({...prev, emoji: false}));
  //   dispatch(removeAnnotationFeature(SET_ANNOTATION_FEATURE));
  //   dispatch(setAnnotator({ participantId: myUserId, annotator: false, annotationTool: '' }));
  //   conference.setLocalParticipantProperty(PARTICIPANTS_LOCAL_PROPERTIES.ANNOTATION, "stop");
  //   conference.setLocalParticipantProperty(PARTICIPANTS_LOCAL_PROPERTIES.ANNOTATION_TOOL, "");
  // }
  
  const handleClearAllAnnotation = () => {
    if(!isModeratorLocal(conference)) {
      return dispatch(
        showNotification({
          severity: "error",
          autoHide: true,
          message: "You are not moderator!!",
        })
      );
    };
    dispatch(
      showNotification({
        severity: "info",
        autoHide: true,
        message: `Successfully cleared the annotation`,
      })
    );
    dispatch(clearAllAnnotation(SET_ANNOTATION_FEATURE, myUserId));
    dispatch(setAnnotator({ participantId: myUserId, annotator: false, annotationTool: '' }));
    removeLocalParticipantProperties();
   // setTimeout(()=>setAnnotationTool(''), 1000);
  }

  const shareScreen = async () => {
    let desktopTrack;
    try {
      const tracks = await SariskaMediaTransport.createLocalTracks({
        resolution: 720,
        devices: ["desktop"],
      });
      desktopTrack = tracks.find((track) => track.videoType === "desktop");
    } catch (e) {
      dispatch(
        showSnackbar({
          autoHide: true,
          message:
            "Oops, Something wrong with screen sharing permissions. Try reload",
        })
      );
      return;
    }
    await conference.addTrack(desktopTrack);
    desktopTrack.addEventListener(
      SariskaMediaTransport.events.track.LOCAL_TRACK_STOPPED,
      async () => {
        stopPresenting();
      }
    );
    conference.setLocalParticipantProperty("presenting", "start");
    dispatch(addLocalTrack(desktopTrack));
    dispatch(
      setPresenter({ participantId: conference.myUserId(), presenter: true })
    );
    setPresenting(true);
  };

  const stopPresenting = async () => {
    const desktopTrack = localTracks.find(
      (track) => track.videoType === "desktop"
    );
    await conference.removeTrack(desktopTrack);
    dispatch(
      setPresenter({ participantId: conference.myUserId(), presenter: false })
    );
    dispatch(removeLocalTrack(desktopTrack));
    conference.setLocalParticipantProperty("presenting", "stop");
    setPresenting(false);
  };

  const startRaiseHand = () => {
    conference.setLocalParticipantProperty(PARTICIPANTS_LOCAL_PROPERTIES.HANDRAISE, "start");
    setRaiseHand(true);
  };

  const stopRaiseHand = () => {
    conference.setLocalParticipantProperty(PARTICIPANTS_LOCAL_PROPERTIES.HANDRAISE, "stop");
    setRaiseHand(false);
  };

  const startStreaming = async () => {
    if (featureStates.streaming) {
      return;
    }

    if (conference?.getRole() === "none") {
      return dispatch(
        showNotification({
          severity: "info",
          autoHide: true,
          message: "You are not moderator!!",
        })
      );
    }
    if(streamingMode === 'srs'){
      dispatch(
        showSnackbar({
          severity: "info",
          message: "Starting Live Streaming",
          autoHide: false,
        })
      );
      const streamingResponse = await startStreamingInSRSMode(profile.meetingTitle, streamKey);
       if(streamingResponse.started){
        setStreamingUrls(streamingResponse);
          conference.setLocalParticipantProperty("streaming", true);
            dispatch(
              showSnackbar({ autoHide: true, message: "Live streaming started" })
            );
          action({ key: "streaming", value: true }); 
       } 
    }else{
      await googleApi.signInIfNotSignedIn();
      let youtubeBroadcasts;

      try {
        youtubeBroadcasts = await googleApi.requestAvailableYouTubeBroadcasts();
      } catch (e) {
        dispatch(
          showNotification({
            autoHide: true,
            message: e?.result?.error?.message,
            severity: "info",
          })
        );
        return;
      }

      if (youtubeBroadcasts.status !== 200) {
        dispatch(
          showNotification({
            autoHide: true,
            message: "Could not fetch YouTube broadcasts",
            severity: "info",
          })
        );
      }
      setBroadcasts(youtubeBroadcasts.result.items);
      setOpenLivestreamDialog(true);
    }
  };

  const createLiveStream = async () => {
    const title = `test__${Date.now()}`;
    const resposne = await googleApi.createLiveStreams(title);

    const streamName = resposne.cdn?.ingestionInfo?.streamName;
    if (!streamName) {
      return;
    }

    dispatch(
      showSnackbar({
        severity: "info",
        message: "Starting Live Streaming",
        autoHide: false,
      })
    );
    if(streamingMode === 'srs'){
       const streamingResponse = await startStreamingInSRSMode(profile.meetingTitle);
       if(streamingResponse.started){
          conference.setLocalParticipantProperty("streaming", true);
            dispatch(
              showSnackbar({ autoHide: true, message: "Live streaming started" })
            );
          action({ key: "streaming", value: true }); 
       }
    }else{
      const session = await conference.startRecording({
        mode: SariskaMediaTransport.constants.recording.mode.STREAM,
        streamId: `rtmp://a.rtmp.youtube.com/live2/${streamName}`,
      });
      streamingSession.current = session;
    }
    setOpenLivestreamDialog(false);
  };

  const selectedBroadcast = async (boundStreamID) => {
    const selectedStream =
      await googleApi.requestLiveStreamsForYouTubeBroadcast(boundStreamID);

    if (selectedStream.status !== 200) {
      dispatch(
        showNotification({
          autoHide: true,
          message: "No live streams found",
          severity: "error",
        })
      );
      return;
    }

    dispatch(
      showSnackbar({
        severity: "info",
        message: "Starting Live Streaming",
        autoHide: false,
      })
    );
    const streamName =
      selectedStream.result.items[0]?.cdn?.ingestionInfo?.streamName;
    setOpenLivestreamDialog(false);

      const session = await conference.startRecording({
        mode: SariskaMediaTransport.constants.recording.mode.STREAM,
        streamId: `rtmp://a.rtmp.youtube.com/live2/${streamName}`,
      });
      streamingSession.current = session;
  };

  const stopStreaming = async () => {
    if (!featureStates.streaming) {
      return;
    }
    if (conference?.getRole() === "none") {
      return dispatch(
        showNotification({
          severity: "info",
          autoHide: true,
          message: "You are not moderator!!",
        })
      );
    }
    if(streamingMode === 'srs'){
     const streamingResponse = await stopStreamingInSRSMode(profile.meetingTitle);
      if(!streamingResponse.started){
        setStreamingUrls({});
          conference.removeLocalParticipantProperty("streaming");
            dispatch(
              showSnackbar({ autoHide: true, message: "Live streaming stopped" })
            );
          action({ key: "streaming", value: false });
      }
    }else{
      await conference.stopRecording(
        localStorage.getItem("streaming_session_id")
      );
    }
  };

  const closeLiveStreamDialog = () => {
    setOpenLivestreamDialog(false);
  };

  const toggleLiveDrawer = (anchor, open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setLiveState({ ...liveState, [anchor]: open });
  };
  const toggleParticipantDrawer = (anchor, open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setParticipantState({ ...participantState, [anchor]: open });
  };

  const handleStreamKeyChange=(e)=>{
    setStreamKey(e.target.value);
  }
  
  const liveList = (anchor) => (
    <>
      <Box className={classes.participantHeader}>
        <Typography variant="h6" className={classes.title}>
          Live Streaming Details
        </Typography>
        <Hidden mdUp>
          <CloseIcon onClick={toggleLiveDrawer("right", false)}/>
        </Hidden>
      </Box>
      <LiveStreamingDetails streamingUrls={streamingUrls} featureStates={featureStates} stopStreaming={stopStreaming} startStreaming={startStreaming} handleStreamKeyChange={handleStreamKeyChange} streamKey={streamKey}/>
    </>
  );

  const participantList = (anchor) => (
    <>
      <Box className={classes.participantHeader}>
        <Typography variant="h6" className={classes.title}>
          Participants
        </Typography>
        <Hidden mdUp>
          <CloseIcon onClick={toggleParticipantDrawer("right", false)}/>
        </Hidden>
      </Box>
      <ParticipantDetails />
    </>
  );

  const toggleChatDrawer = (anchor, open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setChatState({ ...chatState, [anchor]: open });
    dispatch(unreadMessage(0));
  };

  const chatList = (anchor) => (
    <>
      <Box className={classes.participantHeader}>
        <Typography variant="h6" className={classes.title}>
          Messages
        </Typography>
        <Hidden mdUp>
          <CloseIcon onClick={toggleChatDrawer("right", false)}/>
        </Hidden>
      </Box>
      <ChatPanel />
    </>
  );

  const toggleFullscreen = () => {
    if (isFullscreen()) {
      exitFullscreen();
    } else {
      requestFullscreen();
    }
  };

  const AddFShandler = () => {
    if (isFullscreen()) {
      dispatch(setFullScreen(ENTER_FULL_SCREEN_MODE));
    } else {
      dispatch(setFullScreen(EXIT_FULL_SCREEN_MODE));
    }
  };

  const addFullscreenListeners = () => {
    document.addEventListener("fullscreenchange", AddFShandler);
    document.addEventListener("webkitfullscreenchange", AddFShandler);
    document.addEventListener("mozfullscreenchange", AddFShandler);
    document.addEventListener("MSFullscreenChange", AddFShandler);
  };

  const removeFullscreenListeners = () => {
    document.removeEventListener("fullscreenchange", AddFShandler);
    document.removeEventListener("webkitfullscreenchange", AddFShandler);
    document.removeEventListener("mozfullscreenchange", AddFShandler);
    document.removeEventListener("MSFullscreenChange", AddFShandler);
  };

  const resize = () => {
    if (skipResize) {
      return;
    }
    if (window.innerHeight == window.screen.height) {
      dispatch(setFullScreen(ENTER_FULL_SCREEN_MODE));
    } else {
      dispatch(setFullScreen(EXIT_FULL_SCREEN_MODE));
    }
  };

  const toggleView = () => {
    if (layout.type === PRESENTATION || layout.type === SPEAKER) {
      dispatch(setLayout(GRID));
    } else if (featureStates.whiteboard || featureStates.sharedDocument) {
      dispatch(setLayout(PRESENTATION));
    } else {
      dispatch(setLayout(SPEAKER));
    }
  };

  const toggleMoreActionDrawer = (anchor, open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setMoreActionState({ ...moreActionState, [anchor]: open });
  };

  const moreActionList = (anchor) => (
    <>
      <MoreAction
        dominantSpeakerId={dominantSpeakerId}
        action={action}
        featureStates={featureStates}
        setLayoutAndFeature={setLayoutAndFeature}
        onClick={toggleMoreActionDrawer("right", false)}
        participantOnClick = {toggleParticipantDrawer("right", true)}
        participantTitle = "Participants Details"
        chatOnClick = {toggleChatDrawer("right", true)}
        chatTitle="Chat Box"
        layoutOnClick = {toggleView}
      />
    </>
  );

  const setLayoutAndFeature = (layoutType, presentationType, actionData) => {
    dispatch(setLayout(layoutType));
    dispatch(setPresentationtType({ presentationType }));
    action(actionData);
  };

  useEffect(() => {
    // let doit;
    // document.documentElement.addEventListener('mouseleave', () => skipResize = false);
    // document.documentElement.addEventListener('mouseenter', () => skipResize = true)

    const interval = setInterval(() => {
      setTime(formatAMPM(new Date()));
    }, 1000);
    document.addEventListener("dblclick", toggleFullscreen);
    // window.addEventListener("resize", ()=> {
    //   clearTimeout(doit);
    //   doit = setTimeout(resize, 250);
    // });
    addFullscreenListeners();
    return () => {
      document.removeEventListener("dblclick", toggleFullscreen);
      clearInterval(interval);
      removeFullscreenListeners();
      // window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    if (conference.getParticipantsWithoutHidden()[0]?._id) {
      setTimeout(
        () =>
          conference.sendEndpointMessage(
            conference.getParticipantsWithoutHidden()[0]?._id,
            { action: GET_PRESENTATION_STATUS }
          ),
        1000
      );
    }
    const checkPresentationStatus = (participant, payload) => {
      if (payload?.action === GET_PRESENTATION_STATUS) {
        conference.sendEndpointMessage(participant._id, {
          action: RECEIVED_PRESENTATION_STATUS,
          status: featureStates.whiteboard
            ? "whiteboard"
            : featureStates.sharedDocument
            ? "sharedDocument"
            : "none",
        });
      }

      if (payload?.action === RECEIVED_PRESENTATION_STATUS) {
        if (payload.status === "whiteboard") {
          setLayoutAndFeature(PRESENTATION, WHITEBOARD, {
            key: "whiteboard",
            value: true,
          });
          action({ key: "sharedDocument", value: false });
        }

        if (payload.status === "sharedDocument") {
          setLayoutAndFeature(PRESENTATION, SHARED_DOCUMENT, {
            key: "sharedDocument",
            value: true,
          });
          action({ key: "whiteboard", value: false });
        }
      }
    };
    conference.addEventListener(
      SariskaMediaTransport.events.conference.ENDPOINT_MESSAGE_RECEIVED,
      checkPresentationStatus
    );
    return () => {
      conference.removeEventListener(
        SariskaMediaTransport.events.conference.ENDPOINT_MESSAGE_RECEIVED,
        checkPresentationStatus
      );
    };
  }, [featureStates.whiteboard, featureStates.sharedDocument]);

  useEffect(() => {
    conference.getParticipantsWithoutHidden().forEach((item) => {
      if (item._properties?.transcribing) {
        action({ key: "caption", value: true });
      }

      if (item._properties?.recording) {
        action({ key: "recording", value: true });
      }

      if (item._properties?.streaming) {
        action({ key: "streaming", value: true });
      }

      if (item._properties?.whiteboard === "start") {
        setLayoutAndFeature(PRESENTATION, WHITEBOARD, {
          key: "whiteboard",
          value: true,
        });
      }

      if (item._properties?.sharedDocument === "start") {
        setLayoutAndFeature(PRESENTATION, SHARED_DOCUMENT, {
          key: "sharedDocument",
          value: true,
        });
      }
    });

    conference.addEventListener(
      SariskaMediaTransport.events.conference.PARTICIPANT_PROPERTY_CHANGED,
      (participant, key, oldValue, newValue) => {
        if (key === "whiteboard" && newValue === "start") {
          setLayoutAndFeature(PRESENTATION, WHITEBOARD, {
            key: "whiteboard",
            value: true,
          });
        }

        if (key === "whiteboard" && newValue === "stop") {
          setLayoutAndFeature(SPEAKER, null, {
            key: "whiteboard",
            value: false,
          });
        }

        if (key === "sharedDocument" && newValue === "stop") {
          setLayoutAndFeature(SPEAKER, null, {
            key: "sharedDocument",
            value: false,
          });
        }

        if (key === "sharedDocument" && newValue === "start") {
          setLayoutAndFeature(PRESENTATION, SHARED_DOCUMENT, {
            key: "sharedDocument",
            value: true,
          });
        }
      }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.TRANSCRIPTION_STATUS_CHANGED,
      (status) => {
        if (status === "ON") {
          conference.setLocalParticipantProperty("transcribing", true);
          dispatch(
            showSnackbar({ autoHide: true, message: "Caption started" })
          );
          action({ key: "caption", value: true });
        }

        if (status === "OFF") {
          conference.removeLocalParticipantProperty("transcribing");
          dispatch(
            showSnackbar({ autoHide: true, message: "Caption stopped" })
          );
          dispatch(addSubtitle({}));
          action({ key: "caption", value: false });
        }
      }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.RECORDER_STATE_CHANGED,
      (data) => {
          if (streamingMode !== 'srs' && data._statusFromJicofo === "on" && data._mode === "stream") {
            conference.setLocalParticipantProperty("streaming", true);
            dispatch(
              showSnackbar({ autoHide: true, message: "Live streaming started" })
            );
            action({ key: "streaming", value: true });
            localStorage.setItem("streaming_session_id", data?._sessionID);
          }
          
          if (streamingMode !== 'srs' && data._statusFromJicofo === "off" && data._mode === "stream") {
            conference.removeLocalParticipantProperty("streaming");
            dispatch(
              showSnackbar({ autoHide: true, message: "Live streaming stopped" })
            );
            action({ key: "streaming", value: false });
          }

        if (data._statusFromJicofo === "on" && data._mode === "file") {
          conference.setLocalParticipantProperty("recording", true);
          dispatch(
            showSnackbar({ autoHide: true, message: "Recording started" })
          );
          action({ key: "recording", value: true });
          localStorage.setItem("recording_session_id", data?._sessionID);
        }

        if (data._statusFromJicofo === "off" && data._mode === "file") {
          conference.removeLocalParticipantProperty("recording");
          dispatch(
            showSnackbar({ autoHide: true, message: "Recording stopped" })
          );
          action({ key: "recording", value: false });
        }

        if (streamingMode !== 'srs' && data._mode === "stream" && data._error) {
          conference.removeLocalParticipantProperty("streaming");
          dispatch(
            showSnackbar({
              autoHide: true,
              message: RECORDING_ERROR_CONSTANTS[data._error],
            })
          );
          action({ key: "streaming", value: false });
        }

        if (data._mode === "file" && data._error) {
          conference.removeLocalParticipantProperty("recording");
          dispatch(
            showSnackbar({
              autoHide: true,
              message: RECORDING_ERROR_CONSTANTS[data._error],
            })
          );
          action({ key: "recording", value: false });
        }
      }
    );
  }, []);

  const leaveConference = () => {
    dispatch(clearAllReducers());
    history.push("/leave");
  };
  
  return (
    <Box id="footer" className={classes.root}>

{/* <Button onClick={handleColor} style={{color: lineColor, zIndex: 999}}>Color</Button>
        <Button onClick={handleClearCanvas} style={{color: lineColor, zIndex: 999}}>Clear</Button> */}
      <Hidden smDown>
        <Box className={classes.infoContainer}>
          <Box>{time}</Box>
          <Box className={classes.separator}>|</Box>
          <Box>{profile.meetingTitle}</Box>
        </Box>
      </Hidden>
      <Hidden smDown>
        <Box sx={{display: 'flex'}}>
        <StyledTooltip title="Leave Call">
          <CallEndIcon onClick={leaveConference} className={classes.end} />
        </StyledTooltip>
        <StyledTooltip title={"Go Live"}>
          <Box className={classes.liveBox} onClick={toggleLiveDrawer("right", true)} >          
            <FiberManualRecordIcon className={classes.dot} />
            <Button className={classes.live}>{"Go Live"}</Button>
          </Box>
        </StyledTooltip>
        </Box>
        <DrawerBox
          open={liveState["right"]}
          onClose={toggleLiveDrawer("right", false)}
        >
          {liveList("right")}
        </DrawerBox>
      </Hidden>
      <LiveStreamDialog
        close={closeLiveStreamDialog}
        createLiveStream={createLiveStream}
        open={openLivestreamDialog}
        broadcasts={broadcasts}
        selectedBroadcast={selectedBroadcast}
      />
      <Box className={classes.permissions}>
      <StyledTooltip
          title={"Change Color"}
        >
          <ColorLensIcon onClick={updateColor} style={{fill: annotatingColor}} />
        </StyledTooltip>
      <StyledTooltip
          title={"Pen"}
        >
          <div>
          {feature === ANNOTATION_TOOLS.pen ? (
              <GestureIcon className={classes.active} />
            ) : (
              <GestureIcon onClick={() => startAnnotation(ANNOTATION_TOOLS.pen)} disabled={true} />
            )
          }
          </div>
        </StyledTooltip>
        <StyledTooltip
          title={"Emoji"}
        >
          {feature === ANNOTATION_TOOLS.emoji ? (
              <SentimentSatisfiedOutlinedIcon className={classes.active} />
            ) : (
              <SentimentSatisfiedOutlinedIcon onClick={() => startAnnotation(ANNOTATION_TOOLS.emoji)} />
            )
          }
        </StyledTooltip>
        <StyledTooltip
          title={"Circle"}
        >
          {feature === ANNOTATION_TOOLS.circle ? (
              <RadioButtonUncheckedOutlinedIcon className={classes.active} />
            ) : (
              <RadioButtonUncheckedOutlinedIcon onClick={() => startAnnotation(ANNOTATION_TOOLS.circle)} />
            )
          }
        </StyledTooltip>
        {/* <StyledTooltip
          title={isAnnotation.textBox
                ? "Cancel"
                : "Text Box"
          }
        >
          {isAnnotation.textBox ? (
              <TextFieldsIcon onClick={stopTextBox} className={classes.active} />
            ) : (
              <TextFieldsIcon onClick={startTextBox} />
            )
          }
        </StyledTooltip> */}
        <StyledTooltip
          title={"Clear Annotation"}
          disabled={!isModerator(conference)}
        >
          <LayersClearIcon onClick={handleClearAllAnnotation} />
        </StyledTooltip>
        <StyledTooltip
          title={
            audioTrack
              ? audioTrack?.isMuted()
                ? "Unmute Audio"
                : "Mute Audio"
              : "Check the mic or Speaker"
          }
        >
          {audioTrack ? (
            audioTrack?.isMuted() ? (
              <MicOffIcon onClick={unmuteAudio} className={classes.active} />
            ) : (
              <MicIcon onClick={muteAudio} />
            )
          ) : (
            <MicIcon onClick={muteAudio} style={{ cursor: "unset" }} />
          )}
        </StyledTooltip>
        <StyledTooltip
          title={videoTrack?.isMuted() ? "Unmute Video" : "Mute Video"}
        >
          {videoTrack?.isMuted() ? (
            <VideocamOffIcon onClick={unmuteVideo} className={classes.active} />
          ) : (
            <VideocamIcon onClick={muteVideo} />
          )}
        </StyledTooltip>
        <StyledTooltip title={presenting ? "Stop Presenting" : "Share Screen"}>
          {presenting ? (
            <StopScreenShareIcon className={classnames(classes.active, classes.screenShare)}
            onClick={stopPresenting} />
          ) : (
            <ScreenShareIcon className={ classes.screenShare}
             onClick={shareScreen} />
          )}
        </StyledTooltip>
        <StyledTooltip title={raiseHand ? "Hand Down" : "Raise Hand"}>
          {raiseHand ? (
            <PanToolIcon
              onClick={stopRaiseHand}
              className={classnames(classes.active, classes.panTool)}
            />
          ) : (
            <PanToolIcon onClick={startRaiseHand} className={classes.panTool} />
          )}
        </StyledTooltip>
        <Hidden smDown>
          <StyledTooltip title="Participants Details">
            <GroupIcon onClick={toggleParticipantDrawer("right", true)} />
          </StyledTooltip>
        </Hidden>
        <DrawerBox
          open={participantState["right"]}
          onClose={toggleParticipantDrawer("right", false)}
        >
          {participantList("right")}
        </DrawerBox>
        <StyledTooltip title="Chat Box">
          <StyledBadge badgeContent={unread}>
            <ChatIcon
              onClick={toggleChatDrawer("right", true)}
              className={classes.chat}
            />
          </StyledBadge>
        </StyledTooltip>
        <DrawerBox
          open={chatState["right"]}
          onClose={toggleChatDrawer("right", false)}
        >
          {chatList("right")}
        </DrawerBox>
        <Hidden mdUp>
        <StyledTooltip title="Leave Call">
          <CallEndIcon onClick={leaveConference} className={classes.end} />
        </StyledTooltip>
      </Hidden>
        <StyledTooltip title="More Actions">
          <MoreVertIcon
            onClick={toggleMoreActionDrawer("right", true)}
            className={classes.more}
          />
        </StyledTooltip>
        <DrawerBox
          open={moreActionState["right"]}
          onClose={toggleMoreActionDrawer("right", false)}
        >
          {moreActionList("right")}
        </DrawerBox>
      </Box>
    </Box>
  );
};

export default ActionButtons;
