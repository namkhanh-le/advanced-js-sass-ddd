import { EnrollmentId, StudentId, CourseId, makeEnrollmentId, generateUUID, Result, Ok, Err } from "../type"
import { StudentEnrolledEvent, StudentWithdrawnEvent, EnrollmentCompletedEvent } from "../../events/DomainEvents"
import { eventBus } from "../../observers/EventBus"

export type EnrollmentStatus = "active" | "withdrawn" | "completed"

export interface EnrollmentProps {
  readonly id:         EnrollmentId
  readonly studentId:  StudentId
  readonly courseId:   CourseId
  status:              EnrollmentStatus
  grade?:              number
  readonly enrolledAt: Date
}

export class Enrollment {
  private readonly _id:        EnrollmentId
  private readonly _studentId: StudentId
  private readonly _courseId:  CourseId
  private _status:             EnrollmentStatus
  private _grade?:             number
  private readonly _enrolledAt: Date

  private constructor(props: EnrollmentProps) {
    this._id         = props.id
    this._studentId  = props.studentId
    this._courseId   = props.courseId
    this._status     = props.status
    this._grade      = props.grade
    this._enrolledAt = props.enrolledAt
  }

  static create(studentId: StudentId, courseId: CourseId): Result<Enrollment> {
    const idR = makeEnrollmentId(generateUUID())
    if (!idR.ok) return Err(idR.error)

    const enrollment = new Enrollment({
      id: idR.value, studentId, courseId, status: "active", enrolledAt: new Date()
    })

    const event: StudentEnrolledEvent = {
      type: "StudentEnrolled", eventId: generateUUID(), occurredAt: new Date(),
      enrollmentId: enrollment._id, studentId, courseId
    }
    eventBus.publish(event)
    return Ok(enrollment)
  }

  get id():        EnrollmentId     { return this._id }
  get studentId(): StudentId        { return this._studentId }
  get courseId():  CourseId         { return this._courseId }
  get status():    EnrollmentStatus { return this._status }
  get grade():     number | undefined { return this._grade }
  get isActive():  boolean          { return this._status === "active" }

  withdraw(reason: string): Result<void> {
    if (this._status !== "active") return Err(`Cannot withdraw: enrollment is already "${this._status}"`)
    this._status = "withdrawn"
    const event: StudentWithdrawnEvent = {
      type: "StudentWithdrawn", eventId: generateUUID(), occurredAt: new Date(),
      enrollmentId: this._id, studentId: this._studentId, courseId: this._courseId, reason
    }
    eventBus.publish(event)
    return Ok(undefined)
  }

  complete(grade: number): Result<void> {
    if (this._status !== "active") return Err(`Cannot complete: enrollment is already "${this._status}"`)
    if (grade < 0 || grade > 20)  return Err(`Grade must be 0-20, got ${grade}`)
    this._status = "completed"
    this._grade  = grade
    const event: EnrollmentCompletedEvent = {
      type: "EnrollmentCompleted", eventId: generateUUID(), occurredAt: new Date(),
      enrollmentId: this._id, studentId: this._studentId, courseId: this._courseId, grade
    }
    eventBus.publish(event)
    return Ok(undefined)
  }

  toString(): string {
    const g = this._grade !== undefined ? ` grade=${this._grade}/20` : ""
    return `Enrollment(student=${this._studentId}, course=${this._courseId}, status=${this._status}${g})`
  }
}