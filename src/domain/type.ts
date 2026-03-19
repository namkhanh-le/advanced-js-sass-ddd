export type Brand<K, T> = K & { __brand: T };

export type StudentId = Brand<string, "StudentId">;
export type CourseId = Brand<string, "CourseId">;
export type EnrollmentId = Brand<string, "EnrollmentId">;
export type StudentName = Brand<string, "StudentName">;
export type Email = Brand<string, "Email">;
export type CourseName = Brand<string, "CourseName">;
export type Credits = Brand<number, "Credits">;
export type Capacity = Brand<number, "Capacity">;
export type GPA = Brand<number, "GPA">;

export type Result<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export const Ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const Err = <E>(error: E): Result<never, E> => ({ ok: false, error });

export function generateUUID(): string {
  const hex = (n: number) =>
    Math.floor(Math.random() * Math.pow(16, n))
      .toString(16)
      .padStart(n, "0");
  return `${hex(8)}-${hex(4)}-4${hex(3)}-${["8", "9", "a", "b"][Math.floor(Math.random() * 4)]}${hex(3)}-${hex(12)}`;
}

export function makeStudentId(raw: string): Result<StudentId> {
  if (!/^[0-9a-f-]{36}$/i.test(raw)) return Err(`Invalid StudentId: ${raw}`);
  return Ok(raw as StudentId);
}

export function makeCourseId(raw: string): Result<CourseId> {
  if (!/^[0-9a-f-]{36}$/i.test(raw)) return Err(`Invalid CourseId: ${raw}`);
  return Ok(raw as CourseId);
}

export function makeEnrollmentId(raw: string): Result<EnrollmentId> {
  if (!/^[0-9a-f-]{36}$/i.test(raw)) return Err(`Invalid EnrollmentId: ${raw}`);
  return Ok(raw as EnrollmentId);
}

export function makeStudentName(raw: string): Result<StudentName> {
  const t = raw.trim();
  if (t.length < 2) return Err(`Name too short: ${raw}`);
  if (t.length > 100) return Err(`Name too long: ${raw}`);
  return Ok(t as StudentName);
}

export function makeEmail(raw: string): Result<Email> {
  const t = raw.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t))
    return Err(`Invalid email: ${raw}`);
  return Ok(t as Email);
}

export function makeCourseName(raw: string): Result<CourseName> {
  const t = raw.trim();
  if (t.length < 3) return Err(`Course name too short: ${raw}`);
  if (t.length > 150) return Err(`Course name too long: ${raw}`);
  return Ok(t as CourseName);
}

export function makeCredits(n: number): Result<Credits> {
  if (!Number.isInteger(n) || n < 1 || n > 30)
    return Err(`Credits must be 1-30, got ${n}`);
  return Ok(n as Credits);
}

export function makeCapacity(n: number): Result<Capacity> {
  if (!Number.isInteger(n) || n < 1 || n > 1000)
    return Err(`Capacity must be 1-1000, got ${n}`);
  return Ok(n as Capacity);
}

export function makeGPA(n: number): Result<GPA> {
  if (n < 0 || n > 4.0) return Err(`GPA must be 0.0-4.0, got ${n}`);
  return Ok(n as GPA);
}
