/* eslint-disable no-var */
import { GlobalOverseer } from './servers/home/overseer';
import { NS as _NS } from 'NetscriptDefinitions';
import ReactNamespace from 'react/index';

declare global {
	type NS = _NS;
	var overseer: GlobalOverseer;
	const React: ReactNamespace;
}