
  import React from "react";
  
import VideoBoxContent from "../VideoBoxContent";
  
  const NonAnnotationBox = ({
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
    visiblePinParticipant
  }) => {
    
    return (
      <>
          <VideoBoxContent 
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
      </>
    );
  };
  
  export default NonAnnotationBox;
  