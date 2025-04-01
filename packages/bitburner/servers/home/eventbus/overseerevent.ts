export abstract class OverseerEvent {

	abstract readonly data: any;
	static readonly topic: string = "defaultTopic";

	toString(): string {
		return JSON.stringify(this);
	}
}