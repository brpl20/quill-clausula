import { ClassAttributor, Scope } from 'parchment';

const LockedAttribute = new ClassAttributor('locked', 'ql-locked', {
  scope: Scope.BLOCK,
  whitelist: ['true'],
});

export default LockedAttribute;
