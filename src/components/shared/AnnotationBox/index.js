
  import React, { useRef } from "react";
  import SariskaCollaborativeAnnotation from "sariska-collaborative-annotation-sdk";
  import { useSelector } from "react-redux";
  import { getAnnotationTool, isAnnotator, isModerator, isModeratorLocal } from "../../../utils";
  
import VideoBoxContent from "../VideoBoxContent";
  
  const AnnotationBox = ({
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
    const conference = useSelector((state) => state.conference);
    const annotation = useSelector((state) => state.annotation);
    
    const canvasRef = useRef(null);
    return (
      <SariskaCollaborativeAnnotation
              width={width}
              height={height}
              lineColor={annotation.style.color}
              lineWidth={annotation.style.width}
              zIndex = {2}
              isModerator={isModerator(conference)}
              isModeratorLocal={isModeratorLocal(conference)}
              isParticipantAccess={false}
              isCanvasClear={ !(isAnnotator(conference, annotation)) }
              parentCanvasRef={canvasRef}
              annotationTool={getAnnotationTool(annotation)}
              emojiType = '😎'
      >
        
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
        </SariskaCollaborativeAnnotation>
    );
  };
  
  export default AnnotationBox;
  