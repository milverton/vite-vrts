export interface IMeshCreationStep {
  execute: () => Promise<boolean>
}