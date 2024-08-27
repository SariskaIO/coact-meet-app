import {
  Avatar,
  Box,
  Button,
  makeStyles,
  Tooltip,
  Typography,
} from "@material-ui/core";
import React, { useEffect, useRef, useState } from "react";
import SariskaCollaborativeAnnotation, {Utils} from "sariska-collaborative-annotation-sdk";
import { color } from "../../../assets/styles/_color";
import Video from "../Video";
import Audio from "../Audio";
import PanTool from "@material-ui/icons/PanTool";
import { useDispatch, useSelector } from "react-redux";
import MicIcon from "@material-ui/icons/Mic";
import MicOffIcon from "@material-ui/icons/MicOff";
import { setPinParticipant } from "../../../store/actions/layout";
import PinParticipant from "../PinParticipant";
import classnames from "classnames";
import { videoShadow, calculateSteamHeightAndExtraDiff, isMobileOrTab, isModerator, isModeratorLocal, getAnnotator } from "../../../utils";
import AudioLevelIndicator from "../AudioIndicator";
import SubTitle from "../SubTitle";
import { useDocumentSize } from "../../../hooks/useDocumentSize";
import { profile } from "../../../store/reducers/profile";
import { useWindowResize } from "../../../hooks/useWindowResize";
import UserAvatar from "../UserAvatar";
import AnnotationBox from "../AnnotationBox";
import NonAnnotationBox from "../NonAnnotationBox";

const VideoBox = ({
  participantTracks,
  participantDetails,
  localUserId,
  width,
  height,
  isPresenter,
  isActiveSpeaker,
  isFilmstrip,
  isLargeVideo,
  isTranscription,
  numParticipants,
  isAnnotator
  // handleColor,
  // lineColor,
  // handleClearCanvas
}) => {
  
  const useStyles = makeStyles((theme) => ({
    root: {
      position: "relative",
      overflow: "hidden",
      borderRadius: "8px",
      background: color.secondary,
      display: "flex",
      flexDirection: "column",
      transform: "translateZ(0)",
      "& .largeVideo": {
        height: theme.spacing(20),
        width: theme.spacing(20),
        fontSize: "40pt",
      },
      [theme.breakpoints.down("sm")]: {
          background: numParticipants>1 ? color.secondary : "transparent",
      },
    }
  }));
  const classes = useStyles();
  const conference = useSelector((state) => state.conference);
  const annotation = useSelector((state) => state.annotation);
  const [visiblePinParticipant, setVisiblePinPartcipant] = useState(true);

  return (
    <Box
      style={{ width: `${width}px`, height: `${height}px` }}
      onMouseEnter={() => setVisiblePinPartcipant(true)}
      onMouseLeave={() => setVisiblePinPartcipant(false)}
      className={classes.root}
    >
      {
        isAnnotator ? 
        <AnnotationBox 
          participantTracks={participantTracks}
          participantDetails={participantDetails}
          localUserId={localUserId}
          width={width}
          height={height}
          isPresenter={isPresenter}
          isActiveSpeaker={isActiveSpeaker}
          isFilmstrip={isFilmstrip}
          isLargeVideo={isLargeVideo}
          isTranscription={isTranscription}
          numParticipants={numParticipants}
          visiblePinParticipant={visiblePinParticipant}
          // handleColor,
          // lineColor,
          // handleClearCanvas,
        />
        :
        <NonAnnotationBox 
          participantTracks={participantTracks}
          participantDetails={participantDetails}
          localUserId={localUserId}
          width={width}
          height={height}
          isPresenter={isPresenter}
          isActiveSpeaker={isActiveSpeaker}
          isFilmstrip={isFilmstrip}
          isLargeVideo={isLargeVideo}
          isTranscription={isTranscription}
          numParticipants={numParticipants}
          visiblePinParticipant={visiblePinParticipant}
        />
      }
    </Box>
  );
};

export default VideoBox;
