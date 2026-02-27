import Quill from 'quill';

const Container = Quill.import('blots/container') as any;

class ObjetoContainer extends Container {}

ObjetoContainer.blotName = 'objeto-container';
ObjetoContainer.className = 'ql-objeto-container';
ObjetoContainer.tagName = 'DIV';

export default ObjetoContainer;
