import { DomainEvent, DomainEventType } from "../events/DomainEvents"

type EventOf<T extends DomainEventType> = Extract<DomainEvent, { type: T }>
export type Observer<T extends DomainEventType> = (event: EventOf<T>) => void

export class EventBus {
  private readonly handlers = new Map<string, Set<(e: DomainEvent) => void>>()

  subscribe<T extends DomainEventType>(type: T, observer: Observer<T>): () => void {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set())
    const handler = observer as (e: DomainEvent) => void
    this.handlers.get(type)!.add(handler)
    return () => this.handlers.get(type)?.delete(handler)
  }

  publish(event: DomainEvent): void {
    this.handlers.get(event.type)?.forEach(h => h(event))
  }

  subscriberCount(type: DomainEventType): number {
    return this.handlers.get(type)?.size ?? 0
  }

  clear(): void { this.handlers.clear() }
}

export const eventBus = new EventBus()