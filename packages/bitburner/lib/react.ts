import ReactNamespace from 'react/index';
import ReactDomNamespace from 'react-dom';

const eWindow = eval("window") as Window & typeof globalThis;
const eDocument = eval("document") as Document & typeof globalThis;

const React = eWindow.React as typeof ReactNamespace;
const ReactDOM = eWindow.ReactDOM as typeof ReactDomNamespace;

export default React;
export {
  eWindow,
  eDocument,
  ReactDOM
}