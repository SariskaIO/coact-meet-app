import { CLEAR_ALL_ANNOTATION, REMOVE_ANNOTATION_FEATURE, SET_ANNOTATION_FEATURE, SET_ANNOTATION_STYLE, SET_ANNOTATOR} from "../actions/types";

const initialState = {
    feature: '',
    style: {
        color: '#fff',
        width: 4
    },
    annotator: {},
};

export const annotation = (state = initialState, action) => {
    switch (action.type) {
        case SET_ANNOTATION_FEATURE:
            state.feature = action.payload;
            return {...state};
        case REMOVE_ANNOTATION_FEATURE:
            state.feature = '';
            return {...state};
        case SET_ANNOTATION_STYLE:
            state.style['color'] = action.payload;
            return {...state};
        case SET_ANNOTATOR:
            if (action.payload.annotator) {
                state.annotator[action.payload.participantId] = action.payload.participantId;
            } else {
                delete state.annotator[action.payload.participantId]; 
            }
            return {...state};
        case CLEAR_ALL_ANNOTATION:
            state.feature = '';
            delete state.annotator[action.payload.participantId]; 
            return {...state};
        default:
            return state;
    }
}
