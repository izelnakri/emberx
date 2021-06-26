import fs from 'fs/promises';

await Promise.all([
  fs.writeFile('node_modules/@glimmer/core/dist/commonjs/index.js',
  `
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.precompileTemplate = exports.setOwner = exports.getOwner = exports.setComponentTemplate = exports.helperCapabilities = exports.modifierCapabilities = exports.componentCapabilities = exports.setHelperManager = exports.setModifierManager = exports.setComponentManager = exports.templateOnlyComponent = exports.createTemplateFactory = exports.BaseEnvDelegate = exports.getTemplateIterator = exports.didRender = exports.renderComponent = void 0;
const render_component_1 = __importStar(require("./src/render-component"));
exports.renderComponent = render_component_1.default;
Object.defineProperty(exports, "didRender", { enumerable: true, get: function () { return render_component_1.didRender; } });
Object.defineProperty(exports, "getTemplateIterator", { enumerable: true, get: function () { return render_component_1.getTemplateIterator; } });
const delegates_1 = require("./src/environment/delegates");
Object.defineProperty(exports, "BaseEnvDelegate", { enumerable: true, get: function () { return delegates_1.BaseEnvDelegate; } });
const opcode_compiler_1 = require("@glimmer/opcode-compiler");
Object.defineProperty(exports, "createTemplateFactory", { enumerable: true, get: function () { return opcode_compiler_1.templateFactory; } });
const runtime_1 = require("@glimmer/runtime");
Object.defineProperty(exports, "templateOnlyComponent", { enumerable: true, get: function () { return runtime_1.templateOnlyComponent; } });
const manager_1 = require("@glimmer/manager");
Object.defineProperty(exports, "setComponentManager", { enumerable: true, get: function () { return manager_1.setComponentManager; } });
Object.defineProperty(exports, "setModifierManager", { enumerable: true, get: function () { return manager_1.setModifierManager; } });
Object.defineProperty(exports, "setHelperManager", { enumerable: true, get: function () { return manager_1.setHelperManager; } });
Object.defineProperty(exports, "componentCapabilities", { enumerable: true, get: function () { return manager_1.componentCapabilities; } });
Object.defineProperty(exports, "modifierCapabilities", { enumerable: true, get: function () { return manager_1.modifierCapabilities; } });
Object.defineProperty(exports, "helperCapabilities", { enumerable: true, get: function () { return manager_1.helperCapabilities; } });
Object.defineProperty(exports, "setComponentTemplate", { enumerable: true, get: function () { return manager_1.setComponentTemplate; } });
const owner_1 = require("@glimmer/owner");
Object.defineProperty(exports, "getOwner", { enumerable: true, get: function () { return owner_1.getOwner; } });
Object.defineProperty(exports, "setOwner", { enumerable: true, get: function () { return owner_1.setOwner; } });
const template_1 = require("./src/template");
Object.defineProperty(exports, "precompileTemplate", { enumerable: true, get: function () { return template_1.precompileTemplate; } });
exports.default = {
    renderComponent: render_component_1.default,
    didRender: render_component_1.didRender,
    getTemplateIterator: render_component_1.getTemplateIterator,
    BaseEnvDelegate: delegates_1.BaseEnvDelegate,
    createTemplateFactory: opcode_compiler_1.templateFactory,
    templateOnlyComponent: runtime_1.templateOnlyComponent,
    setComponentManager: manager_1.setComponentManager,
    setModifierManager: manager_1.setModifierManager,
    setHelperManager: manager_1.setHelperManager,
    componentCapabilities: manager_1.componentCapabilities,
    modifierCapabilities: manager_1.modifierCapabilities,
    helperCapabilities: manager_1.helperCapabilities,
    setComponentTemplate: manager_1.setComponentTemplate,
    getOwner: owner_1.getOwner,
    setOwner: owner_1.setOwner,
    precompileTemplate: template_1.precompileTemplate,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci9jb3JlL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSwyRUFBeUY7QUE4QnZGLDBCQTlCSywwQkFBZSxDQThCTDtBQUNmLDBGQS9Cd0IsNEJBQVMsT0ErQnhCO0FBQ1Qsb0dBaENtQyxzQ0FBbUIsT0FnQ25DO0FBOUJyQiwyREFBOEQ7QUErQjVELGdHQS9CTywyQkFBZSxPQStCUDtBQXBCakIsOERBQW9GO0FBcUJsRixzR0FyQjBCLGlDQUFxQixPQXFCMUI7QUFwQnZCLDhDQUF5RDtBQXFCdkQsc0dBckJPLCtCQUFxQixPQXFCUDtBQW5CdkIsOENBUTBCO0FBWXhCLG9HQW5CQSw2QkFBbUIsT0FtQkE7QUFDbkIsbUdBbkJBLDRCQUFrQixPQW1CQTtBQUNsQixpR0FuQkEsMEJBQWdCLE9BbUJBO0FBQ2hCLHNHQW5CQSwrQkFBcUIsT0FtQkE7QUFDckIscUdBbkJBLDhCQUFvQixPQW1CQTtBQUNwQixtR0FuQkEsNEJBQWtCLE9BbUJBO0FBQ2xCLHFHQW5CQSw4QkFBb0IsT0FtQkE7QUFoQnRCLDBDQUFvRDtBQWlCbEQseUZBakJPLGdCQUFRLE9BaUJQO0FBQ1IseUZBbEJpQixnQkFBUSxPQWtCakI7QUFqQlYsNkNBQW9EO0FBa0JsRCxtR0FsQk8sNkJBQWtCLE9Ba0JQO0FBRXBCLGtCQUFlO0lBQ2IsZUFBZSxFQUFmLDBCQUFlO0lBQ2YsU0FBUyxFQUFULDRCQUFTO0lBQ1QsbUJBQW1CLEVBQW5CLHNDQUFtQjtJQUNuQixlQUFlLEVBQWYsMkJBQWU7SUFDZixxQkFBcUIsRUFBckIsaUNBQXFCO0lBQ3JCLHFCQUFxQixFQUFyQiwrQkFBcUI7SUFDckIsbUJBQW1CLEVBQW5CLDZCQUFtQjtJQUNuQixrQkFBa0IsRUFBbEIsNEJBQWtCO0lBQ2xCLGdCQUFnQixFQUFoQiwwQkFBZ0I7SUFDaEIscUJBQXFCLEVBQXJCLCtCQUFxQjtJQUNyQixvQkFBb0IsRUFBcEIsOEJBQW9CO0lBQ3BCLGtCQUFrQixFQUFsQiw0QkFBa0I7SUFDbEIsb0JBQW9CLEVBQXBCLDhCQUFvQjtJQUNwQixRQUFRLEVBQVIsZ0JBQVE7SUFDUixRQUFRLEVBQVIsZ0JBQVE7SUFDUixrQkFBa0IsRUFBbEIsNkJBQWtCO0NBQ25CLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcmVuZGVyQ29tcG9uZW50LCB7IGRpZFJlbmRlciwgZ2V0VGVtcGxhdGVJdGVyYXRvciB9IGZyb20gJy4vc3JjL3JlbmRlci1jb21wb25lbnQnO1xuXG5pbXBvcnQgeyBCYXNlRW52RGVsZWdhdGUgfSBmcm9tICcuL3NyYy9lbnZpcm9ubWVudC9kZWxlZ2F0ZXMnO1xuXG5leHBvcnQgdHlwZSB7IENvbXBvbmVudERlZmluaXRpb24gfSBmcm9tICcuL3NyYy9yZW5kZXItY29tcG9uZW50JztcbmV4cG9ydCB0eXBlIHtcbiAgTW9kaWZpZXJNYW5hZ2VyLFxuICBNb2RpZmllckNhcGFiaWxpdGllcyxcbiAgQ29tcG9uZW50TWFuYWdlcixcbiAgQ29tcG9uZW50Q2FwYWJpbGl0aWVzLFxuICBIZWxwZXJNYW5hZ2VyLFxufSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcblxuaW1wb3J0IHsgdGVtcGxhdGVGYWN0b3J5IGFzIGNyZWF0ZVRlbXBsYXRlRmFjdG9yeSB9IGZyb20gJ0BnbGltbWVyL29wY29kZS1jb21waWxlcic7XG5pbXBvcnQgeyB0ZW1wbGF0ZU9ubHlDb21wb25lbnQgfSBmcm9tICdAZ2xpbW1lci9ydW50aW1lJztcblxuaW1wb3J0IHtcbiAgc2V0Q29tcG9uZW50TWFuYWdlcixcbiAgc2V0TW9kaWZpZXJNYW5hZ2VyLFxuICBzZXRIZWxwZXJNYW5hZ2VyLFxuICBjb21wb25lbnRDYXBhYmlsaXRpZXMsXG4gIG1vZGlmaWVyQ2FwYWJpbGl0aWVzLFxuICBoZWxwZXJDYXBhYmlsaXRpZXMsXG4gIHNldENvbXBvbmVudFRlbXBsYXRlLFxufSBmcm9tICdAZ2xpbW1lci9tYW5hZ2VyJztcblxuaW1wb3J0IHsgZ2V0T3duZXIsIHNldE93bmVyIH0gZnJvbSAnQGdsaW1tZXIvb3duZXInO1xuaW1wb3J0IHsgcHJlY29tcGlsZVRlbXBsYXRlIH0gZnJvbSAnLi9zcmMvdGVtcGxhdGUnO1xuXG5leHBvcnQge1xuICByZW5kZXJDb21wb25lbnQsXG4gIGRpZFJlbmRlcixcbiAgZ2V0VGVtcGxhdGVJdGVyYXRvcixcbiAgQmFzZUVudkRlbGVnYXRlLFxuICBjcmVhdGVUZW1wbGF0ZUZhY3RvcnksXG4gIHRlbXBsYXRlT25seUNvbXBvbmVudCxcbiAgc2V0Q29tcG9uZW50TWFuYWdlcixcbiAgc2V0TW9kaWZpZXJNYW5hZ2VyLFxuICBzZXRIZWxwZXJNYW5hZ2VyLFxuICBjb21wb25lbnRDYXBhYmlsaXRpZXMsXG4gIG1vZGlmaWVyQ2FwYWJpbGl0aWVzLFxuICBoZWxwZXJDYXBhYmlsaXRpZXMsXG4gIHNldENvbXBvbmVudFRlbXBsYXRlLFxuICBnZXRPd25lcixcbiAgc2V0T3duZXIsXG4gIHByZWNvbXBpbGVUZW1wbGF0ZSxcbn07XG5leHBvcnQgZGVmYXVsdCB7XG4gIHJlbmRlckNvbXBvbmVudCxcbiAgZGlkUmVuZGVyLFxuICBnZXRUZW1wbGF0ZUl0ZXJhdG9yLFxuICBCYXNlRW52RGVsZWdhdGUsXG4gIGNyZWF0ZVRlbXBsYXRlRmFjdG9yeSxcbiAgdGVtcGxhdGVPbmx5Q29tcG9uZW50LFxuICBzZXRDb21wb25lbnRNYW5hZ2VyLFxuICBzZXRNb2RpZmllck1hbmFnZXIsXG4gIHNldEhlbHBlck1hbmFnZXIsXG4gIGNvbXBvbmVudENhcGFiaWxpdGllcyxcbiAgbW9kaWZpZXJDYXBhYmlsaXRpZXMsXG4gIGhlbHBlckNhcGFiaWxpdGllcyxcbiAgc2V0Q29tcG9uZW50VGVtcGxhdGUsXG4gIGdldE93bmVyLFxuICBzZXRPd25lcixcbiAgcHJlY29tcGlsZVRlbXBsYXRlLFxufTtcbiJdfQ==
  `),
  fs.writeFile('node_modules/@glimmer/core/dist/modules/index.js',
  `
import renderComponent, { didRender, getTemplateIterator } from './src/render-component';
import { BaseEnvDelegate } from './src/environment/delegates';
import { templateFactory as createTemplateFactory } from '@glimmer/opcode-compiler';
import { templateOnlyComponent } from '@glimmer/runtime';
import { setComponentManager, setModifierManager, setHelperManager, componentCapabilities, modifierCapabilities, helperCapabilities, setComponentTemplate, } from '@glimmer/manager';
import { getOwner, setOwner } from '@glimmer/owner';
import { precompileTemplate } from './src/template';
export { renderComponent, didRender, getTemplateIterator, BaseEnvDelegate, createTemplateFactory, templateOnlyComponent, setComponentManager, setModifierManager, setHelperManager, componentCapabilities, modifierCapabilities, helperCapabilities, setComponentTemplate, getOwner, setOwner, precompileTemplate, };
export default {
    renderComponent,
    didRender,
    getTemplateIterator,
    BaseEnvDelegate,
    createTemplateFactory,
    templateOnlyComponent,
    setComponentManager,
    setModifierManager,
    setHelperManager,
    componentCapabilities,
    modifierCapabilities,
    helperCapabilities,
    setComponentTemplate,
    getOwner,
    setOwner,
    precompileTemplate,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci9jb3JlL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sZUFBZSxFQUFFLEVBQUUsU0FBUyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFFekYsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBVzlELE9BQU8sRUFBRSxlQUFlLElBQUkscUJBQXFCLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUNwRixPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUV6RCxPQUFPLEVBQ0wsbUJBQW1CLEVBQ25CLGtCQUFrQixFQUNsQixnQkFBZ0IsRUFDaEIscUJBQXFCLEVBQ3JCLG9CQUFvQixFQUNwQixrQkFBa0IsRUFDbEIsb0JBQW9CLEdBQ3JCLE1BQU0sa0JBQWtCLENBQUM7QUFFMUIsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNwRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUVwRCxPQUFPLEVBQ0wsZUFBZSxFQUNmLFNBQVMsRUFDVCxtQkFBbUIsRUFDbkIsZUFBZSxFQUNmLHFCQUFxQixFQUNyQixxQkFBcUIsRUFDckIsbUJBQW1CLEVBQ25CLGtCQUFrQixFQUNsQixnQkFBZ0IsRUFDaEIscUJBQXFCLEVBQ3JCLG9CQUFvQixFQUNwQixrQkFBa0IsRUFDbEIsb0JBQW9CLEVBQ3BCLFFBQVEsRUFDUixRQUFRLEVBQ1Isa0JBQWtCLEdBQ25CLENBQUM7QUFDRixlQUFlO0lBQ2IsZUFBZTtJQUNmLFNBQVM7SUFDVCxtQkFBbUI7SUFDbkIsZUFBZTtJQUNmLHFCQUFxQjtJQUNyQixxQkFBcUI7SUFDckIsbUJBQW1CO0lBQ25CLGtCQUFrQjtJQUNsQixnQkFBZ0I7SUFDaEIscUJBQXFCO0lBQ3JCLG9CQUFvQjtJQUNwQixrQkFBa0I7SUFDbEIsb0JBQW9CO0lBQ3BCLFFBQVE7SUFDUixRQUFRO0lBQ1Isa0JBQWtCO0NBQ25CLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcmVuZGVyQ29tcG9uZW50LCB7IGRpZFJlbmRlciwgZ2V0VGVtcGxhdGVJdGVyYXRvciB9IGZyb20gJy4vc3JjL3JlbmRlci1jb21wb25lbnQnO1xuXG5pbXBvcnQgeyBCYXNlRW52RGVsZWdhdGUgfSBmcm9tICcuL3NyYy9lbnZpcm9ubWVudC9kZWxlZ2F0ZXMnO1xuXG5leHBvcnQgdHlwZSB7IENvbXBvbmVudERlZmluaXRpb24gfSBmcm9tICcuL3NyYy9yZW5kZXItY29tcG9uZW50JztcbmV4cG9ydCB0eXBlIHtcbiAgTW9kaWZpZXJNYW5hZ2VyLFxuICBNb2RpZmllckNhcGFiaWxpdGllcyxcbiAgQ29tcG9uZW50TWFuYWdlcixcbiAgQ29tcG9uZW50Q2FwYWJpbGl0aWVzLFxuICBIZWxwZXJNYW5hZ2VyLFxufSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcblxuaW1wb3J0IHsgdGVtcGxhdGVGYWN0b3J5IGFzIGNyZWF0ZVRlbXBsYXRlRmFjdG9yeSB9IGZyb20gJ0BnbGltbWVyL29wY29kZS1jb21waWxlcic7XG5pbXBvcnQgeyB0ZW1wbGF0ZU9ubHlDb21wb25lbnQgfSBmcm9tICdAZ2xpbW1lci9ydW50aW1lJztcblxuaW1wb3J0IHtcbiAgc2V0Q29tcG9uZW50TWFuYWdlcixcbiAgc2V0TW9kaWZpZXJNYW5hZ2VyLFxuICBzZXRIZWxwZXJNYW5hZ2VyLFxuICBjb21wb25lbnRDYXBhYmlsaXRpZXMsXG4gIG1vZGlmaWVyQ2FwYWJpbGl0aWVzLFxuICBoZWxwZXJDYXBhYmlsaXRpZXMsXG4gIHNldENvbXBvbmVudFRlbXBsYXRlLFxufSBmcm9tICdAZ2xpbW1lci9tYW5hZ2VyJztcblxuaW1wb3J0IHsgZ2V0T3duZXIsIHNldE93bmVyIH0gZnJvbSAnQGdsaW1tZXIvb3duZXInO1xuaW1wb3J0IHsgcHJlY29tcGlsZVRlbXBsYXRlIH0gZnJvbSAnLi9zcmMvdGVtcGxhdGUnO1xuXG5leHBvcnQge1xuICByZW5kZXJDb21wb25lbnQsXG4gIGRpZFJlbmRlcixcbiAgZ2V0VGVtcGxhdGVJdGVyYXRvcixcbiAgQmFzZUVudkRlbGVnYXRlLFxuICBjcmVhdGVUZW1wbGF0ZUZhY3RvcnksXG4gIHRlbXBsYXRlT25seUNvbXBvbmVudCxcbiAgc2V0Q29tcG9uZW50TWFuYWdlcixcbiAgc2V0TW9kaWZpZXJNYW5hZ2VyLFxuICBzZXRIZWxwZXJNYW5hZ2VyLFxuICBjb21wb25lbnRDYXBhYmlsaXRpZXMsXG4gIG1vZGlmaWVyQ2FwYWJpbGl0aWVzLFxuICBoZWxwZXJDYXBhYmlsaXRpZXMsXG4gIHNldENvbXBvbmVudFRlbXBsYXRlLFxuICBnZXRPd25lcixcbiAgc2V0T3duZXIsXG4gIHByZWNvbXBpbGVUZW1wbGF0ZSxcbn07XG5leHBvcnQgZGVmYXVsdCB7XG4gIHJlbmRlckNvbXBvbmVudCxcbiAgZGlkUmVuZGVyLFxuICBnZXRUZW1wbGF0ZUl0ZXJhdG9yLFxuICBCYXNlRW52RGVsZWdhdGUsXG4gIGNyZWF0ZVRlbXBsYXRlRmFjdG9yeSxcbiAgdGVtcGxhdGVPbmx5Q29tcG9uZW50LFxuICBzZXRDb21wb25lbnRNYW5hZ2VyLFxuICBzZXRNb2RpZmllck1hbmFnZXIsXG4gIHNldEhlbHBlck1hbmFnZXIsXG4gIGNvbXBvbmVudENhcGFiaWxpdGllcyxcbiAgbW9kaWZpZXJDYXBhYmlsaXRpZXMsXG4gIGhlbHBlckNhcGFiaWxpdGllcyxcbiAgc2V0Q29tcG9uZW50VGVtcGxhdGUsXG4gIGdldE93bmVyLFxuICBzZXRPd25lcixcbiAgcHJlY29tcGlsZVRlbXBsYXRlLFxufTtcbiJdfQ==
  `)
]);

console.log('@glimmer/core fixed');
