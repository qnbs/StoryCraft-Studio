import type { PayloadAction } from '@reduxjs/toolkit';
import type { CharacterInterview, InterviewMessage } from '../../../types';
import type { ProjectSliceState } from '../projectState';

// QNBS-v3: Character-interview reducer cases extracted from projectSlice (keyed by characterId).
// Note: the streaming-chunk matcher (project/streamInterviewChunk) stays in projectSlice's
// extraReducers because it is dispatched as a raw action type, not a slice case reducer.
export const interviewReducers = {
  addCharacterInterview: (
    state: ProjectSliceState,
    action: PayloadAction<{ characterId: string; interview: CharacterInterview }>,
  ) => {
    if (!state.data.characterInterviews) state.data.characterInterviews = {};
    const { characterId, interview } = action.payload;
    if (!state.data.characterInterviews[characterId]) {
      state.data.characterInterviews[characterId] = [];
    }
    state.data.characterInterviews[characterId].push(interview);
  },
  appendInterviewMessage: (
    state: ProjectSliceState,
    action: PayloadAction<{
      characterId: string;
      interviewId: string;
      message: InterviewMessage;
    }>,
  ) => {
    const { characterId, interviewId, message } = action.payload;
    const interviews = state.data.characterInterviews?.[characterId] ?? [];
    const interview = interviews.find((iv) => iv.id === interviewId);
    if (interview) {
      interview.messages.push(message);
      interview.updatedAt = message.timestamp;
    }
  },
  deleteCharacterInterview: (
    state: ProjectSliceState,
    action: PayloadAction<{ characterId: string; interviewId: string }>,
  ) => {
    const { characterId, interviewId } = action.payload;
    if (state.data.characterInterviews?.[characterId]) {
      state.data.characterInterviews[characterId] = state.data.characterInterviews[
        characterId
      ].filter((iv) => iv.id !== interviewId);
    }
  },
  updateCharacterInterview: (
    state: ProjectSliceState,
    action: PayloadAction<{
      characterId: string;
      interviewId: string;
      changes: Partial<Omit<CharacterInterview, 'messages'>>;
    }>,
  ) => {
    const { characterId, interviewId, changes } = action.payload;
    const interviews = state.data.characterInterviews?.[characterId] ?? [];
    const interview = interviews.find((iv) => iv.id === interviewId);
    if (interview) Object.assign(interview, changes);
  },
};
