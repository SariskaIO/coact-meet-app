import { SET_ANNOTATOR } from "./types"

export const addAnnotationFeature = (featureType, payload) => {
    return {
        type: featureType,
        payload
    }
}

export const removeAnnotationFeature = (featureType) => {
    return {
        type: featureType
    }
}

export const updateAnnotationStyle = (styleType, payload) => {
    return {
        type: styleType,
        payload
    }
}

export const setAnnotator = (payload) => {
    return {
        type: SET_ANNOTATOR,
        payload
    }
}

export const clearAllAnnotation = (featureType, participantId) => {
    return {
        type: featureType,
        payload: participantId
    }
}