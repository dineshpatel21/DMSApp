import { Actions } from "../types/Types";

const initialState = {
    userInfo: null,
    userData: null,
    userStatus: 'active'
};

const userInfoReducer = (state = initialState, action: any) => {
    switch (action.type) {
       case Actions.SET_USER_INFO:
            return {
                ...state,
                userInfo: action.payload,
            };
        default: {
            return state;
        }
    }
}
export default userInfoReducer
