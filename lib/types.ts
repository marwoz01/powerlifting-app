export type Phase = 'hypertrophy' | 'strength' | 'peaking' | 'deload' | 'test';

export interface UserProfile {
  name: string;
  bodyWeight: number;
  height: number;
  age: number;
  yearsTraining: number;
  createdAt: string;
}

export interface OneRepMaxes {
  squat: number;
  bench: number;
  deadlift: number;
}

export type DeadliftVariant = 'sumo' | 'conventional';

export interface TrainingSchedule {
  daysPerWeek: 3 | 4 | 5;
  sessionDuration: 60 | 75 | 90 | 120;
  preferredDays: string[];
}

export interface Goals {
  primary: 'powerlifting' | 'powerbuilding' | 'hypertrophy';
  priorities?: string[];
  targetSquat?: number;
  targetBench?: number;
  targetDeadlift?: number;
  hasCompetition: boolean;
  competitionDate?: string;
}

export interface WeakPoints {
  lifts: ('squat' | 'bench' | 'deadlift')[];
  muscleGroups: string[];
  technicalIssues: string[];
}

export interface UserSettings {
  profile: UserProfile;
  oneRepMaxes: OneRepMaxes;
  deadliftVariant: DeadliftVariant;
  schedule: TrainingSchedule;
  goals: Goals;
  weakPoints: WeakPoints;
  onboardingComplete: boolean;
}

export type TrainingLevel = 'beginner' | 'intermediate' | 'advanced';

export interface ProgramWeek {
  weekNumber: number;
  phase: Phase;
  sets: number;
  reps: number;
  percentage: number;
  isDeload: boolean;
  isScheduledDeload?: boolean;
}

export type LiftType = 'squat' | 'bench' | 'deadlift';
export type WeightType = 'topset' | 'backoff' | 'volume' | 'technical';

export interface Exercise {
  id: string;
  name: string;
  tag: 'main' | 'technical' | 'volume' | 'accessory' | 'supplemental';
  plannedSets: number;
  plannedReps: number;
  plannedWeight?: number;
  note?: string;
  isBackoff?: boolean;
  backoffSets?: number;
  backoffReps?: number;
  backoffWeight?: number;
  liftType?: LiftType;
  weightType?: WeightType;
}

export interface WorkoutDay {
  dayNumber: 1 | 2 | 3 | 4;
  label: string;
  dayOfWeek: string;
  focus: string;
  exercises: Exercise[];
}

export interface DeloadDecision {
  afterWeek: number;
  action: 'skip' | 'convert-to-deload' | 'keep';
  fatigueScore: number;
  date: string;
}

export interface GeneratedProgram {
  id: string;
  createdAt: string;
  weeks: ProgramWeek[];
  days: WorkoutDay[];
  baseOneRepMaxes: OneRepMaxes;
  effectiveOneRepMaxes?: OneRepMaxes;
  aiGenerated?: boolean;
  trainingLevel?: TrainingLevel;
  totalWeeks?: number;
  deloadHistory?: DeloadDecision[];
}

export interface AccessoryProgressionEntry {
  lastWeight: number;
  consecutiveCompletions: number;
  suggestedWeight: number;
}

export interface AccessoryProgressionState {
  [normalizedName: string]: AccessoryProgressionEntry;
}

export interface LoggedSet {
  exerciseId: string;
  setNumber: number;
  plannedReps: number;
  actualReps: number;
  plannedWeight: number;
  actualWeight: number;
  rpe?: number;
  note?: string;
}

export interface WorkoutLog {
  id: string;
  programId: string;
  weekNumber: number;
  dayNumber: number;
  date: string;
  startTime: string;
  endTime?: string;
  sets: LoggedSet[];
  generalNote?: string;
  completed: boolean;
}
