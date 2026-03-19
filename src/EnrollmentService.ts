import { Student } from "./domain/student/Student"
import { Course  } from "./domain/course/Course"
import { Enrollment } from "./domain/enrollment/Enrollment"
import { StudentRepository, CourseRepository, EnrollmentRepository } from "./repositories"
import { StudentId, CourseId, EnrollmentId, Result, Ok, Err, generateUUID } from "./domain/types"
import { EnrollmentFailedEvent } from "./events/DomainEvents"
import { eventBus } from "./observers/EventBus"

export class EnrollmentService {
  constructor(
    private readonly students:    StudentRepository,
    private readonly courses:     CourseRepository,
    private readonly enrollments: EnrollmentRepository
  ) {}

  enrollStudent(studentId: StudentId, courseId: CourseId): Result<Enrollment> {
    const student = this.students.findById(studentId)
    if (!student)        return this.fail(studentId, courseId, `Student ${studentId} not found`)
    if (!student.isActive) return this.fail(studentId, courseId, `Student "${student.name}" is not active`)

    const course = this.courses.findById(courseId)
    if (!course)         return this.fail(studentId, courseId, `Course ${courseId} not found`)
    if (!course.isOpen)  return this.fail(studentId, courseId, `Course "${course.name}" is not open`)
    if (course.isFull)   return this.fail(studentId, courseId, `Course "${course.name}" is full`)

    const existing = this.enrollments.findActiveByStudentAndCourse(studentId, courseId)
    if (existing)        return this.fail(studentId, courseId, `Student already enrolled in "${course.name}"`)

    const seatR = course.incrementEnrolled()
    if (!seatR.ok) return this.fail(studentId, courseId, seatR.error)

    const enrollR = Enrollment.create(studentId, courseId)
    if (!enrollR.ok) { course.decrementEnrolled(); return this.fail(studentId, courseId, enrollR.error) }

    this.enrollments.save(enrollR.value)
    this.courses.save(course)
    return Ok(enrollR.value)
  }

  withdrawStudent(enrollmentId: EnrollmentId, reason: string): Result<void> {
    const enrollment = this.enrollments.findById(enrollmentId)
    if (!enrollment) return Err(`Enrollment ${enrollmentId} not found`)

    const course = this.courses.findById(enrollment.courseId)
    if (!course) return Err(`Course not found`)

    const r = enrollment.withdraw(reason)
    if (!r.ok) return Err(r.error)

    course.decrementEnrolled()
    this.enrollments.save(enrollment)
    this.courses.save(course)
    return Ok(undefined)
  }

  completeEnrollment(enrollmentId: EnrollmentId, grade: number): Result<void> {
    const enrollment = this.enrollments.findById(enrollmentId)
    if (!enrollment) return Err(`Enrollment ${enrollmentId} not found`)
    const r = enrollment.complete(grade)
    if (!r.ok) return Err(r.error)
    this.enrollments.save(enrollment)
    return Ok(undefined)
  }

  private fail(studentId: StudentId, courseId: CourseId, reason: string): Result<never> {
    const event: EnrollmentFailedEvent = {
      type: "EnrollmentFailed", eventId: generateUUID(),
      occurredAt: new Date(), studentId, courseId, reason
    }
    eventBus.publish(event)
    return Err(reason)
  }
}