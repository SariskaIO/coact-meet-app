import React from "react";

export const s3 = {
   file_recording_metadata : {
       share: true
    }
}

export const streamingMode = 'srs' // or 'jibri'

export const GOOGLE_API_CLIENT_LIBRARY_URL = 'https://apis.google.com/js/api.js';
export const GOOGLE_API_CLIENT_ID = "621897095595-k7tr68mgfrhm1935cqdq5l2vg8u7ltu8.apps.googleusercontent.com";
export const API_URL_BROADCAST_STREAMS = 'https://content.googleapis.com/youtube/v3/liveStreams?part=id%2Csnippet%2Ccdn%2Cstatus&id=';
export const API_URL_LIVE_BROADCASTS = 'https://content.googleapis.com/youtube/v3/liveBroadcasts?broadcastType=all&mine=true&part=id%2Csnippet%2CcontentDetails%2Cstatus';
export const DISCOVERY_DOCS = [ 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest' ];
export const CREATE_YOUTUBE_LIVE_STREAMS = "https://www.googleapis.com/youtube/v3/liveStreams";
export const CREATE_YOUTUBE_LIVE_BROADCASTS = "https://www.googleapis.com/youtube/v3/liveBroadcasts";
export const LIVE_STREAMING_START_URL = `${process.env.REACT_APP_API_SERVICE_HOST}terraform/v1/hooks/srs/startRecording`;
export const LIVE_STREAMING_STOP_URL = `${process.env.REACT_APP_API_SERVICE_HOST}terraform/v1/hooks/srs/stopRecording`;
export const GET_PRESENTATION_STATUS = "GET_PRESENTATION_STATUS";
export const RECEIVED_PRESENTATION_STATUS = "RECEIVED_PRESENTATION_STATUS";
export const GOOGLE_API_STATES = {
    NEEDS_LOADING: 0,
    LOADED: 1,
    SIGNED_IN: 2,
    NOT_AVAILABLE: 3
};
export const GOOGLE_SCOPE_CALENDAR = 'https://www.googleapis.com/auth/calendar';
export const GOOGLE_SCOPE_YOUTUBE = 'https://www.googleapis.com/auth/youtube';
export const GENERATE_TOKEN_URL = `${process.env.REACT_APP_API_SERVICE_HOST}api/v1/misc/generate-token`;
export const EXIT_FULL_SCREEN_MODE = "exitFullScreen";
export const ENTER_FULL_SCREEN_MODE = "enterFullScreen";
export const VIRTUAL_BACKGROUND  = "VIRTUAL_BACKGROUND";
export const IS_PRESENTING  = "IS_PRESENTING";
export const START_PRESENTING = "START_PRESENTING";
export const STOP_PRESENTING = "STOP_PRESENTING";
export const CHAT = "CHAT";
export const PRESENTATION = "PRESENTATION";
export const GRID = "GRID";
export const SPEAKER = "SPEAKER";
export const SET_PRESENTATION_TYPE = "SET_PRESENTATION_TYPE";
export const SHARED_DOCUMENT = "SHARED_DOCUMENT";
export const WHITEBOARD = "WHITEBOARD";

export const images = [
    {
        name: 'Modern living room',
        thumbnail: `https://meet.sariska.io/static/media/living3_1005ac162f964b5f9e8499dfc5902250.jpeg`,
        url: `https://s3.ap-south-1.amazonaws.com/${process.env.REACT_APP_API_SERVICE_HOST_NAME}/static/media/living3_1005ac162f964b5f9e8499dfc5902250.jpeg`
    },
    {
        name: 'Ocean in the background',
        thumbnail: `https://meet.sariska.io/static/media/ocean2_c48fa44e731d22668107a6589ddc33db.jpeg`,
        url: `https://s3.ap-south-1.amazonaws.com/${process.env.REACT_APP_API_SERVICE_HOST_NAME}/static/media/ocean2_c48fa44e731d22668107a6589ddc33db.jpeg`
    },
    {
        name: 'Confetti on the pink background',
        thumbnail: `https://meet.sariska.io/static/media/confetti_1296f69171bbef53d30ef80b6f201bf6.jpeg`,
        url: `https://s3.ap-south-1.amazonaws.com/${process.env.REACT_APP_API_SERVICE_HOST_NAME}/static/media/confetti_1296f69171bbef53d30ef80b6f201bf6.jpeg`
    },
    {
        name: 'Room with books on the shelves',
        thumbnail: `https://meet.sariska.io/static/media/books2_1a904eb291cb029f74c848d4604c0ed2.jpeg`,
        url: `https://s3.ap-south-1.amazonaws.com/${process.env.REACT_APP_API_SERVICE_HOST_NAME}/static/media/books2_1a904eb291cb029f74c848d4604c0ed2.jpeg`
    },
    {
        name: 'Trailer in the evevning',
        thumbnail: `https://meet.sariska.io/static/media/trailer_182d4f7c61e37df010c786dfae0c879f.jpeg`,
        url: `https://s3.ap-south-1.amazonaws.com/${process.env.REACT_APP_API_SERVICE_HOST_NAME}/static/media/trailer_182d4f7c61e37df010c786dfae0c879f.jpeg`
    },
    {
        name: 'Mountains',
        thumbnail: `https://meet.sariska.io/static/media/camping_20abb6723b26f70457222e9fd0f4891d.jpeg`,
        url: `https://s3.ap-south-1.amazonaws.com/${process.env.REACT_APP_API_SERVICE_HOST_NAME}/static/media/camping_20abb6723b26f70457222e9fd0f4891d.jpeg`
    },
    {
        name: 'Skyscrapers with searchlights',
        thumbnail: `https://meet.sariska.io/static/media/skyskrapers_02f52b6cea18f5f0384b7ac8db8ad86b.jpeg`,
        url: `https://s3.ap-south-1.amazonaws.com/${process.env.REACT_APP_API_SERVICE_HOST_NAME}/static/media/skyskrapers_02f52b6cea18f5f0384b7ac8db8ad86b.jpeg`
    },
    {
        name: 'Fireworks',
        thumbnail: `https://meet.sariska.io/static/media/fireworks_c41626c514ccf319a3edb470b4d04949.jpeg`,
        url: `https://s3.ap-south-1.amazonaws.com/${process.env.REACT_APP_API_SERVICE_HOST_NAME}/static/media/fireworks_c41626c514ccf319a3edb470b4d04949.jpeg`
    },
    {
        name: 'Purple Clouds',
        thumbnail: `https://meet.sariska.io/static/media/clouds_bf46b8c3a1c02ee8628736254df3b587.jpeg`,
        url: `https://s3.ap-south-1.amazonaws.com/${process.env.REACT_APP_API_SERVICE_HOST_NAME}/static/media/clouds_bf46b8c3a1c02ee8628736254df3b587.jpeg`
    },
    {
        name: 'Cafe at night',
        thumbnail: `https://meet.sariska.io/static/media/cafe_at_night_de428ba989b9d616ec90ae7440b0944b.jpeg`,
        url: `https://s3.ap-south-1.amazonaws.com/${process.env.REACT_APP_API_SERVICE_HOST_NAME}/static/media/cafe_at_night_de428ba989b9d616ec90ae7440b0944b.jpeg`
    },
    {
        name: 'Stylized fish in a green sea',
        thumbnail: `https://meet.sariska.io/static/media/ocean_b26b6f03864ea9ebc1263d9c50f0c59b.jpeg`,
        url: `https://s3.ap-south-1.amazonaws.com/${process.env.REACT_APP_API_SERVICE_HOST_NAME}/static/media/ocean_b26b6f03864ea9ebc1263d9c50f0c59b.jpeg`
    }
]


export const DROPBOX_APP_KEY = "hey9dkz8x8s3x74";
export const CHECK_ROOM_URL = "https://reservation.sariska.io/room"

export const GET_PRESIGNED_URL = `${process.env.REACT_APP_API_SERVICE_HOST}api/v1/misc/get-presigned`;

export const RECORDING_ERROR_CONSTANTS  = {
    busy: "Already Busy",
    error: "Something went wrong",
    resource_constraint: "Resource constraint",
    unexpected_request: "Recording or live streaming is already enabled",
    service_unavailable: "Service unavailable"
};

export const PARTICIPANTS_VISIBLE_ON_MOBILE = 7;

export const STREAMING_URL_KEYS = [
    'dash_url',
    'flv_url',
    'hds_url',
    'hls_master_url',
    'hls_url',
    'low_latency_hls_master_url',
    'low_latency_hls_url',
    'rtmp_url',
    'srt_url',
    'vod_url'
  ]

export const PARTICIPANTS_LOCAL_PROPERTIES = {
    HANDRAISE: "handraise",
    UNMUTE_AUDIO: "unmuteAudio",
    UNMUTE_VIDEO: "unmuteVideo",
    ANNOTATION: "annotation",
    ANNOTATION_TOOL: "annotationTool",
    ENABLE_MEDIA: "enableMedia"
}

export const ANNOTATION_TOOLS = {
    pen: 'PEN',
    emoji: 'EMOJI',
    circle: 'CIRCLE',
    textbox: 'TEXTBOX'
}