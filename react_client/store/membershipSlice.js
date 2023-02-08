import { createSelector, createSlice } from "@reduxjs/toolkit";
import {
  selectAuthenticated,
  selectAuthenticatedUserId,
  selectAuthenticatedUserName,
} from "./authSlice";

const initialState = {
  peersInfo: {},
};

export const membershipSlice = createSlice({
  name: "membership",
  initialState,
  reducers: {
    updatePeersInfo: {
      reducer(sliceState, action) {
        sliceState.peersInfo = action.payload;
      },
    },
    reset: {
      reducer(sliceState, action) {
        return initialState;
      },
    },
  },
});

/* Reducer */

export default membershipSlice.reducer;

/* Action Creator */

export const { updatePeersInfo, reset } = membershipSlice.actions;

/* Selector */

export const selectMembership = (state) => {
  return state.membership;
};

export const selectAllMembers = createSelector(
  selectMembership,
  selectAuthenticatedUserId,
  selectAuthenticatedUserName,
  ({ peersInfo }, authenticatedUserId, authenticatedUserName) => {
    return {[authenticatedUserId]: { name: authenticatedUserName },  ...peersInfo };
  }
);

export const selectAllMembersOverview = createSelector(
  selectAllMembers,
  (allMembers) => {
    const allMembersOverview = {
      ...allMembers,
    }

    Object.keys(allMembersOverview).forEach((id) => {
      let initialLetterOfName = "?";
      const content = allMembersOverview[id];

      if (content && typeof content.name === "string" && content.name.length > 0) {
        initialLetterOfName = content.name.slice(0, 1);
      }

      allMembersOverview[id] = initialLetterOfName;
    })
    return allMembersOverview;
  }
);

export const selectAllMembersCount = createSelector(
  selectMembership,
  selectAuthenticated,
  ({ peersInfo }, authenticated) => {
    const peersCount = Object.keys(peersInfo).length;
    return peersCount + (authenticated ? 1 : 0);
  }
);
