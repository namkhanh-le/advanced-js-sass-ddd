import { StudentId, CourseId, EnrollmentId } from "../domain/type";

export type DomainEventType =
  | "StudentRegistered"
  | "StudentDeactivated"
  | "CourseCreated"
  | "CourseCapacityChanged"
  | "StudentEnrolled"
  | "StudentWithdrawn"
  | "EnrollmentCompleted"
  | "EnrollmentFailed";

export interface DomainEventBase {
  readonly type: DomainEventType;
  readonly occurredAt: Date;
  readonly eventId: string;
}

export interface StudentRegisteredEvent extends DomainEventBase {
  readonly type: "StudentRegistered";
  readonly studentId: StudentId;
  readonly name: string;
  readonly email: string;
}

export interface StudentDeactivatedEvent extends DomainEventBase {
  readonly type: "StudentDeactivated";
  readonly studentId: StudentId;
  readonly reason: string;
}

export interface CourseCreatedEvent extends DomainEventBase {
  readonly type: "CourseCreated";
  readonly courseId: CourseId;
  readonly name: string;
  readonly credits: number;
  readonly capacity: number;
}

export interface CourseCapacityChangedEvent extends DomainEventBase {
  readonly type: "CourseCapacityChanged";
  readonly courseId: CourseId;
  readonly oldCapacity: number;
  readonly newCapacity: number;
}

export interface StudentEnrolledEvent extends DomainEventBase {
  readonly type: "StudentEnrolled";
  readonly enrollmentId: EnrollmentId;
  readonly studentId: StudentId;
  readonly courseId: CourseId;
}

export interface StudentWithdrawnEvent extends DomainEventBase {
  readonly type: "StudentWithdrawn";
  readonly enrollmentId: EnrollmentId;
  readonly studentId: StudentId;
  readonly courseId: CourseId;
  readonly reason: string;
}

export interface EnrollmentCompletedEvent extends DomainEventBase {
  readonly type: "EnrollmentCompleted";
  readonly enrollmentId: EnrollmentId;
  readonly studentId: StudentId;
  readonly courseId: CourseId;
  readonly grade: number;
}

export interface EnrollmentFailedEvent extends DomainEventBase {
  readonly type: "EnrollmentFailed";
  readonly studentId: StudentId;
  readonly courseId: CourseId;
  readonly reason: string;
}

export type DomainEvent =
  | StudentRegisteredEvent
  | StudentDeactivatedEvent
  | CourseCreatedEvent
  | CourseCapacityChangedEvent
  | StudentEnrolledEvent
  | StudentWithdrawnEvent
  | EnrollmentCompletedEvent
  | EnrollmentFailedEvent;
