type EventHandler<TPayload> = (payload: TPayload) => void;

type EventMap = Record<string, unknown>;

interface EventBusInstance<TEvents extends EventMap> {
	on<TEvent extends keyof TEvents>(event: TEvent, handler: EventHandler<TEvents[TEvent]>): void;
	off<TEvent extends keyof TEvents>(event: TEvent, handler: EventHandler<TEvents[TEvent]>): void;
	emit<TEvent extends keyof TEvents>(event: TEvent, payload: TEvents[TEvent]): void;
}

function createEventBus<TEvents extends EventMap>(): EventBusInstance<TEvents> {
	const listeners = new Map<keyof TEvents, Set<EventHandler<unknown>>>();

	return {
		on<TEvent extends keyof TEvents>(event: TEvent, handler: EventHandler<TEvents[TEvent]>): void {
			if (!listeners.has(event)) {
				listeners.set(event, new Set());
			}
			listeners.get(event)?.add(handler as EventHandler<unknown>);
		},

		off<TEvent extends keyof TEvents>(event: TEvent, handler: EventHandler<TEvents[TEvent]>): void {
			listeners.get(event)?.delete(handler as EventHandler<unknown>);
		},

		emit<TEvent extends keyof TEvents>(event: TEvent, payload: TEvents[TEvent]): void {
			listeners.get(event)?.forEach((handler) => {
				handler(payload);
			});
		},
	};
}

export interface AppEvents extends EventMap {
	"content.updated": { entityType: string; entityId: string };
	"media.deleted": { filename: string };
}

export const eventBus = createEventBus<AppEvents>();
