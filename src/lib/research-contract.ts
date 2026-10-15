import { z } from 'zod';
import { ResearchAttemptSchema } from './schema';
export const TaskRequestSchema = z
  .object({
    api_version: z.literal('v1'),
    problem_id: z.string().min(1),
    engine: z.literal('mock-mathforge'),
    objective: z.string().trim().min(5).max(2000),
  })
  .strict();
export const ResultSchema = z
  .object({
    api_version: z.literal('v1'),
    engine: z.literal('mock-mathforge'),
    is_mock: z.literal(true),
    attempts: z
      .array(ResearchAttemptSchema.omit({ problem_id: true, run_id: true, timestamp: true }))
      .min(1)
      .max(10),
  })
  .strict();
export const TaskSchema = z
  .object({
    api_version: z.literal('v1'),
    id: z.uuid(),
    problem_id: z.string(),
    engine: z.literal('mock-mathforge'),
    objective: z.string(),
    is_mock: z.literal(true),
    status: z.enum(['queued', 'completed']),
    created_at: z.iso.datetime(),
    updated_at: z.iso.datetime(),
    attempts: z.array(ResearchAttemptSchema),
  })
  .strict();
export type ResearchTask = z.infer<typeof TaskSchema>;
export interface ResearchAdapter {
  submit(input: z.infer<typeof TaskRequestSchema>): Promise<ResearchTask>;
  get(id: string): Promise<ResearchTask | null>;
  receive(id: string, result: z.infer<typeof ResultSchema>): Promise<ResearchTask | null>;
  list(problemId: string): Promise<ResearchTask[]>;
}
