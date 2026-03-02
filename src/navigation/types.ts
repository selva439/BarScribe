import type { NavigatorScreenParams } from '@react-navigation/native';

// ─── Root Stack (wraps everything) ───────────────────────────────────────────
export type RootStackParamList = {
  Onboarding: undefined;
  Tabs: NavigatorScreenParams<TabParamList>;
  LogSet: {
    workoutId: number;
    exerciseId: number;
    exerciseName: string;
    setIds: number[]; // All set IDs for this exercise in the workout
    currentSetIndex: number;
  };
  SessionReview: { workoutId: number };
};

// ─── Bottom Tab Navigator ────────────────────────────────────────────────────
export type TabParamList = {
  TodayStack: NavigatorScreenParams<TodayStackParamList>;
  HistoryStack: NavigatorScreenParams<HistoryStackParamList>;
  CalculatorsTab: NavigatorScreenParams<CalculatorsTabParamList>;
  MeetPrepStack: NavigatorScreenParams<MeetPrepStackParamList>;
  ProfileStack: NavigatorScreenParams<ProfileStackParamList>;
};

// ─── Today Stack ──────────────────────────────────────────────────────────────
export type TodayStackParamList = {
  TodayTraining: undefined;
  ProgramSelect: undefined;
  ProgramSetup: { programId: number };
};

// ─── History Stack ────────────────────────────────────────────────────────────
export type HistoryStackParamList = {
  History: undefined;
};

// ─── Calculators Top Tabs ─────────────────────────────────────────────────────
export type CalculatorsTabParamList = {
  OneRM: undefined;
  WilksDots: undefined;
};

// ─── Meet Prep Stack ──────────────────────────────────────────────────────────
export type MeetPrepStackParamList = {
  MeetList: undefined;
  MeetDetail: { meetId: number };
};

// ─── Profile Stack ────────────────────────────────────────────────────────────
export type ProfileStackParamList = {
  PRsDashboard: undefined;
  Settings: undefined;
};
