import { Counter, Gauge } from "@/metrics";
import { expect, test, vi } from "vitest";

test(`Counter inc posts to /metrics/counter`, async () => {
	const fetch = vi.fn();
	global.fetch = fetch;

	Counter.inc("test", { a: "b" });

	expect(fetch).toHaveBeenCalledWith("http://localhost:5000/metrics/counter", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ name: "test", labels: { a: "b" } }),
	});
});

test(`Gauge set posts to /metrics/gauge/set`, async () => {
	const fetch = vi.fn();
	global.fetch = fetch;

	Gauge.set("test", 10, { a: "b" });

	expect(fetch).toHaveBeenCalledWith("http://localhost:5000/metrics/gauge/set", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ name: "test", labels: { a: "b" }, value: 10 }),
	});
});

test(`Gauge inc posts to /metrics/gauge/inc`, async () => {
	const fetch = vi.fn();
	global.fetch = fetch;

	Gauge.inc("test", 10, { a: "b" });

	expect(fetch).toHaveBeenCalledWith("http://localhost:5000/metrics/gauge/inc", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ name: "test", labels: { a: "b" }, value: 10 }),
	});
});

test(`Gauge dec posts to /metrics/gauge/dec`, async () => {
	const fetch = vi.fn();
	global.fetch = fetch;

	Gauge.dec("test", 10, { a: "b" });

	expect(fetch).toHaveBeenCalledWith("http://localhost:5000/metrics/gauge/dec", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ name: "test", labels: { a: "b" }, value: 10 }),
	});
});