import express, { Express, Request, Response } from "express";
import { Counter, Gauge, Registry } from "prom-client";

const app: Express = express();
const port = process.env.PORT || 5000;
const registry: Registry = new Registry();

app.use(express.json());

app.get("/metrics", async (req: Request, res: Response) => {
	const metrics = await registry.metrics();
	res.send(metrics);
});

app.post("/metrics/counter", (req: Request, res: Response) => {
	const body = req.body;
	const { name, labels } = body;

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

app.post("/metrics/gauge/:type", (req: Request, res: Response) => {
	const body = req.body;
	const { name, labels, value } = body;

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

	switch (req.params.type) {
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

app.listen(port, () => {
	console.log(`[server]: Server is running at http://localhost:${port}`);
});