import fastify from "fastify";
import fastifyWebsocket from "@fastify/websocket"
import { Counter, Gauge, Registry } from "prom-client";
import { createClient } from "redis";

const app = fastify({ logger: false });
const port = process.env.PORT || 5000;
const registry: Registry = new Registry();
const publishClient = createClient({
	url: "redis://localhost:6379"
});

const subscribeClient = createClient({
	url: "redis://localhost:6379",
});

app.register(fastifyWebsocket);

app.register(async function (app) {
	app.get("/metrics", async (req, res) => {
		const metrics = await registry.metrics();
		res.send(metrics);
	});

	app.post("/metrics/counter", (req, res) => {
		const body = req.body;
		const { name, labels } = body as any;

		if (!name || !labels) {
			res.status(400).send("Name, and labels are required");
			return;
		}

		if (registry.getSingleMetric(name)) {
			const counter = registry.getSingleMetric(name) as Counter;
			counter.inc(labels);
		} else {
			new Counter({
				name,
				help: `${name} counter`,
				labelNames: Object.keys(labels),
				registers: [registry],
			}).inc(labels);
		}

		res.status(204).send();
	});

	app.post("/metrics/gauge/:type", (req, res) => {
		const body = req.body;
		const { name, labels, value } = body as any;

		if (!name || !labels || !value) {
			res.status(400).send("Name, labels, and value are required");
			return;
		}

		let gauge: Gauge;
		if (registry.getSingleMetric(name)) {
			gauge = registry.getSingleMetric(name) as Gauge;
		} else {
			gauge = new Gauge({
				name,
				help: `${name} gauge`,
				labelNames: Object.keys(labels),
				registers: [registry],
			});
		}

		switch ((req.params as any).type) {
			case "set":
				gauge.set(labels, value);
				break;
			case "inc":
				gauge.inc(labels, value);
				break;
			case "dec":
				gauge.dec(labels, value);
				break;
			default:
				res.status(400).send("Invalid type");
				return;
		}

		res.status(204).send();
	});

	app.post("/pubsub/publish", (req, res) => {
		const body = req.body;
		const { event, data } = body as any;

		publishClient.publish(event, JSON.stringify(data));
		res.status(204).send();
	});

	app.get("/pubsub/subscribe/*", { websocket: true }, (ws, req) => {
		const channel = req.url.split("/").pop() as string;
		if (!channel) {
			ws.close(1008, "Invalid channel name");
			return;
		}

		subscribeClient.subscribe(channel, (message: string, channel: string) => {
			console.log(`Received message from channel ${channel}: ${message}`);
			ws.send(JSON.stringify({ channel, message }));
		});
	});

	app.get("/pubsub/unsubscribe/*", (req, res) => {
		const channel = req.url.split("/").pop() as string;
		if (!channel) {
			res.status(400).send("Invalid channel name");
			return;
		}

		subscribeClient.unsubscribe(channel, (message: string, channel: string) => {
			console.log(`Unsubscribed from channel ${channel}`);
			res.status(204).send();
		});
	});
});

app.listen({ port: parseInt(port as string) }, async () => {
	await publishClient.connect();
	await subscribeClient.connect();
	console.log(`[server]: Server is running at http://localhost:${port}`);
});