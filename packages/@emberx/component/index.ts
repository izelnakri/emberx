import Component, {
  getOwner,
  setOwner,
  renderComponent,
  precompileTemplate,
  setComponentTemplate,
  templateOnlyComponent,
} from './glimmer-core/index';

export default class EmberXComponent<Args extends {} = {}> extends Component<Args> {
  constructor(owner: object, args: Args) {
    super(owner, args);
  }
}

function hbs(sourceCode: string, scope: object) {
  return { sourceCode, scope };
  // TODO: this doesnt work due to babel linter error:
  // setComponentTemplate(
  //   precompileTemplate(``, {
  //     strictMode: true,
  //     scope: () => {
  //       return scope; // TODO: make this from the this scope
  //     },
  //   }),
  //   component
  // );
}

export {
  renderComponent,
  precompileTemplate,
  setComponentTemplate,
  templateOnlyComponent,
  hbs,
  getOwner,
  setOwner,
};
