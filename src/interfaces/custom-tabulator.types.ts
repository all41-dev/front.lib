import { CellComponent, ColumnDefinition, Editor, TabulatorFull } from "tabulator-tables";

export type CustomTabulatorColumn = ColumnDefinition & {
  required?: boolean,
  createOnly?: boolean,
  updateOnly?: boolean,
  hideInModal?: ((cell: CellComponent) => boolean) | boolean;
  objectKeyProp?: string;
  modalFieldGroup?: string;
  editorReadOnly?: ((cell: CellComponent) => boolean) | boolean;
  editor?: Editor | 'markdown' | 'password' | 'input' | 'select' | 'autocomplete' | 'code' | 'float';
  obj?: any;
  type?: 'array'
}

export type CustomTabulatorRecMatching = {
  tabulatorInstance?: TabulatorFull,
}