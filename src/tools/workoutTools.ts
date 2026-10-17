import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import { GYM_BRO_API_BASE } from "../config.js";
import { WorkoutCreate } from "../types.js";
import { makePostRequest } from "../utils.js";

const setSchema = z.object({
  setNumber: z.number().int().nonnegative().describe("the number of the set within the exercise"),
  reps: z.number().int().nonnegative().describe("the number of repetitions performed"),
  weight: z.number().nonnegative().describe("the weight used for the set"),
});

const exerciseSchema = z.object({
  exerciseKey: z.string().min(1).describe("the unique key identifying the exercise"),
  exerciseName: z.string().min(1).describe("the display name of the exercise"),
  orderIndex: z.number().int().nonnegative().describe("the position of the exercise within the workout"),
  sets: z.array(setSchema).describe("the sets performed for this exercise"),
});

const workoutSchema = z.object({
  workoutType: z.string().min(1).describe("the type of the workout"),
  workoutAlias: z.string().nullable().describe("an optional alias/name for the workout"),
  notes: z.string().nullable().describe("optional notes about the workout"),
  startedAt: z.iso.datetime().nullable().describe("when the workout started, as an ISO 8601 datetime string"),
  finishedAt: z.iso.datetime().nullable().describe("when the workout finished, as an ISO 8601 datetime string"),
  exercises: z.array(exerciseSchema).describe("the exercises performed in the workout"),
});

export function registerWorkoutTools(server: McpServer) {
  server.registerTool("create_workout", {
    description: "create a new workout, passing workout object and the jwt accessToken returned by login_user",
    inputSchema: z.object({
      workout: workoutSchema.describe("the workout to create"),
      token: z.string().min(1).describe("the jwt access token to be sent as bearer token"),
    }),
  } , async({workout , token}) => {
      const url = `${GYM_BRO_API_BASE}/workout/create`;
      const created = await makePostRequest<unknown, WorkoutCreate>(url , workout , token);

      return {content : [{type:"text" , text:`Workout created: ${JSON.stringify(created)}`}]}
  });
}
