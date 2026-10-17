export type RegisterResponse = {
     displayName: string;
    password:string;
}

export const avatarImages = [
"avatar_man_1.avif",
"avatar_man_2.avif",
"avatar_man_3.avif",
"avatar_man_4.avif",
"avatar_man_5.avif",
"avatar_man_6.avif",
"avatar_woman_1.avif",
"avatar_woman_2.avif",
"avatar_woman_3.avif",
"avatar_woman_4.avif",
"avatar_woman_5.avif"] as const

type AvatarImage = (typeof avatarImages)[number]
export type RegisterPayload = {
fullName: string;
  displayName: string;
  email: string;
  password: string;
  age: number;
  height: number;
  weight: number;
  profileImage: AvatarImage;
  birthDate:string /// dd/mm/yyyy
  phone:string
  gender:"male" | "female"
}

// the backend answers a failed login with 200 + { message } instead of tokens
export type LoginResponse = {
    accessToken?: string;
    refreshToken?: string;
    message?: string;
}

export type LoginRequest = {
    displayName: string;
    password:string;
}

export type WorkoutCreate = {
     workoutType: string;
    workoutAlias: string | null;
    notes: string | null;
    startedAt: string | null; // ISO 8601 datetime
    finishedAt: string | null; // ISO 8601 datetime
    exercises: ExerciseCreate[];
}

export type ExerciseCreate = {
      exerciseKey: string;
    exerciseName: string;
    orderIndex: number;
    sets: SetCreate[];
}

export type SetCreate = {
      setNumber: number;
    reps: number;
    weight: number;
}

