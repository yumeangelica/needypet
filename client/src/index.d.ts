// Definition for Vue components
declare module '*.vue' {
  import type { DefineComponent } from 'vue';

  // biome-ignore lint/suspicious/noExplicitAny: required by the standard Vue SFC type shim
  const component: DefineComponent<object, object, any>;
  export default component;
}
