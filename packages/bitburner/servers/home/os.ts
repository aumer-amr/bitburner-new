export async function main(ns: NS) : Promise<void> {
	const osCli = new OSCli();
	const command = osCli.processCommands(ns);

	if (command) {
		ns.tprint(`Command processed`);
	} else {
		ns.tprint(`No command found`);
	}

	ns.exit();
}

class OSCli {

	// RAM: 1.1 GB
	processCommands(ns: NS) {
		const command = this.parseCommands(ns);
		if (command?.stop) {
			return ns.fileExists(`commands/stop.js`, 'home') && (ns.run(`commands/stop.js`) > 0);
		}
		if (command?.start) {
			return ns.fileExists(`overseer.js`, 'home') && (ns.run(`overseer.js`) > 0);
		}

		return null;
	}

	// RAM: 0 GB
	parseCommands(ns: NS) {
		const validCommands = ['stop', 'start', 'restart', 'status'];
		const foundCommand = ns.args.find(arg => validCommands.includes(arg as string));
		console.log(ns.args);

		if (foundCommand) {
			return {
				stop: foundCommand === 'stop',
				start: foundCommand === 'start',
				restart: foundCommand === 'restart',
				status: foundCommand === 'status'
			}
		}

		return null;
	}
}