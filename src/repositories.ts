import { Student } from "./domain/student/Student"
import { Course  } from "./domain/course/Course"
import { Enrollment } from "./domain/enrollment/Enrollment"
import { StudentId, CourseId, EnrollmentId } from "./domain/type"

export class StudentRepository {
  private store = new Map<StudentId, Student>()
  save(s: Student):                    void              { this.store.set(s.id, s) }
  findById(id: StudentId):             Student | undefined { return this.store.get(id) }
  findAll():                           Student[]         { return [...this.store.values()] }
  count():                             number            { return this.store.size }
}

export class CourseRepository {
  private store = new Map<CourseId, Course>()
  save(c: Course):                     void              { this.store.set(c.id, c) }
  findById(id: CourseId):              Course | undefined { return this.store.get(id) }
  findAll():                           Course[]          { return [...this.store.values()] }
  count():                             number            { return this.store.size }
}

export class EnrollmentRepository {
  private store = new Map<EnrollmentId, Enrollment>()
  save(e: Enrollment):                              void                    { this.store.set(e.id, e) }
  findById(id: EnrollmentId):                       Enrollment | undefined  { return this.store.get(id) }
  findByStudent(studentId: StudentId):              Enrollment[]            { return [...this.store.values()].filter(e => e.studentId === studentId) }
  findByCourse(courseId: CourseId):                 Enrollment[]            { return [...this.store.values()].filter(e => e.courseId === courseId) }
  countActiveByCourse(courseId: CourseId):          number                  { return this.findByCourse(courseId).filter(e => e.isActive).length }
  findActiveByStudentAndCourse(sId: StudentId, cId: CourseId): Enrollment | undefined {
    return [...this.store.values()].find(e => e.studentId === sId && e.courseId === cId && e.isActive)
  }
  findAll():                                        Enrollment[]            { return [...this.store.values()] }
  count():                                          number                  { return this.store.size }
}