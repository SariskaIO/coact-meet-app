import {
  Box,
  makeStyles
} from "@material-ui/core";
import React, { useState } from "react";
import { color } from "../../../assets/styles/_color";
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
