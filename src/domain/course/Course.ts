import {
  CourseId,
  CourseName,
  Credits,
  Capacity,
  makeCourseId,
  makeCourseName,
  makeCredits,
  makeCapacity,
  generateUUID,
  Result,
  Ok,
  Err,
} from "../type";
import {
  CourseCreatedEvent,
  CourseCapacityChangedEvent,
} from "../../events/DomainEvents";
import { eventBus } from "../../observers/EventBus";

export type CourseStatus = "open" | "closed" | "archived";

export interface CourseProps {
  readonly id: CourseId;
  readonly name: CourseName;
  readonly credits: Credits;
  readonly capacity: Capacity;
  readonly status: CourseStatus;
  readonly createdAt: Date;
  enrolledCount: number;
}

export class Course {
  private readonly _id: CourseId;
  private _name: CourseName;
  private _credits: Credits;
  private _capacity: Capacity;
  private _status: CourseStatus;
  private readonly _createdAt: Date;
  private _enrolledCount: number;

  private constructor(props: CourseProps) {
    this._id = props.id;
    this._name = props.name;
    this._credits = props.credits;
    this._capacity = props.capacity;
    this._status = props.status;
    this._createdAt = props.createdAt;
    this._enrolledCount = props.enrolledCount;
  }

  static create(raw: {
    name: string;
    credits: number;
    capacity: number;
  }): Result<Course> {
    const nameR = makeCourseName(raw.name);
    if (!nameR.ok) return Err(nameR.error);
    const creditsR = makeCredits(raw.credits);
    if (!creditsR.ok) return Err(creditsR.error);
    const capacityR = makeCapacity(raw.capacity);
    if (!capacityR.ok) return Err(capacityR.error);
    const idR = makeCourseId(generateUUID());
    if (!idR.ok) return Err(idR.error);

    const course = new Course({
      id: idR.value,
      name: nameR.value,
      credits: creditsR.value,
      capacity: capacityR.value,
      status: "open",
      createdAt: new Date(),
      enrolledCount: 0,
    });

    const event: CourseCreatedEvent = {
      type: "CourseCreated",
      eventId: generateUUID(),
      occurredAt: new Date(),
      courseId: course._id,
      name: course._name,
      credits: course._credits,
      capacity: course._capacity,
    };
    eventBus.publish(event);
    return Ok(course);
  }

  get id(): CourseId {
    return this._id;
  }
  get name(): CourseName {
    return this._name;
  }
  get credits(): Credits {
    return this._credits;
  }
  get capacity(): Capacity {
    return this._capacity;
  }
  get status(): CourseStatus {
    return this._status;
  }
  get enrolledCount(): number {
    return this._enrolledCount;
  }
  get availableSeats(): number {
    return this._capacity - this._enrolledCount;
  }
  get isFull(): boolean {
    return this._enrolledCount >= this._capacity;
  }
  get isOpen(): boolean {
    return this._status === "open";
  }

  incrementEnrolled(): Result<void> {
    if (this.isFull) return Err(`Course "${this._name}" is full`);
    if (!this.isOpen) return Err(`Course "${this._name}" is not open`);
    this._enrolledCount++;
    return Ok(undefined);
  }

  decrementEnrolled(): Result<void> {
    if (this._enrolledCount <= 0)
      return Err("Enrolled count cannot go below 0");
    this._enrolledCount--;
    return Ok(undefined);
  }

  changeCapacity(newCap: number): Result<void> {
    if (newCap < this._enrolledCount)
      return Err(
        `New capacity (${newCap}) is less than current enrolled (${this._enrolledCount})`,
      );
    const r = makeCapacity(newCap);
    if (!r.ok) return Err(r.error);
    const old = this._capacity;
    this._capacity = r.value;
    const event: CourseCapacityChangedEvent = {
      type: "CourseCapacityChanged",
      eventId: generateUUID(),
      occurredAt: new Date(),
      courseId: this._id,
      oldCapacity: old,
      newCapacity: r.value,
    };
    eventBus.publish(event);
    return Ok(undefined);
  }

  toString(): string {
    return `Course(name="${this._name}", credits=${this._credits}, ${this._enrolledCount}/${this._capacity}, status=${this._status})`;
  }
}
