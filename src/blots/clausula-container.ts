import Quill from 'quill';

const Container = Quill.import('blots/container') as any;

class ClausulaContainer extends Container {}

ClausulaContainer.blotName = 'clausula-container';
ClausulaContainer.className = 'ql-clausula-container';
ClausulaContainer.tagName = 'DIV';

export default ClausulaContainer;
