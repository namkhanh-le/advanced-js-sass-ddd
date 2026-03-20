import { EventBus } from "./EventBus"

export function registerAuditObserver(bus: EventBus): void {
  bus.subscribe("StudentRegistered",     e => console.log(`[AUDIT] Student registered: ${e.name} <${e.email}>`))
  bus.subscribe("StudentDeactivated",    e => console.log(`[AUDIT] Student deactivated: ${e.studentId} — ${e.reason}`))
  bus.subscribe("CourseCreated",         e => console.log(`[AUDIT] Course created: "${e.name}" credits=${e.credits} cap=${e.capacity}`))
  bus.subscribe("CourseCapacityChanged", e => console.log(`[AUDIT] Capacity changed: ${e.oldCapacity} → ${e.newCapacity}`))
  bus.subscribe("StudentEnrolled",       e => console.log(`[AUDIT] Enrolled: student=${e.studentId} course=${e.courseId}`))
  bus.subscribe("StudentWithdrawn",      e => console.log(`[AUDIT] Withdrawn: ${e.enrollmentId} — ${e.reason}`))
  bus.subscribe("EnrollmentCompleted",   e => console.log(`[AUDIT] Completed: ${e.enrollmentId} grade=${e.grade}`))
  bus.subscribe("EnrollmentFailed",      e => console.log(`[AUDIT] FAILED: ${e.reason}`))
}

export function registerNotificationObserver(bus: EventBus): void {
  bus.subscribe("StudentRegistered",   e => console.log(`[NOTIFY] Welcome email sent to ${e.email}`))
  bus.subscribe("StudentEnrolled",     e => console.log(`[NOTIFY] Enrollment confirmation sent`))
  bus.subscribe("StudentWithdrawn",    e => console.log(`[NOTIFY] Withdrawal confirmation sent`))
  bus.subscribe("EnrollmentCompleted", e => console.log(`[NOTIFY] Grade notification sent — ${e.grade}/20`))
  bus.subscribe("EnrollmentFailed",    e => console.log(`[NOTIFY] Enrollment failure notice sent`))
}

export function registerCapacityWatchObserver(
  bus: EventBus,
  getEnrolled: (courseId: string) => number,
  getCapacity: (courseId: string) => number
): void {
  bus.subscribe("StudentEnrolled", e => {
    const enrolled = getEnrolled(e.courseId)
    const capacity = getCapacity(e.courseId)
    const pct = capacity > 0 ? Math.round((enrolled / capacity) * 100) : 0
    if (pct >= 90) console.log(`[CAPACITY] WARNING: course ${e.courseId} is ${pct}% full (${enrolled}/${capacity})`)
  })
}