import { instance as EventBus } from '@/eventbus/eventbus';
import { OverseerEvent } from '@/eventbus/overseerevent';

export function EventListener<T extends OverseerEvent>(topic: string) {
	return function decorator(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const originalMethod = descriptor.value;

		console.log(`Subscribing to event: ${topic}`);

		EventBus().subscribe(topic, ((event: OverseerEvent) => {
			console.log(`Event received: ${topic}`, event);
			originalMethod(event);
		}));

		return descriptor;
	}
}