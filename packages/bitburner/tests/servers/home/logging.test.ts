import { ConsoleTransport } from '@/logging/console.transport';
import { factory } from "@/logging";
import { afterAll, expect, test, vi } from 'vitest';

const consoleMock = vi.spyOn(console, "log").mockImplementation(() => {});

afterAll(() => {
	consoleMock.mockRestore();
});

test(`Test basic logging`, async () => {
	const ns: Partial<NS> = {};

	factory({
		ns: ns as NS,
		hostname: "fake-hostname",
		scriptname: "fake-scriptname",
		transports: [
			new ConsoleTransport()
		]
	})
		.info("Hello, world!");

	expect(consoleMock).toHaveBeenCalledWith("info - [fake-hostname, fake-scriptname] - Hello, world!");
});

// TODO: Add more tests for logging
