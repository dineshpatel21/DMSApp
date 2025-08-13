import { Actions } from "../types/Types";

export const setTags = (tags: any) => ({
    type: Actions.SET_TAGS,
    payload: tags
});

export const addTag = (tag: any) => ({
    type: Actions.ADD_TAG,
    payload: tag
});