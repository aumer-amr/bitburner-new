import { instance as EventBus } from '@/eventbus/eventbus';
import { StopOverseerEvent } from '@/eventbus/events/stop.overseer.event';

export async function main(ns: NS) : Promise<void> {
	EventBus().publish(StopOverseerEvent.topic, new StopOverseerEvent());
}