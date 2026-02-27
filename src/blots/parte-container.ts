import Quill from 'quill';

const Container = Quill.import('blots/container') as any;

class ParteContainer extends Container {}

ParteContainer.blotName = 'parte-container';
ParteContainer.className = 'ql-parte-container';
ParteContainer.tagName = 'DIV';

export default ParteContainer;
