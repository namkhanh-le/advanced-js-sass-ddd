import { Student } from "./src/domain/student/Student"
import { Course  } from "./src/domain/course/Course"
import { StudentRepository, CourseRepository, EnrollmentRepository } from "./src/repositories"
import { EnrollmentService } from "./src/EnrollmentService"
import { eventBus } from "./src/observers/EventBus"
import { registerAuditObserver, registerNotificationObserver, registerCapacityWatchObserver } from "./src/observers/Observers"

const studentRepo    = new StudentRepository()
const courseRepo     = new CourseRepository()
const enrollmentRepo = new EnrollmentRepository()
const service        = new EnrollmentService(studentRepo, courseRepo, enrollmentRepo)

registerAuditObserver(eventBus)
registerNotificationObserver(eventBus)
registerCapacityWatchObserver(
  eventBus,
  id => enrollmentRepo.countActiveByCourse(id as any),
  id => courseRepo.findById(id as any)?.capacity ?? 0
)

// --- Scenario 1: Register students & courses ---
console.log("\n=== Register Students & Courses ===")
const aliceR = Student.register({ name: "Alice Martin", email: "alice@epita.fr", gpa: 3.8 })
const bobR   = Student.register({ name: "Bob Dupont",   email: "bob@epita.fr",   gpa: 2.5 })
if (!aliceR.ok || !bobR.ok) throw new Error("Student creation failed")

const tsR  = Course.create({ name: "Advanced TypeScript", credits: 3, capacity: 2 })
const dddR = Course.create({ name: "Domain-Driven Design", credits: 4, capacity: 1 })
if (!tsR.ok || !dddR.ok) throw new Error("Course creation failed")

const alice = aliceR.value; studentRepo.save(alice)
const bob   = bobR.value;   studentRepo.save(bob)
const ts    = tsR.value;    courseRepo.save(ts)
const ddd   = dddR.value;   courseRepo.save(ddd)

// --- Scenario 2: Successful enrollments ---
console.log("\n=== Enroll Students ===")
const e1 = service.enrollStudent(alice.id, ts.id)
const e2 = service.enrollStudent(bob.id,   ts.id)
const e3 = service.enrollStudent(alice.id, ddd.id)
console.log("Alice → TS:", e1.ok ? "OK" : e1.error)
console.log("Bob   → TS:", e2.ok ? "OK" : e2.error)
console.log("Alice → DDD:", e3.ok ? "OK" : e3.error)

// --- Scenario 3: Invariant violations ---
console.log("\n=== Violations ===")
const dup  = service.enrollStudent(alice.id, ts.id)  // duplicate
const full = service.enrollStudent(bob.id, ddd.id)   // course full
console.log("Duplicate enrollment:", dup.ok  ? "SHOULD HAVE FAILED" : dup.error)
console.log("Full course:",          full.ok ? "SHOULD HAVE FAILED" : full.error)

alice.deactivate("Left university")
const inactive = service.enrollStudent(alice.id, ddd.id)
console.log("Inactive student:", inactive.ok ? "SHOULD HAVE FAILED" : inactive.error)

// --- Scenario 4: Withdrawal ---
console.log("\n=== Withdrawal ===")
if (e2.ok) {
  const w = service.withdrawStudent(e2.value.id, "Personal reasons")
  console.log("Bob withdraws:", w.ok ? "OK" : w.error)
  const w2 = service.withdrawStudent(e2.value.id, "Again")
  console.log("Bob withdraws again:", w2.ok ? "SHOULD HAVE FAILED" : w2.error)
}

// --- Scenario 5: Grades ---
console.log("\n=== Grades ===")
if (e1.ok) {
  const g1 = service.completeEnrollment(e1.value.id, 17)
  console.log("Alice grade 17:", g1.ok ? "OK" : g1.error)
  const g2 = service.completeEnrollment(e1.value.id, 14) // already completed
  console.log("Alice grade again:", g2.ok ? "SHOULD HAVE FAILED" : g2.error)
}

// --- Summary ---
console.log("\n=== Summary ===")
console.log("Students:", studentRepo.count())
console.log("Courses:", courseRepo.count())
console.log("Enrollments:", enrollmentRepo.count())
studentRepo.findAll().forEach(s => console.log(" ", s.toString()))
courseRepo.findAll().forEach(c => console.log(" ", c.toString()))
enrollmentRepo.findAll().forEach(e => console.log(" ", e.toString()))