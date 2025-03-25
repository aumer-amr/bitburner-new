function scan(ns, parent, server, list) {
    const children = ns.scan(server);
    for (let child of children) {
        if (parent == child) {
            continue;
        }
        list.push(child);

        scan(ns, server, child, list);
    }
}

export function list_servers(ns) {
    const list = [];
    scan(ns, '', 'home', list);
    return list;
}

/** @param {NS} ns **/
export async function main(ns) {
	const servers = list_servers(ns)
		.filter(s => ns.hasRootAccess(s));

    for(const server of servers) {
		const ps = ns.ps(server);
		for (const process of ps) {
			if (process.filename == 'hackServer.js') {
				ns.kill(process.filename, server, ...process.args);
			}
		}
	}
}