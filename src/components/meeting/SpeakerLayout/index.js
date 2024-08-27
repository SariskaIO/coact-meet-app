import {Box, makeStyles} from '@material-ui/core';
import React, { useState } from 'react'
import VideoBox from '../../shared/VideoBox';
import ParticipantPane from "../../shared/ParticipantPane";
import {useSelector} from "react-redux";
import {useWindowResize} from "../../../hooks/useWindowResize";
import {useDocumentSize} from "../../../hooks/useDocumentSize";
import classnames from "classnames";
import * as Constants from "../../../constants";
import { getAnnotator, getRandomParticipant, isAnnotator } from '../../../utils';

const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex",
        "& .fullmode": {
            position: "absolute",
            right: '16px',
        }
    }
}));
 
const SpeakerLayout = ({dominantSpeakerId}) => {
    const conference = useSelector(state => state.conference);
    const layout = useSelector(state=>state.layout);
    const totalParticipantGrid = conference?.getParticipantCount()+layout.presenterParticipantIds.length;
    let {viewportWidth, viewportHeight} = useWindowResize(totalParticipantGrid);
    const {documentWidth, documentHeight} = useDocumentSize();
    const localTracks = useSelector(state => state.localTrack);
    const remoteTracks = useSelector(state => state.remoteTrack);
    const resolution = useSelector(state => state.media?.resolution);
    const annotation = useSelector((state) => state.annotation);
    const [lineColor, setLineColor] = useState(localStorage.getItem('lineColor') || '#fff');
    const myUserId = conference.myUserId();
    const classes = useStyles();
    let largeVideoId, isPresenter, participantTracks, participantDetails, justifyContent;
    const [isCanvasClear, setIsCanvasClear] = useState(false);

    if ( conference.getParticipantCount() === 2 ) {
        largeVideoId = conference.getParticipantsWithoutHidden()[0]?._id;
    }
    const largeVideoParticipant = getRandomParticipant(conference, 'admin', null);
    
    largeVideoId = largeVideoParticipant?._id || layout.pinnedParticipant.participantId || layout.presenterParticipantIds.slice(0).pop() || largeVideoId || dominantSpeakerId || myUserId;
    isPresenter = layout.presenterParticipantIds.find(item=>item===largeVideoId);
    if ( layout.pinnedParticipant.isPresenter === false ) {
        isPresenter = false;
    }
    if(largeVideoParticipant){
        participantTracks = remoteTracks[largeVideoId];
    }
    participantDetails =  conference.participants.get(largeVideoId)?._identity?.user; 

    if (largeVideoId === conference.myUserId()){
        participantTracks = localTracks;
        participantDetails = conference.getLocalUser();
    }
    const videoTrack = participantTracks?.find(track => track.getVideoType() === "camera");
    const constraints = {
        "lastN": 25,
        "colibriClass": "ReceiverVideoConstraints",
        "selectedSources":  [],
        "defaultConstraints": {"maxHeight": 180 },
        "onStageSources":  [videoTrack?.getSourceName()],
        constraints: {
            [videoTrack?.getSourceName()]:  { "maxHeight":  layout?.resolution[largeVideoId] || resolution  }
        }
    }

    if (isPresenter)  {
        const desktopTrack = participantTracks?.find(track => track.getVideoType() === "desktop");
        constraints["onStageSources"] = [desktopTrack?.getSourceName()];
        constraints["selectedSources"] = [desktopTrack?.getSourceName()];
        constraints["constraints"] = { [desktopTrack?.getSourceName()]: { "maxHeight": 2160 }};
    }

    conference.setReceiverConstraints(constraints);
    const activeClasses = classnames(classes.root, {
        'fullmode': layout.mode === Constants.ENTER_FULL_SCREEN_MODE
    });    

    justifyContent = "center";
    if ( totalParticipantGrid > 1 && layout.mode !== Constants.ENTER_FULL_SCREEN_MODE ) {
        viewportWidth = viewportWidth - 48; 
        justifyContent = "space-evenly";
    }
    
    // const handleColor = () => {
    //     let colors = ['#fff', '#ff0000', '#ff0', '#ee7e24', '#00ff00', '#0000ff'];
    //     let randomColor = colors[Math.floor(Math.random()*4)]
    //     setLineColor(randomColor);
    //     localStorage.setItem('lineColor', randomColor)
    //   }
      
//   const handleClearCanvas = () => {
//     setIsCanvasClear(true)
//     setTimeout(()=>setIsCanvasClear(false), 1000);
//   }

    return (
        <Box style={{justifyContent}}  className={activeClasses} >
            <VideoBox
                isFilmstrip={true}
                isTranscription={true}
                width={viewportWidth}
                height={viewportHeight}
                isLargeVideo={true}
                isActiveSpeaker={ largeVideoId === dominantSpeakerId }
                isPresenter={isPresenter}
                participantDetails={participantDetails}
                participantTracks={participantTracks}
                localUserId={conference.myUserId()}
                isAnnotator = { isAnnotator(conference, annotation)}
               // handleColor={handleColor}
               // lineColor={lineColor}
               // handleClearCanvas={handleClearCanvas}
              //  isCanvasClear={isCanvasClear}
            />
            <ParticipantPane
                isPresenter={isPresenter}
                panelHeight = {layout.mode === Constants.ENTER_FULL_SCREEN_MODE ? documentHeight - 108 :documentHeight - 88}
                gridItemWidth = {218}    
                gridItemHeight= {123}   
                dominantSpeakerId={dominantSpeakerId} 
                largeVideoId={largeVideoId} 
                localTracks={localTracks} 
                remoteTracks={remoteTracks}
            />
        </Box>
    )
}

export default SpeakerLayout;
