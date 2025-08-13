import { Actions } from "../types/Types";

// src/redux/tagsReducer.ts
const initialState = {
  allTags: []
};

export const tagsReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case Actions.SET_TAGS:
      return { ...state, allTags: action.payload };

    case Actions.ADD_TAG:
      if (state.allTags.some((tag: any) => tag.id === action.payload.id)) {
        return state;
      }
      return { ...state, allTags: [...state.allTags, action.payload] };

    default:
      return state;
  }
};
