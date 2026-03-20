import {
  StudentId,
  StudentName,
  Email,
  GPA,
  makeStudentId,
  makeStudentName,
  makeEmail,
  makeGPA,
  generateUUID,
  Result,
  Ok,
  Err,
} from "../type";
import {
  StudentRegisteredEvent,
  StudentDeactivatedEvent,
} from "../../events/DomainEvents";
import { eventBus } from "../../observers/EventBus";

export type StudentStatus = "active" | "inactive" | "suspended";

export interface StudentProps {
  readonly id: StudentId;
  readonly name: StudentName;
  readonly email: Email;
  readonly gpa: GPA;
  readonly status: StudentStatus;
  readonly createdAt: Date;
}

export class Student {
  private readonly _id: StudentId;
  private _name: StudentName;
  private _email: Email;
  private _gpa: GPA;
  private _status: StudentStatus;
  private readonly _createdAt: Date;

  private constructor(props: StudentProps) {
    this._id = props.id;
    this._name = props.name;
    this._email = props.email;
    this._gpa = props.gpa;
    this._status = props.status;
    this._createdAt = props.createdAt;
  }

  static register(raw: {
    name: string;
    email: string;
    gpa?: number;
  }): Result<Student> {
    const nameR = makeStudentName(raw.name);
    if (!nameR.ok) return Err(nameR.error);
    const emailR = makeEmail(raw.email);
    if (!emailR.ok) return Err(emailR.error);
    const gpaR = makeGPA(raw.gpa ?? 0);
    if (!gpaR.ok) return Err(gpaR.error);
    const idR = makeStudentId(generateUUID());
    if (!idR.ok) return Err(idR.error);

    const student = new Student({
      id: idR.value,
      name: nameR.value,
      email: emailR.value,
      gpa: gpaR.value,
      status: "active",
      createdAt: new Date(),
    });

    const event: StudentRegisteredEvent = {
      type: "StudentRegistered",
      eventId: generateUUID(),
      occurredAt: new Date(),
      studentId: student._id,
      name: student._name,
      email: student._email,
    };
    eventBus.publish(event);
    return Ok(student);
  }

  get id(): StudentId {
    return this._id;
  }
  get name(): StudentName {
    return this._name;
  }
  get email(): Email {
    return this._email;
  }
  get gpa(): GPA {
    return this._gpa;
  }
  get status(): StudentStatus {
    return this._status;
  }
  get isActive(): boolean {
    return this._status === "active";
  }

  deactivate(reason: string): Result<void> {
    if (this._status === "inactive") return Err("Student is already inactive");
    this._status = "inactive";
    const event: StudentDeactivatedEvent = {
      type: "StudentDeactivated",
      eventId: generateUUID(),
      occurredAt: new Date(),
      studentId: this._id,
      reason,
    };
    eventBus.publish(event);
    return Ok(undefined);
  }

  toString(): string {
    return `Student(name="${this._name}", email=${this._email}, gpa=${this._gpa.toFixed(2)}, status=${this._status})`;
  }
}
