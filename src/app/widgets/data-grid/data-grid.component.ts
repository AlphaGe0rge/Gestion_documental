import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

declare var bootstrap: any;

@Component({
  selector: 'app-data-grid',
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.css']
})
export class DataGridComponent implements OnInit {

  @Input() columns: { name: string; field: string; editable: boolean; width: string, show: boolean  }[] = [];
  @Input() data: any[] = [];
  @Input() childColumns: { name: string; field: string; show: boolean }[] = [];  // Para la tabla expandida
  @Input() editable: boolean = false; 
  @Input() showSelector: boolean = false; // Propiedad para mostrar u ocultar el selector
  @Input() showTree: boolean = false; // Propiedad para mostrar u ocultar el selector
  @Input() calculatedPromedio: boolean = false; // Propiedad para mostrar u ocultar el selector
  @Input() showDelete: boolean = false
  @Input() showEdit: boolean = false

  @Input() showColumnManager: boolean = true;
  @Input() showExcel: boolean = true;


  @Output() deleteEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() editEvent: EventEmitter<any> = new EventEmitter<any>();

  pageSize: number = 5;
  currentPage: number = 1;
  paginatedData: any[] = [];
  
  isModalVisible = false;
  
  get totalPages(): number[] {
    return Array(Math.ceil(this.data.length / this.pageSize)).fill(0).map((x, i) => i + 1);
  }

  columnSettings: { name: string; field: string; editable: boolean; show: boolean; }[] = [];
  
  constructor() { }
  
  ngOnInit() {

    this.columnSettings = JSON.parse(JSON.stringify(this.columns));

    this.paginateData();
  }
  
  paginateData() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedData = this.data.slice(start, end);
  }

  setPage(page: number) {
    this.currentPage = page;
    this.paginateData();
  }
  
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateData();
    }
  }
  
  nextPage() {
    if (this.currentPage < this.totalPages.length) {
      this.currentPage++;
      this.paginateData();
    }
  }
  
  addRow() {
    const newRow: any = {};
    this.columns.forEach(col => newRow[col.field] = '');
    this.data.push(newRow);
    this.paginateData();
  }
  
  deleteRow(row: any) {

    this.deleteEvent.emit(row);
    
    const index = this.data.indexOf(row);
    if (index > -1) {
      this.data.splice(index, 1);
      this.paginateData();
    }
  
  }

  edit(row: any) {
    this.editEvent.emit(row);
  }
  
  toggleRowExpansion(row: any) {
    console.log(row);
    row.isExpanded = !row.isExpanded;
  }
  
  applyColumnVisibility() {
    this.paginateData();
  }

  applyChanges() {
    // Aplicar los cambios desde columnSettings a columns
    this.columns.forEach((col, index) => {
      col.show = this.columnSettings[index].show;
    });

  }

  // Función para seleccionar o deseleccionar todas las filas
  selectAll(event: any) {
    const checked = event.target.checked;
    this.paginatedData.forEach(row => row.selected = checked);
    this.selectedRows();
  }

  // Actualizar las filas seleccionadas
  selectedRows() {
    const selectedRows = this.paginatedData.filter(row => row.selected);
    return selectedRows;
  }

}
