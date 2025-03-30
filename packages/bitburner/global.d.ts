/* eslint-disable no-var */
import { GlobalOverseer } from './servers/home/overseer';
import { NS as _NS } from 'NetscriptDefinitions';

declare global {
	type NS = _NS;
	var overseer: GlobalOverseer;
}