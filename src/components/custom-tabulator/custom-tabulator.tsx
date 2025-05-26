import { Build, Component, Event, Prop, Env, EventEmitter, State, JSX, Method, h, Listen } from '@stencil/core';
import { TabulatorFull, RowComponent, CellComponent, Options, FormatterParams, DownloadType, DownloadOptions } from 'tabulator-tables';
import * as bootstrap from 'bootstrap';
import { CellHelper, checkResponseStatus, HtmlHelper, RowHelper } from '../../utils/utils';
import { CustomTabulatorColumn, CustomTabulatorRecMatching } from '../../interfaces/custom-tabulator.types';
import { singular } from 'pluralize';
import { DateTime } from 'luxon';
import Swal from 'sweetalert2';

@Component({
  tag: 'custom-tabulator',
  styleUrl: 'custom-tabulator.css',
  shadow: false,
})
export class CustomTabulator {
  @Prop({ mutable: true }) public tabulatorComponent: TabulatorFull;
  private modals = new Array<bootstrap.Modal>();
  @State() editingRowData: Object = new Object();
  @State() previousData: any;
  @Prop({ mutable: true }) postRoute: string;
  @Prop() name!: string;
  @Prop() componentTitle?: string;
  @Prop() route!: string;
  @Prop() columns!: Array<CustomTabulatorColumn>;
  @Prop() idPropName: string = 'uuid';
  @Prop() editionMode: 'inline' | 'modal' | 'side' | 'bottom' = 'inline';
  @Prop() treeConfig: false | { childField: string; parentField: string; hideAddChild?: (row: any) => boolean } = false;
  @Prop() readOnly: boolean | 'updateOnly' | 'createOnly' = false;
  @Prop() height: string | number | false = false;
  @Prop() tabulatorLayout: 'fitDataStretch' | 'fitData' | 'fitColumns' | 'fitDataFill' | 'fitDataTable' = 'fitDataStretch';
  @Prop() data?: any;
  @Prop() tabEndNewRow?: boolean = true;
  @State() modalRow?: RowComponent;
  @Prop() rowDefault?: Object;
  @Prop() childRowDefault?: Object;
  @Prop() download?: { type: DownloadType; fileName: () => string | string; options: DownloadOptions };
  @Prop() options?: Options = {};
  @State() editedRow?: RowComponent;
  @State() actionButtonTagsContainer;
  // needs to have tableid props
  @Prop() actionButtonTags: (string | { tag: string; props: any })[];
  @Prop() confirmBeforeDelete = false;
  @Prop() index: string = 'uuid';
  @Prop() requestHeaders: { [key: string]: string };
  @Prop() isDeletionPermited: boolean = true;

  // it can looks like an array : ["show-log-button", "other-action-button"]
  // OR
  // {
  //     "tag": "show-log-button",
  //     "props": {
  //       "hiddencolumns": ["comment", "name"]
  //       "tableName": "module"
  //     }
  // },
  @Event({ bubbles: true, composed: true }) rowSelected: EventEmitter<{ rows: RowComponent[]; componentName: string }>;
  @Event({ bubbles: true, composed: true }) rows: EventEmitter<{ rows: RowComponent[]; componentName: string }>;
  @Event({ bubbles: true, composed: true }) loadedTable: EventEmitter<{ table: CustomTabulatorRecMatching; componentName: string }>;
  @Event({ bubbles: true, composed: true }) tableBuilt: EventEmitter<{ table: CustomTabulatorRecMatching; componentName: string }>;
  @Event({ bubbles: true, composed: true }) rowDeleted: EventEmitter<{ row: RowComponent; componentName: string }>;
  @Event({ bubbles: true, composed: true }) rowSaved: EventEmitter<{ rows: RowComponent[]; componentName: string }>;
  @Event({ bubbles: true, composed: true }) rowEditionButtonClicked: EventEmitter<{ row: RowComponent; componentName: string }>;

  closeOnSave: boolean = false;

  @Listen('hide.bs.modal')
  hideModalHandler() {
    this.rowFormater(this.editedRow);
    setTimeout(() => (this.editedRow = undefined), 10);
  }
  @Listen('openEditModal', { target: 'document' })
  handleOpenEditModal(event: CustomEvent<{ id: string }>) {
    const row = this.tabulatorComponent.getRow(event.detail.id);
    event.stopPropagation();
    if (this.editedRow) {
      if (this.editedRow.getElement()) {
        this.editedRow.getElement().style.borderBottomColor = '#dee2e6';
        this.editedRow.getElement().style.borderBottomWidth = '1px';
      }
    }
    this.editedRow = row;
    this.editedRow.getElement().style.borderBottomColor = '#c0dbf3';
    this.editedRow.getElement().style.borderBottomWidth = '2px';

    setTimeout(() => {
      const detailContainer = document.getElementById(`${this.name}-detail-container`);
      detailContainer.classList.remove(`d-none`);
      const form = detailContainer.querySelector('form');
      if (!form) return;
      Array.from(form.elements).forEach((formElem: HTMLElement) => {
        if (formElem.tagName === 'BUTTON') return;
        formElem.style.backgroundColor = 'inherit';
      });
      if (this.editionMode === 'modal') {
        const modalElement = document.getElementById(`${this.name}-editrow-modal`);
        if (modalElement) {
          const modal = new bootstrap.Modal(modalElement);
          this.modals.push(modal);
        }
        this.modals[0].show();
      }
    }, 100);
  }
  private cleanColumns(columns: CustomTabulatorColumn[]): CustomTabulatorColumn[] {
    return columns.map(col => {
      const { hideInModal, modalFieldGroup, editorReadOnly, ...cleanCol } = col;
      return cleanCol;
    });
  }

  async componentWillLoad() {
    // if (!this.idPropName) this.idPropName = 'uuid';
    // if the route to save isn't set, then use the route to get the data
    if (!this.postRoute) {
      this.postRoute = this.route;
    }
    if (this.data) {
      this.previousData = this.data;
    }
    await this.loadLookups();
    // console.debug(this.columns);
    for (const col of this.columns) {
      if (col.editorParams?.['valuesLookup']) {
        // console.debug(col.field)
        await this.fillLookup(col);
      }
    }
  }
  componentDidLoad(): void {
    if (Build.isBrowser) {
      document.addEventListener('keydown', this.handleKeydown.bind(this));
      if (!this.readOnly) {
        this.columns.push({
          title: '',
          field: 'custom-tabulator-controls',
          hozAlign: 'right',
          headerSort: false,
          resizable: false,
          width: 150,
          formatter: (cell: CellComponent, _fp: FormatterParams): string | HTMLElement => {
            const record = cell.getRow().getData();
            // console.debug(record);
            const isNew = !record[this.idPropName];
            const hasChilds = this.treeConfig ? cell.getRow().getTreeChildren().length > 0 : false;
            const btnGroup = HtmlHelper.toElement('<div class="btn-group" style="height: 31px"></div>');

            if (this.editionMode !== 'inline' && this.editionMode !== 'side' && this.editionMode !== 'bottom') {
              const editBtn = HtmlHelper.toElement(
                `<button name="editBtn" title="edit" class="btn btn-sm btn-secondary btn-width" type="button" data-bs-toggle="modal" data-bs-target="#${this.name}-editrow-modal">${
                  isNew ? 'Add' : 'Edit'
                }</button>`,
              );
              editBtn.onclick = event => {
                event.stopPropagation();
                if (this.editedRow) {
                  if (this.editedRow.getElement()) {
                    this.editedRow.getElement().style.borderBottomColor = '#dee2e6';
                    this.editedRow.getElement().style.borderBottomWidth = '1px';
                  }
                }
                this.editedRow = cell.getRow();
                this.editedRow.getElement().style.borderBottomColor = '#c0dbf3';
                this.editedRow.getElement().style.borderBottomWidth = '2px';
                if (this.editionMode !== 'modal') {
                  const detailContainer = document.getElementById(`${this.name}-detail-container`);
                  detailContainer.classList.remove(`d-none`);
                  const form = detailContainer.querySelector('form');

                  if (!form) return;
                  Array.from(form.elements).forEach((formElem: HTMLElement) => {
                    // console.debug(formElem.tagName);
                    if (formElem.tagName === 'BUTTON') return;
                    formElem.style.backgroundColor = 'inherit';
                  });
                }
                this.rowEditionButtonClicked.emit({ row: cell.getRow(), componentName: this.name });
              };
              btnGroup.insertBefore(editBtn, null);
            }
            if (isNew) {
              const createBtn = HtmlHelper.toElement('<button name="createBtn" class="btn btn-sm btn-secondary" title="create" hidden><i class="bi bi-plus-square"></i></button>');
              createBtn.onclick = event => {
                event.stopPropagation();
                this.saveRow(cell.getRow());
              };
              btnGroup.insertBefore(createBtn, null);
            }
            const addChildVisible = this.treeConfig && !RowHelper.hasChilds(cell.getRow(), true, this.idPropName) && !this.treeConfig.hideAddChild?.(cell.getData());

            const addChildBtn = HtmlHelper.toElement(
              `<button name="addChildBtn" class="btn btn-sm btn-secondary" title="add child" ${addChildVisible ? '' : 'hidden'}><i class="bi bi-node-plus"></i></button>`,
            );
            addChildBtn.onclick = event => {
              if (!this.treeConfig) throw new Error('not possible');
              event.stopPropagation();
              const row = cell.getRow();

              let newRowValue;
              if (this.childRowDefault) newRowValue = JSON.parse(JSON.stringify(this.childRowDefault));
              else if (this.rowDefault) newRowValue = JSON.parse(JSON.stringify(this.rowDefault));
              else newRowValue = {};

              newRowValue[this.treeConfig.parentField] = row.getData()[this.idPropName];
              row.addTreeChild(newRowValue, true);
              row.treeExpand();
            };
            const updateBtn = HtmlHelper.toElement(
              `<button name="updateBtn" class="btn btn-sm btn-secondary" ${cell.getRow() ? 'hidden' : ''} title="update"><i class="bi bi-save"></i></button>`,
            );
            updateBtn.onclick = event => {
              event.stopPropagation();
              this.saveRow(cell.getRow());
            };
            if (this.editionMode === 'inline') {
              if (this.actionButtonTags) {
                this.actionButtonTags.forEach(button => {
                  let buttonElement: Node;

                  if (typeof button === 'string') {
                    // button is a string
                    buttonElement = HtmlHelper.toElement(`<${button} tableid="${cell.getRow().getData().uuid}"/>`);
                  } else if (button.tag && button.props) {
                    // button is an object with 'tag' and 'props'
                    let elementString = `<${button.tag} tableid="${cell.getRow().getData().uuid}"`;

                    for (const prop in button.props) {
                      if (button.props.hasOwnProperty(prop)) {
                        elementString += ` ${prop}="${button.props[prop]}"`;
                      }
                    }

                    elementString += '/>';
                    buttonElement = HtmlHelper.toElement(elementString);
                  }
                  btnGroup.insertBefore(buttonElement, null);
                });
              }
              const deleteBtn = HtmlHelper.toElement(
                `<button name="deleteBtn" class="btn btn-sm btn-secondary" title="delete" ${hasChilds ? 'hidden' : ''}><i class="bi bi-trash3"></i></button>`,
              );
              deleteBtn.onclick = event => {
                event.stopPropagation();
                if (this.confirmBeforeDelete) {
                  const userInput = prompt('Please type "delete" to confirm the deletion:');
                  if (userInput && userInput.toLowerCase() === 'delete') {
                    this.deleteRow(cell.getRow());
                  } else {
                    alert('Deletion cancelled. You must type "delete" to confirm.');
                  }
                } else {
                  confirm('Delete record?') ? this.deleteRow(cell.getRow()) : '';
                }
              };
              if (this.isDeletionPermited) {
                btnGroup.insertBefore(deleteBtn, null);
              }
            }

            btnGroup.insertBefore(addChildBtn, null);
            btnGroup.insertBefore(updateBtn, null);
            const container = HtmlHelper.toElement('<div class="look-cont" style="width: 100%; text-align: left"></div>');

            container.insertBefore(btnGroup, null);
            return container;
          },
          titleFormatter: () => {
            const btnGroup = HtmlHelper.toElement('<div class=""></div>');
            const revertChangesBtn = HtmlHelper.toElement(
              `<button id="${this.name}-revert-btn" class="btn btn-sm btn-secondary" title="Revert changes" hidden>Revert all</button>`,
            );
            revertChangesBtn.onclick = () => {
              const detailContainer = document.getElementById(`${this.name}-detail-container`);
              this.revertTable();
              this.resetFormElementStyles(detailContainer);
            };

            const saveTableBtn = HtmlHelper.toElement(`<button id="${this.name}-save-all-btn" class="btn btn-sm btn-primary" title="save all" hidden>Save all</button>`);

            saveTableBtn.onclick = () => {
              this.saveTable();
            };
            btnGroup.insertBefore(revertChangesBtn, null);
            btnGroup.insertBefore(saveTableBtn, null);
            const container = HtmlHelper.toElement('<div style="width: 100%; text-align: left"></div>');
            container.insertBefore(btnGroup, null);
            return container;
          },
        });
      }
      if (this.editionMode !== 'inline' || this.readOnly) {
        // Prevent user from editing the table directly if the customtabulator is set to modal
        this.columns.forEach(col => (col.editable = false));
      }
      // feature to set the cell color when editing
      this.columns?.forEach(col => {
        if (col.cellEdited) {
          const initialCellEdited = col.cellEdited;
          col.cellEdited = cell => {
            initialCellEdited(cell);
            this.cellEdited(cell);
          };
        } else {
          col.cellEdited = this.cellEdited;
        }
      });

      if (this.options.selectable === undefined) {
        //only if not explitely set (contextual default value)
        if (!this.readOnly && ['side', 'bottom'].includes(this.editionMode)) this.options.selectable = 1;
        if (!this.readOnly && this.editionMode === 'inline') this.options.selectable = false;
      }

      Object.assign(this.options, {
        index: this.index,
        layout: this.tabulatorLayout,
        height: this.height,
        dataTree: this.treeConfig,
        dataTreeChildField: this.treeConfig ? this.treeConfig.childField : undefined,
        dataTreeChildIndent: 10,
        dataTreeCollapseElement: '<small class="bi bi-caret-down"></small>',
        dataTreeExpandElement: '<small class="bi bi-caret-right"></small>',
        dataTreeBranchElement: '<small>└</small>',
        columns: this.columns,
        addRowPos: 'bottom',
        validationMode: 'highlight',
        rowFormatter: this.rowFormater,
      } as Options);
      if (this.data) {
        this.options.data = this.data;
      } else {
        this.options.ajaxURL = `${Env.apiUrl}/${this.route}`;
        this.options.ajaxRequestFunc
          ? this.options.ajaxRequestFunc
          : (this.options.ajaxRequestFunc = async function (url, config, params) {
              try {
                let response = await fetch(url, {
                  method: config.method || 'GET',
                  headers: config.headers || {},
                  body: config.method === 'POST' ? JSON.stringify(params) : null,
                });
                return checkResponseStatus(response);
              } catch (error) {
                console.error('AJAX Request Error:', error);
                Swal.fire({
                  position: 'top-end',
                  toast: true,
                  icon: 'error',
                  title: 'Error',
                  text: 'An error occurred while loading data.',
                  timer: 3000,
                  timerProgressBar: true,
                  showConfirmButton: false,
                });
                return [];
              }
            });
      }
      this.tabulatorComponent = new TabulatorFull(`#${this.name}`, {
        ...this.options,
        columns: this.cleanColumns(this.columns),
      });

      this.tabulatorComponent.on('tableBuilt', function () {
        if (this.data) {
          this.customTabulator
            .replaceData(this.data)
            .catch(err => console.error(err))
            .then(() => {});
        }
      });
      this.tabulatorComponent.on('tableBuilt', () => {
        this.tableBuilt.emit({ table: { tabulatorInstance: this.tabulatorComponent }, componentName: this.name });
      });
      this.tabulatorComponent.on('dataLoaded', data => {
        this.rows.emit({ rows: this.tabulatorComponent.getRows(), componentName: this.name });

        if ([false, 'updateOnly'].includes(this.readOnly) && this.tabEndNewRow) {
          // add new row for insertion
          data.push(this.rowDefault ? JSON.parse(JSON.stringify(this.rowDefault)) : {});
        }
        this.loadedTable.emit({ table: { tabulatorInstance: this.tabulatorComponent }, componentName: this.name });
      });
      this.tabulatorComponent.on('cellEdited', (cell: CellComponent) => {
        // store "real" initial value of field that survives row.reformat()
        const rowData = cell.getRow().getData();
        if (!rowData.__initialValues) rowData.__initialValues = {};
        if (!rowData.__initialValues[cell.getField()]) rowData.__initialValues[cell.getField()] = cell.getInitialValue();
      });
      this.tabulatorComponent.on('rowClick', (_ev: any, row: RowComponent) => {
        const clickedRowElement = row.getElement();
        const isRowCurrentlySelected = clickedRowElement.classList.contains('selected-row');
        // const hasNewChildRows = this.treeConfig && RowHelper.hasChilds(row, true, this.idPropName);

        const clearRowClass = (row: RowComponent) => {
          if (row && row.getElement) {
            const rowElement = row.getElement();
            rowElement.classList.remove('selected-row');

            // Check if `getTreeChildren` is a function and the row supports tree structure
            if (row.getTreeChildren && typeof row.getTreeChildren === 'function' && this.options.dataTree) {
              try {
                const childRows = row.getTreeChildren();
                if (Array.isArray(childRows) && childRows.length > 0) {
                  childRows.forEach(clearRowClass); // Recursively clear classes
                }
              } catch (error) {
                console.error('Error while processing tree children:', error);
              }
            }
          }
        };
        if (this.options.selectable === 1) {
          // Currently only single row selection is handled
          this.tabulatorComponent.getRows().forEach(clearRowClass);

          if (!isRowCurrentlySelected) {
            clickedRowElement.classList.add('selected-row');
          }
        }
        this.rowSelected.emit({ rows: [isRowCurrentlySelected ? null : row], componentName: this.name });
        const detailContainer = document.getElementById(`${this.name}-detail-container`);
        this.resetFormElementStyles(detailContainer);

        if (this.editionMode === 'side' || this.editionMode === 'bottom') {
          if (isRowCurrentlySelected) {
            this.editedRow = undefined;
            this.showSideEditionWindow(true);
          } else {
            this.editedRow = row;
            // console.log(this.editedRow.getData())
            this.updateFormWithRowData(detailContainer, row.getData());
            this.showSideEditionWindow();
          }
        }
      }) as any;

      if (this.editionMode !== 'inline' && this.editionMode !== 'bottom' && this.editionMode !== 'side')
        this.modals.push(new bootstrap.Modal(document.getElementById(`${this.name}-editrow-modal`)));
      if (this.download) {
        const downloadBtn = HtmlHelper.toElement(`<button name="downloadBtn" class="btn btn-sm btn-secondary">Download</button>`);
        downloadBtn.onclick = event => {
          event.stopPropagation();
          this.tabulatorComponent.download(
            this.download.type,
            typeof this.download.fileName === 'string' ? this.download.fileName : this.download.fileName(),
            this.download.options,
          );
        };
        setTimeout(() => {
          const tabulatorElem = document.querySelector(`#${this.name}`);
          let footerElem = tabulatorElem.querySelector('.tabulator-footer-contents');
          if (!footerElem) {
            const footelContainerElem = HtmlHelper.toElement(`<div class="tabulator-footer"></div>`);
            footerElem = HtmlHelper.toElement(`<div class="tabulator-footer-contents"></div>`);
            tabulatorElem.insertBefore(footelContainerElem, null);
            footelContainerElem.insertBefore(footerElem, null);
          }
          // console.debug(footerElem);
          footerElem?.insertBefore(downloadBtn, null);
        }, 50);
      }
      document.addEventListener('openEditModal', this.handleOpenEditModal.bind(this));
    }
  }
  async componentDidUpdate(): Promise<void> {
    if (this.data !== this.previousData) {
      let previousEditedRowData;

      if (this.editedRow) {
        previousEditedRowData = this.editedRow.getData();
      }

      if (this.data) {
        await this.tabulatorComponent.replaceData(this.data);
      }

      if (previousEditedRowData) {
        const newEditedRow = this.tabulatorComponent.getRows().find(row => row.getData()[this.idPropName] === previousEditedRowData[this.idPropName]);
        if (newEditedRow) {
          this.editedRow = newEditedRow;
        }
      }
      this.previousData = this.data;
    }

    await this.loadLookups();
    await Promise.all(
      this.columns.map(async col => {
        if (col.editorParams?.['valuesLookup']) {
          await this.fillLookup(col);
        }
      }),
    );
  }
  private resetFormElementStyles(detailContainer: HTMLElement) {
    const editorNames = Array.from(
      new Set(
        this.columns
          .map(col => {
            if (typeof col.editor === 'string' && this.editionMode !== 'inline') {
              switch (col.editor) {
                case 'input':
                case 'number':
                case 'password':
                  return 'input';
                case 'textarea':
                  return 'textarea';
                case 'select':
                case 'list':
                case 'autocomplete':
                  return 'select';
                case 'code':
                  return 'code-editor';
                case 'markdown':
                  return 'markdown-editor';
                default:
                  return null;
              }
            }
            return null;
          })
          .filter(Boolean),
      ),
    );

    editorNames.forEach(type => {
      Array.from(detailContainer.querySelectorAll(type)).forEach((formElem: HTMLElement) => {
        formElem.style.backgroundColor = 'inherit';
      });
    });
  }
  private handleKeydown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      this.saveTable();
    }
  }

  async loadLookups(): Promise<void> {
    const lookupColumns = this.columns.filter(c => (c.editorParams as any)?.valuesLookup);
    await Promise.all(
      lookupColumns.map(async c => {
        const editorParams = c.editorParams as any;
        const cell = this.editedRow?.getCells().find(cell => cell.getField() === c.field);
        editorParams.lookupValues = await editorParams.valuesLookup(cell);
      }),
    );
  }
  get nbRowsToSave(): number {
    if (!this.tabulatorComponent) return 0;
    const rowsToSave = this.tabulatorComponent.getRows().filter(r => RowHelper.isEdited(r) && RowHelper.isValid(r));
    return rowsToSave.length;
  }
  saveTable(): void {
    const rowsToSave = this.tabulatorComponent.getRows().filter(r => RowHelper.isEdited(r) && RowHelper.isValid(r));
    Promise.all(rowsToSave.map(async (row): Promise<void> => this.saveRow(row)));
  }
  async saveRow(row: RowComponent): Promise<void> {
    if (!RowHelper.isValid(row)) {
      alert('some values are invalid');
      return;
    }
    const data = row.getData();
    if ('isEnabled' in data && data.isEnabled === undefined) {
      data.isEnabled = false;
    }
    Object.keys(data).forEach(key => {
      if (data[key] === '\n') {
        data[key] = null;
      }
    });

    const id = data[this.idPropName];
    const isNew = RowHelper.isNew(row, this.idPropName);
    fetch(`${Env.apiUrl}/${this.postRoute}/${id || ''}`, {
      method: isNew ? 'POST' : 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...this.requestHeaders,
      },
      body: JSON.stringify(data),
    })
      .then(res => {
        if (res.status === 403) {
          throw new Error(`Access forbidden to the resource.`);
        } else if (res.status === 401) {
          const provider = document.cookie
            .split(';')
            .map(cookie => cookie.trim().split('='))
            .find(([name]) => name === 'provider')?.[1];
          window.open(provider ? `${Env.authUrl}/${provider}?` : `${Env.rootPath}login`, 'authWindow');
          throw new Error(`Access not authorized to the resource.`);
        } else if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        res.json().then(async json => {
          // console.debug(this.idPropName);
          // The Api must returns a JSON so we can get the id correctly update the Table
          if (typeof json !== 'object' || !json[this.idPropName]) throw new Error('object was not returned');
          Object.assign(data, json);
          row.reformat();
          // await new Promise((resolve: (val: any) => any, _reject: (msg) => void) => {
          //   setTimeout(() => {
          //     resolve('a');
          //   }, 1000);
          // });
          // reset initial values as object is in sync with the server
          data.__initialValues = {};
          this.rowFormater(row);
          row.getCells().forEach(c => {
            // c.cancelEdit();
            c.clearEdited();
            const cellObj = (c as any)._cell;
            cellObj.initialValue = c.getValue();
            c.getElement().style.backgroundColor = 'inherit';
            this.cellEdited(c);
          });
          const detailContainer = document.getElementById(`${this.name}-detail-container`);
          this.resetFormElementStyles(detailContainer);

          this.rowSaved.emit({ rows: [row], componentName: this.name });
          if (isNew) {
            if (this.treeConfig && row.getData()[this.treeConfig.parentField]) {
              // is a child
              const parentRow = row.getTreeParent();
              if (!parentRow) throw new Error('Child row has no parent... should not happen');
              this.cellEdited(parentRow.getCells()[1]);
            } else {
              // is a root
              !this.tabEndNewRow ? '' : this.tabulatorComponent.addRow([this.rowDefault ? JSON.parse(JSON.stringify(this.rowDefault)) : {}]);
            }
          }
        });
      })
      .catch(err => {
        Swal.fire({
          icon: 'error',
          title: 'Saving Failed',
          text: err.message || 'An unexpected error occurred while deleting the record.',
        });
        console.error('Error deleting row:', err);
        throw err;
      });
  }
  deleteRow(row: RowComponent): Promise<void> {
    return new Promise((resolve, reject) => {
      const value = row.getData();

      if (value[this.idPropName]) {
        fetch(`${Env.apiUrl}/${this.postRoute}/${value[this.idPropName]}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...this.requestHeaders,
          },
        })
          .then(async response => {
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(errorText || response.statusText);
            }
          })
          .then(() => {
            row.delete();
            this.rowDeleted.emit({ row, componentName: this.name });
            this.showSideEditionWindow(true);
            resolve();
          })
          .catch(err => {
            console.error('Error deleting row:', err);
            reject(err);
          });
      } else {
        row.delete();
        this.showSideEditionWindow(true);
        resolve();
      }
    });
  }

  revertTable(): void {
    // debugger;
    if (!this.tabulatorComponent) return;
    const editedRows = this.tabulatorComponent.getRows().filter(r => RowHelper.isEdited(r));
    editedRows.forEach(row => this.revertRow(row));
  }
  revertRow(row: RowComponent): void {
    const rowData = row.getData();
    const editedCells = row.getCells().filter(c => c.isEdited());
    editedCells.forEach(cell => {
      cell.setValue(rowData.__initialValues[cell.getField()]);
      cell.clearEdited();
      this.cellEdited(cell);
    });
    this.rowFormater(row);
  }
  hideDetail = (): void => {
    const detailContainer = document.getElementById(`${this.name}-detail-container`);
    detailContainer.classList.add(`d-none`);

    if (this.editedRow) {
      this.editedRow.getElement().style.borderBottomColor = '#dee2e6';
      this.editedRow.getElement().style.borderBottomWidth = '1px';
    }
  };
  rowFormater = (row: RowComponent): void => {
    if (this.readOnly) return;
    if (!row) return;

    const rowData = row.getData();
    // console.debug(rowData);
    if (!rowData.__initialValues) rowData.__initialValues = {};
    row.getCells().forEach(cell => {
      const ctValue = cell.getValue();
      const initialValue = rowData.__initialValues[cell.getField()] || cell.getInitialValue();
      if (!!ctValue === false && !!initialValue === false && ctValue !== initialValue) {
        // !! comparison covers undefined equals empty string
        if (cell.isEdited()) {
          cell.cancelEdit();
          cell.clearEdited();
        }
        delete cell.getElement().style.backgroundColor;
      } else if (initialValue !== undefined && ctValue?.equals ? !ctValue.equals(initialValue) : ctValue !== initialValue) {
        cell.getElement().style.backgroundColor = 'rgb(255, 251, 213)';
        row.getElement().classList.add('edited-row');
        const cellObj = (cell as any)._cell;
        cellObj.initialValue = initialValue;
        if (!cell.isEdited()) {
          cellObj.modules['edit'] = { edited: true };
        }
      } else {
        cell.getElement().style.backgroundColor = 'inherit';
      }
    });
    if (RowHelper.isEdited(row)) row.getElement().style.backgroundColor = 'rgb(255, 251, 213)';
    else {
      row.getElement().style.backgroundColor = row.getElement().classList.contains('tabulator-row-even') ? 'rgba(0, 0, 0, 0.05)' : 'inherit';
      row.getElement().classList.remove('edited-row');
    }

    // global buttons
    const revertBtn = document.getElementById(`${this.name}-revert-btn`);
    const saveAllBtn = document.getElementById(`${this.name}-save-all-btn`);
    const allRows = row.getTable().getRows();

    const readyToSaveRows = allRows.filter(r => RowHelper.isEdited(r) && RowHelper.isValid(r));
    const readyToRevertRows = allRows.filter(r => RowHelper.isEdited(r));
    if (revertBtn) {
      revertBtn.hidden = readyToRevertRows.length === 0;
    }
    if (saveAllBtn) {
      saveAllBtn.hidden = readyToSaveRows.length === 0;
    }
  };
  cellEdited = (cell: CellComponent): void => {
    const row = cell.getRow();
    const isNew = RowHelper.isNew(row, this.idPropName);
    const cells = row.getCells();
    const rowEdited = RowHelper.isEdited(row);
    const commandCell = cells[cells.length - 1];
    const rowInvalid = !RowHelper.isValid(row);
    // const hasChildRows = this.treeConfig && RowHelper.hasChilds(row);
    const hasNewChildRows = this.treeConfig && RowHelper.hasChilds(row, true, this.idPropName);
    const hideAddChild = this.treeConfig && this.treeConfig.hideAddChild && this.treeConfig.hideAddChild(row.getData());
    let rowBtns;
    if (!this.readOnly) {
      rowBtns = Array.from(((commandCell.getElement().firstElementChild as HTMLElement).firstElementChild as HTMLElement).children) as HTMLButtonElement[];
      if (rowBtns.find(btn => btn.name === 'createBtn')) {
        // add create button
        rowBtns.find(btn => btn.name === 'createBtn').hidden = rowInvalid || !isNew;
      }

      // add child button
      (rowBtns.find(btn => btn.name === 'addChildBtn') as HTMLElement).hidden = !this.treeConfig || hideAddChild || isNew || hasNewChildRows;

      // update button
      (rowBtns.find(btn => btn.name === 'updateBtn') as HTMLElement).hidden = rowInvalid || !rowEdited || isNew;

      // delete button
      // (rowBtns.find(btn => btn.name === 'deleteBtn') as HTMLElement).hidden = hasChildRows;
      this.rowFormater(row);
    }
  };
  detailHandleCodeEditorChange(event: any, fieldName: string): void {
    if (!this.editedRow) throw new Error('expecting modalRow to be set');
    const cell = this.editedRow.getCells().find(c => c.getField() === fieldName);
    let value = event.detail;
    cell.setValue(value);
    this.cellEdited(cell);
    if (value === '') value = null;

    let currentElement = event.target as HTMLElement;
    while (currentElement && currentElement.tagName !== 'CODE-EDITOR') {
      currentElement = currentElement.parentElement as HTMLElement;
    }
    if (currentElement && currentElement.tagName === 'CODE-EDITOR') {
      currentElement.style.backgroundColor = 'rgb(255, 251, 213)';
    } else {
      currentElement = event.target as HTMLElement;
      currentElement.style.backgroundColor = 'rgb(255, 251, 213)';
    }

    // CellHelper.isEdited(cell) ? (event.target.style.backgroundColor = 'rgb(255, 251, 213)') : (event.target.style.backgroundColor = 'white');
  }
  // detailHandleMarkdownEditorChange(event: any, fieldName: string): void {
  //   if (!this.editedRow) throw new Error('expecting modalRow to be set');
  //   const cell = this.editedRow.getCells().find(c => c.getField() === fieldName);
  //   let value = event.detail;
  //   cell.setValue(value);
  //   this.cellEdited(cell);
  //   if (value === '') value = null;

  //   let currentElement = event.target as HTMLElement;
  //   currentElement.style.backgroundColor = 'rgb(255, 251, 213)';

  //   // CellHelper.isEdited(cell) ? (event.target.style.backgroundColor = 'rgb(255, 251, 213)') : (event.target.style.backgroundColor = 'white');
  // }

  detailHandleFormChange(event: any, fieldName: string): void {
    if (!this.editedRow) throw new Error('expecting modalRow to be set');
    const cell = this.editedRow.getCells().find(c => c.getField() === fieldName);
    // let value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    let value;

    if (event.target.type === 'checkbox') {
      value = event.target.checked;
    } else {
      value = event.target.value;
    }

    if (value === '') value = null;
    cell.setValue(value);
    this.cellEdited(cell);

    if (event.target.type !== 'checkbox') {
      const isCodeEditor = event.target.classList.contains('cm-content');

      if (isCodeEditor) {
        let currentElement = event.target as HTMLElement;
        while (currentElement && currentElement.tagName !== 'CODE-EDITOR') {
          currentElement = currentElement.parentElement as HTMLElement;
        }
        if (currentElement && currentElement.tagName === 'CODE-EDITOR') {
          currentElement.style.backgroundColor = 'rgb(255, 251, 213)';
        }
      } else {
        CellHelper.isEdited(cell) ? (event.target.style.backgroundColor = 'rgb(255, 251, 213)') : (event.target.style.backgroundColor = 'rgb(255, 251, 213)');
      }
    }
  }
  showSideEditionWindow(hide = false) {
    const detailContainer = document.getElementById(`${this.name}-detail-container`);
    // this.resetFormElementStyles(detailContainer)

    if (detailContainer) {
      if (hide) detailContainer.classList.add('d-none');
      else detailContainer.classList.remove('d-none');
    } else {
      console.error('Detail container not found');
      return;
    }
  }

  @Method() async fillLookup(col: CustomTabulatorColumn): Promise<void> {
    const selectElement = document.getElementById(`modal-select-${col.field}`);
    if (!selectElement) {
      return;
    } else {
      selectElement.innerHTML = '<option value="">Select an option...</option>';
    }
    const values = col.editorParams['lookupValues'] || col.editorParams['values'];
    if (Array.isArray(values)) {
      values.forEach(v => {
        selectElement.insertBefore(HtmlHelper.toElement(`<option value="${v}" ${this.editedRow?.getData()[col.field] === v ? 'selected="selected"' : ''}>${v}</option>`), null);
      });
    } else {
      // method to be deleted, made only to support early stage of contacts feature !!!
      const getSelected = (col, k) => {
        if (col.type && col.type === 'array') {
          const fieldsArray = col.field.split('.');
          if (fieldsArray.length > 0 && this.editedRow?.getData()[fieldsArray[0]].length > 0) {
            return this.editedRow?.getData()[fieldsArray[0]][fieldsArray[1]].uuid === k ? 'selected="selected"' : '';
          }
        } else {
          return this.editedRow?.getData()[col.field] === k ? 'selected="selected"' : '';
        }
      };
      Object.keys(values).forEach(k => {
        selectElement.insertBefore(HtmlHelper.toElement(`<option value="${k}" ${getSelected(col, k)}>${values[k]}</option>`), null);
      });
    }
  }
  saveAndCloseRow() {
    this.hideDetail();
  }
  createDeleteButton() {
    return (
      <button type="button" name="deleteBtn" class="btn btn-sm btn-danger" title="delete" onClick={this.handleDeleteClick.bind(this)}>
        <i class="bi bi-trash3 pr-2"></i> Delete Record
      </button>
    );
  }

  handleDeleteClick(event) {
    event.stopPropagation();
    if (this.confirmBeforeDelete) {
      const userInput = prompt('Please type "delete" to confirm the deletion:');
      if (userInput && userInput.toLowerCase() === 'delete') {
        this.deleteRow(this.editedRow);
        if (this.editionMode === 'modal') {
          this.modals[0].hide();
        }
      } else {
        alert('Deletion cancelled. You must type "delete" to confirm.');
      }
    } else {
      Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to delete this record? This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
      }).then(result => {
        if (result.isConfirmed) {
          this.deleteRow(this.editedRow)
            .then(() => {
              if (this.editionMode === 'modal') {
                this.modals[0].hide();
              }

              Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Deleted!',
                text: 'The record has been deleted.',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
              });
            })
            .catch(err => {
              Swal.fire({
                icon: 'error',
                title: 'Deletion Failed',
                text: err.message || 'An unexpected error occurred while deleting the record.',
              });
              console.error('Error deleting row:', err);
            });
        }
      });
    }
  }

  createActionButtonGroup(): JSX.Element {
    const buttons: string[] = this.actionButtonTags.map(button => {
      let buttonElement: string;
      if (typeof button === 'string') {
        buttonElement = `<${button} tableid="${this.editedRow?.getData().uuid}"/>`;
      } else if (button.tag && button.props) {
        let elementString = `<${button.tag} tableid="${this.editedRow?.getData().uuid}"`;
        for (const prop in button.props) {
          if (button.props.hasOwnProperty(prop)) {
            elementString += ` ${prop}="${button.props[prop]}"`;
          }
        }
        elementString += '/>';
        buttonElement = elementString;
      }
      return buttonElement;
    });
    return <div class="" id="side-modal-btn-group" style={{ height: '31px' }} innerHTML={buttons.join('')}></div>;
  }
  getModalForm(isMap: boolean = false): JSX.Element {
    if (!this.editedRow) return '';
    let alignClass: string;
    const cols = this.columns.filter(c => c.field !== 'custom-tabulator-controls');
    const groups = [...new Set(cols.map(col => col.modalFieldGroup))].filter(Boolean);
    const colQuantity = Math.floor(12 / groups.length).toString();
    return (
      <div class={{ 'modal-content': true }}>
        <div class="modal-header">
          <div>
            <h5 class="modal-title">{`${!!this.editedRow?.getData()[this.idPropName] ? 'Update' : 'Create'} ${this.componentTitle ? singular(this.componentTitle) : ''}`}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
        </div>
        <form
          onSubmit={e => {
            e.preventDefault();
            this.saveRow(this.editedRow).then(() => {
              if (this.closeOnSave) {
                this.modals[0].hide();
              }
              this.rowFormater(this.editedRow);
            });
          }}
        >
          <div class="modal-body">
            <div class="container-fluid">
              <div class="row">
                {groups.map(group => (
                  <div class={`col-${colQuantity}`}>
                    <div class={`card ${isMap ? 'map-height' : ''}`}>
                      {group ? <div class="card-header">{group}</div> : ''}
                      <div class={`card-body ${alignClass}`}>{cols.filter(col => col.modalFieldGroup === group).map(def => this.getModalField(def))}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div class="modal-footer" style={{ marginRight: '1em' }}>
            <div class="btn-group" role="group" aria-label="record controls" style={{ margin: '.2em' }}>
              <button type="button" class="btn btn-sm btn-secondary" onClick={() => this.revertRow(this.editedRow)} data-bs-dismiss="modal" title="revert modifications and close">
                Cancel
              </button>
              <button
                type="button"
                class="btn btn-sm btn-secondary"
                onClick={() => {
                  if (this.editionMode !== 'modal') {
                    this.hideDetail();
                  }
                }}
                data-bs-dismiss="modal"
                title="keep unsaved modifications"
              >
                Close
              </button>
              <button
                type="submit"
                class="btn btn-sm btn-secondary"
                onClick={() => {
                  this.closeOnSave = false;
                  // this.saveRow(this.editedRow);
                }}
                title="save and keep the form open"
              >
                Save
              </button>
              <button
                type="submit"
                class="btn btn-sm btn-primary"
                onClick={() => {
                  if (this.editionMode !== 'modal') {
                    this.saveAndCloseRow();
                    this.revertRow(this.editedRow);
                  }
                  this.closeOnSave = true;
                }}
              >
                Save & close
              </button>
              {this.actionButtonTags && this.createActionButtonGroup()}
              {this.createDeleteButton()}
            </div>
          </div>
        </form>
      </div>
    );
  }
  getSideForm(isMap: boolean = false): JSX.Element {
    if (!this.editedRow) return '';
    let alignClass: string;
    const cols = this.columns.filter(c => c.field !== 'custom-tabulator-controls');
    const groups = [...new Set(cols.map(col => col.modalFieldGroup))].filter(Boolean);
    const colQuantity = Math.floor(12 / groups.length).toString();

    return (
      <div class="">
        <div class="side-detail-title">
          <h5>{`${!!this.editedRow?.getData()[this.idPropName] ? 'Update' : 'Create'} ${this.componentTitle ? singular(this.componentTitle) : ''}`}</h5>
        </div>
        <form
          onSubmit={e => {
            e.preventDefault();
            this.saveRow(this.editedRow).then(() => {
              if (this.closeOnSave) {
                // this.modals[0].hide();
                this.hideDetail();
                this.rowFormater(this.editedRow);
                this.editedRow = undefined;
              }
              this.rowFormater(this.editedRow);
            });
          }}
        >
          <div
            class="row"
            style={{
              maxHeight: `${+this.options.maxHeight - 80}px`,
              overflow: 'scroll',
            }}
          >
            {groups.map(group => (
              <div class={`col-${colQuantity}`}>
                <div class={`card ${isMap ? 'map-height' : ''}`}>
                  {group ? <div class="card-header">{group}</div> : ''}
                  <div class={`card-body ${alignClass}`}>{cols.filter(col => col.modalFieldGroup === group).map(def => this.getModalField(def))}</div>
                </div>
              </div>
            ))}
          </div>
          <div class="modal-footer" style={{ marginRight: '1em' }}>
            <div class="btn-group" role="group" aria-label="record controls" style={{ margin: '.2em' }}>
              <button
                type="button"
                class="btn btn-sm btn-secondary"
                onClick={() => {
                  this.revertRow(this.editedRow);
                  const detailContainer = document.getElementById(`${this.name}-detail-container`);
                  if (detailContainer) {
                    this.updateFormWithRowData(detailContainer, this.editedRow.getData());
                    this.updateCodeEditors(detailContainer, this.editedRow.getData());
                    this.resetFormElementStyles(detailContainer);
                  }
                }}
                title="revert modifications and close"
              >
                Cancel
              </button>
              <button
                type="button"
                class="btn btn-sm btn-secondary"
                onClick={() => {
                  if (this.editionMode !== 'modal') {
                    this.hideDetail();
                  }
                }}
                title="keep unsaved modifications"
              >
                Close
              </button>
              <button
                type="submit"
                class="btn btn-sm btn-secondary"
                onClick={() => {
                  this.closeOnSave = false;
                }}
                title="save and keep the form open"
              >
                Save
              </button>
              <button
                type="submit"
                class="btn btn-sm btn-primary"
                onClick={() => {
                  this.closeOnSave = true;
                }}
              >
                Save & close
              </button>
              {/* <show-log-button id={`show-log-${this.editedRow?.getData().uuid}`}></show-log-button> */}
              {/* <button type="button" class="btn btn-sm btn-secondary">Show Log</button> */}
            </div>
            <div class="btn-group" role="group">
              {this.actionButtonTags && this.createActionButtonGroup()}
              {this.createDeleteButton()}
            </div>
          </div>
        </form>
      </div>
    );
  }
  fillUpValue(def) {
    if (this.editedRow) {
      if (def.field) {
        if (def.field.includes('.')) {
          const fieldParts = def.field.split('.');
          let value = this.editedRow.getData();
          for (let part of fieldParts) {
            if (value && value.hasOwnProperty(part)) {
              value = value[part];
            } else {
              return '';
            }
          }
          return value;
        }
        if (!this.editedRow.getData()[def.field]) {
          return '';
        }
        return this.editedRow.getData()[def.field];
      }
    }
  }
  getFieldValue(field: string) {
    if (this.editedRow) {
      const data = this.editedRow.getData();
      if (field.includes('.')) {
        const fieldParts = field.split('.');
        let value = data;
        for (let part of fieldParts) {
          if (value && value.hasOwnProperty(part)) {
            value = value[part];
          } else {
            return '';
          }
        }
        return value;
      }

      return data[field] || '';
    }
    return '';
  }
  updateFormWithRowData(container: HTMLElement, rowData: any) {
    Object.entries(rowData).forEach(([key, value]) => {
      let inputElement: any = container.querySelector(`[name="${key}"]`);
      if (inputElement) {
        if (inputElement instanceof HTMLInputElement) {
          if (inputElement.type === 'checkbox') {
            inputElement.checked = value as boolean;
          } else {
            value ? (inputElement.value = value as string) : (inputElement.value = '');
          }
        } else if (inputElement instanceof HTMLTextAreaElement) {
          value ? (inputElement.value = value as string) : (inputElement.value = '');
        } else if (inputElement instanceof HTMLSelectElement) {
          value ? (inputElement.value = value as string) : (inputElement.value = '');
        }
      }
    });
  }
  updateCodeEditors(container: HTMLElement, rowData: any) {
    Object.entries(rowData).forEach(([key, value]) => {
      let codeEditorElement: any = container.querySelector(`#editor-${key}`);
      let markdownElement: any = container.querySelector(`#markdown-${key}`);
      if (markdownElement) {
        markdownElement.value = value as string;
      }
      if (codeEditorElement) {
        codeEditorElement.value = value as string;
      }
    });
  }

  getModalField(def: CustomTabulatorColumn): JSX.Element {
    const fieldId = `${this.name}-${def.field}`;
    const isHideInModal = typeof def.hideInModal === 'function' ? def.hideInModal(this.editedRow?.getCell(def.field)) : !!def.hideInModal;
    let displayNoneClass;
    isHideInModal ? (displayNoneClass = 'd-none') : (displayNoneClass = '');
    switch (def.editor) {
      case 'input':
      case 'number':
      case 'password':
        return (
          <div class={displayNoneClass}>
            <label class="w-100">
              {def.title}
              <input
                id={fieldId}
                name={def.field}
                type={def.editor === 'input' ? 'text' : def.editor}
                value={this.fillUpValue(def)}
                onInput={e => this.detailHandleFormChange(e, def.field)}
                style={{ backgroundColor: CellHelper.isEdited(this.editedRow?.getCell(def.field)) ? 'rgb(255, 251, 213)' : 'white' }}
                class="form-control"
                placeholder=""
                required={(def as any).required}
                disabled={typeof def.editorReadOnly === 'function' ? def.editorReadOnly(this.editedRow?.getCell(def.field)) : !!def.editorReadOnly}
                hidden={typeof def.hideInModal === 'function' ? def.hideInModal(this.editedRow?.getCell(def.field)) : !!def.hideInModal}
              />
            </label>
          </div>
        );
      case 'float':
        return (
          <div class={displayNoneClass}>
            <label class="w-100">
              {def.title}
              <input
                id={fieldId}
                name={def.field}
                type="number"
                step={0.01}
                value={this.editedRow?.getData()[def.field]}
                onInput={e => this.detailHandleFormChange(e, def.field)}
                style={{ backgroundColor: CellHelper.isEdited(this.editedRow?.getCell(def.field)) ? 'rgb(255, 251, 213)' : 'white' }}
                class="form-control"
                placeholder=""
                required={(def as any).required}
                disabled={typeof def.editorReadOnly === 'function' ? def.editorReadOnly(this.editedRow?.getCell(def.field)) : !!def.editorReadOnly}
                hidden={typeof def.hideInModal === 'function' ? def.hideInModal(this.editedRow?.getCell(def.field)) : !!def.hideInModal}
              />
            </label>
          </div>
        );
      case 'textarea':
        return (
          <div class={displayNoneClass}>
            <label class="w-100">
              {def.title}
              <textarea
                id={fieldId}
                name={def.field}
                hidden={typeof def.hideInModal === 'function' ? def.hideInModal(this.editedRow?.getCell(def.field)) : !!def.hideInModal}
                onFocus={e => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = '100px';
                  target.style.height = target.scrollHeight > 400 ? `400px` : `${target.scrollHeight}px`;
                }}
                onBlur={e => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = '100px';
                }}
                onInput={e => {
                  this.detailHandleFormChange(e, def.field);
                }}
                style={{
                  backgroundColor: CellHelper.isEdited(this.editedRow?.getCell(def.field)) ? 'rgb(255, 251, 213)' : 'white',
                  height: '100px',
                }}
                class="form-control"
                required={(def as any).required}
                value={this.editedRow?.getData()[def.field]}
                disabled={typeof def.editorReadOnly === 'function' ? def.editorReadOnly(this.editedRow?.getCell(def.field)) : !!def.editorReadOnly}
              >
                {this.editedRow?.getData()[def.field]}
              </textarea>
            </label>
          </div>
        );

      case 'code':
        return (
          <div class={displayNoneClass}>
            <label>{def.title}</label>
            <code-editor
              id={`editor-${def.field}`}
              style={{
                borderLeft: CellHelper.isEdited(this.editedRow?.getCell(def.field)) ? '2px rgb(255, 251, 213)' : '0px inherit',
              }}
              onInputChanged={event => this.detailHandleCodeEditorChange(event, def.field)}
              class="form-control"
              value={this.editedRow?.getData()[def.field]}
              relatedTo={def.field}
              obj={def.obj}
              hidden={typeof def.hideInModal === 'function' ? def.hideInModal(this.editedRow?.getCell(def.field)) : !!def.hideInModal}
            ></code-editor>
          </div>
        );
      case 'markdown':
        return (
          <div
            style={{
              border: '5px rgb(255, 251, 213)',
            }}
            class={displayNoneClass}
          >
            <label>{def.title}</label>
            <markdown-editor
              id={`markdown-${def.field}`}
              // textareaStyle={{
              //   backgroundColor: CellHelper.isEdited(this.editedRow?.getCell(def.field)) ? 'rgb(255, 251, 213)' : 'white',
              // }}
              onValueChanged={event => this.detailHandleCodeEditorChange(event, def.field)}
              class="form-control"
              value={this.editedRow?.getData()[def.field]}
            ></markdown-editor>
          </div>
        );
      case 'tickCross':
        return (
          <div class={displayNoneClass}>
            <label>{def.title}</label>

            <input
              id={fieldId}
              name={def.field}
              // defaultChecked={this.editedRow?.getData()[def.field]}
              checked={this.editedRow?.getData()[def.field]}
              onInput={e => this.detailHandleFormChange(e, def.field)}
              class="ms-1 customCheck"
              type="checkbox"
              required={(def as any).required}
              disabled={typeof def.editorReadOnly === 'function' ? def.editorReadOnly(this.editedRow?.getCell(def.field)) : !!def.editorReadOnly}
              hidden={typeof def.hideInModal === 'function' ? def.hideInModal(this.editedRow?.getCell(def.field)) : !!def.hideInModal}
            />
          </div>
        );
      case 'date':
        const dateValue = this.editedRow?.getData()[def.field];
        return (
          <div class={displayNoneClass}>
            <label htmlFor={def.title} class="form-label w-100">
              {def.title}
            </label>
            <input
              id={fieldId}
              name={def.field}
              type="date"
              value={DateTime.fromISO(dateValue).toFormat('yyyy-MM-dd')}
              onInput={e => this.detailHandleFormChange(e, def.field)}
              style={{ backgroundColor: CellHelper.isEdited(this.editedRow?.getCell(def.field)) ? 'rgb(255, 251, 213)' : 'inherit' }}
              class="form-control"
              placeholder=""
              required={(def as any).required}
              disabled={typeof def.editorReadOnly === 'function' ? def.editorReadOnly(this.editedRow?.getCell(def.field)) : !!def.editorReadOnly}
              hidden={typeof def.hideInModal === 'function' ? def.hideInModal(this.editedRow?.getCell(def.field)) : !!def.hideInModal}
            />
          </div>
        );
      case 'select':
      case 'list':
      case 'autocomplete':
        const elements: {
          value: string;
          selected: boolean;
          label: string;
        }[] = def.editorParams?.['values']
          ? Array.isArray(def.editorParams['values'])
            ? def.editorParams['values'].map(opt => ({
                value: opt,
                selected: this.getFieldValue(def.field) === opt,
                label: opt.toString(),
              }))
            : typeof def.editorParams['values'] === 'object'
            ? Object.keys(def.editorParams['values']).map(key => ({
                value: key,
                selected: this.getFieldValue(def.field) === key,
                label: def.editorParams['values'][key]?.toString(),
              }))
            : []
          : [];
        return (
          <div class={displayNoneClass}>
            <label class="w-100">
              {def.title}
              <select
                id={`modal-select-${def.field}`}
                name={def.field}
                onInput={e => this.detailHandleFormChange(e, def.field)}
                hidden={typeof def.hideInModal === 'function' ? def.hideInModal(this.editedRow?.getCell(def.field)) : !!def.hideInModal}
                // style={{ backgroundColor: CellHelper.isEdited(this.editedRow?.getCell(def.field)) ? 'rgb(255, 251, 213)' : 'inherit' }}
                class="form-select"
                aria-label="Default select example"
                required={(def as any).required}
                disabled={typeof def.editorReadOnly === 'function' ? def.editorReadOnly(this.editedRow?.getCell(def.field)) : !!def.editorReadOnly}
              >
                <option value="">Select an option...</option>
                {
                  elements.map(el => (
                    <option value={el.value} selected={el.selected}>
                      {el.label}
                    </option>
                  ))
                  // def.editorParams?.['values'] ?
                  //   typeof def.editorParams['values'] === 'object' ?
                  //     Object.keys(def.editorParams['values']).map((opt) =>
                  //       <option value={opt} selected={this.modalRow?.getData()[def.field] === opt}>{def.editorParams['values'][opt]}</option>
                  //     ) : Array.isArray(def.editorParams['values']) ?
                  //       def.editorParams['values'].map((opt) => <option value={opt} selected={this.modalRow?.getData()[def.field] === opt}>{opt}</option>) : '' : ''
                }
                {}
              </select>
            </label>
          </div>
        );
      case undefined:
        return (
          <div class={displayNoneClass}>
            <label>
              {def.title}
              <input
                id={fieldId}
                name={def.field}
                onInput={e => this.detailHandleFormChange(e, def.field)}
                type="text"
                class="form-control"
                placeholder=""
                required={(def as any).required}
                hidden={typeof def.hideInModal === 'function' ? def.hideInModal(this.editedRow?.getCell(def.field)) : !!def.hideInModal}
                disabled={typeof def.editorReadOnly === 'function' ? def.editorReadOnly(this.editedRow?.getCell(def.field)) : !!def.editorReadOnly}
                readOnly
              />
            </label>
          </div>
        );
      default:
        throw new Error(`Unknown field type '${def.editor}'`);
    }
  }

  getEditionModeContent = (): JSX.Element => {
    switch (this.editionMode) {
      case 'inline':
        return '';
      case 'modal':
        return (
          <div>
            <div class="modal fade" id={this.name + '-editrow-modal'} tabindex="-1" aria-hidden="false">
              <div class="modal-xl modal-dialog">{this.getModalForm()}</div>
            </div>
          </div>
        );
      case 'side':
      case 'bottom':
        return this.getSideForm(true);
    }
  };
  render() {
    const title = this.componentTitle ? <h5 style={{ textAlign: 'center' }}>{this.componentTitle}</h5> : '';

    return (
      <div class="container-fluid">
        <div class="row" style={{ border: 'solid 1px lightgrey' }}>
          <div class="col-md-12">{title}</div>
          <div
            class={{
              'col-md-12': ['inline', 'modal', 'bottom'].includes(this.editionMode),
              'col-md-8': this.editionMode === 'side',
            }}
            style={{ paddingRight: this.editionMode === 'side' ? '0' : 'calc(var(--bs-gutter-x) * 0.5)' }}
          >
            <div id={this.name}></div>
          </div>
          {this.editionMode !== 'inline' ? (
            <div
              id={`${this.name}-detail-container`}
              class={{
                'col-md-4': this.editionMode === 'side',
                'col-md-12': this.editionMode === 'bottom',
                'd-none': this.editionMode !== 'modal',
                'edition-content': true,
              }}
            >
              {this.getEditionModeContent()}
            </div>
          ) : (
            ''
          )}
        </div>
      </div>
    );
  }
}
