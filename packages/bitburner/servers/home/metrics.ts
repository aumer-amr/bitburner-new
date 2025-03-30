const bridgeUrl = "http://localhost:5000";

export class Counter {
	static inc(name: string, labels: Record<string, string>) {
		fetch(bridgeUrl + "/metrics/counter", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ name, labels }),
		});
	}
}

export class Gauge {
	static set(name: string, value: number, labels: Record<string, string>) {
		fetch(bridgeUrl + "/metrics/gauge/set", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ name: name, labels, value }),
		});
	}

	static inc(name: string, value = 1, labels: Record<string, string>) {
		fetch(bridgeUrl + "/metrics/gauge/inc", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ name: name, labels, value }),
		});
	}

	static dec(name: string, value = 1, labels: Record<string, string>) {
		fetch(bridgeUrl + "/metrics/gauge/dec", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ name: name, labels, value }),
		});
	}
}