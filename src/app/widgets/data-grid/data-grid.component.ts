import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-data-grid',
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.css']
})
export class DataGridComponent implements OnInit {
  @ViewChild('columnManagerModal') columnManagerModal!: ModalComponent;

  @Input() columns: { name: string; field: string; editable: boolean; width: string; show: boolean; type: string }[] = [];
  @Input() data: any[] = [];
  @Input() childColumns: { name: string; field: string; editable: boolean; show: boolean, width: string; type: string }[] = [];
  @Input() editable: boolean = false;
  @Input() showSelector: boolean = false;
  @Input() showTree: boolean = false;
  @Input() calculatedPromedio: boolean = false;
  @Input() showDelete: boolean = false;
  @Input() showChildDelete: boolean = false;
  @Input() selectMulti: boolean = true; // Por defecto, selección de una sola fila


  @Input() showEdit: boolean = false;

  @Input() showColumnManager: boolean = true;
  @Input() showExcel: boolean = true;

  @Output() loadChildData: EventEmitter<any> = new EventEmitter<any>();
  @Output() deleteEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() editEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() selectRowEvent: EventEmitter<any> = new EventEmitter<any>();

  pageSize: number = 5;
  currentPage: number = 1;
  paginatedData: any[] = [];

  columnSettings: { name: string; field: string; editable: boolean; show: boolean }[] = [];

  checked: boolean = false;

  ngOnInit(): void {
    this.columnSettings = JSON.parse(JSON.stringify(this.columns));
    this.paginateData();
  }

  paginateData(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedData = this.data.slice(start, end);
  }

  setPage(page: number): void {
    this.currentPage = page;
    this.paginateData();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateData();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages.length) {
      this.currentPage++;
      this.paginateData();
    }
  }

  get totalPages(): number[] {
    return Array(Math.ceil(this.data.length / this.pageSize)).fill(0).map((x, i) => i + 1);
  }

  addRow(): void {
    const newRow: any = {};
    this.columns.forEach(col => newRow[col.field] = '');
    this.data.push(newRow);
    this.paginateData();
  }

  deleteRow(row: any): void {
    this.deleteEvent.emit(row);
  }

  edit(row: any): void {
    this.editEvent.emit(row);
  }

  rowSelected(row: any): void {

    const selected = row.selected;

    if (!this.selectMulti) {
      // Desmarca todas las filas excepto la seleccionada
      this.paginatedData.forEach(r => r.selected = false);
      row.selected = selected;
      this.selectRowEvent.emit(row);
    }
    else {
      row.selected = false;
      this.selectRowEvent.emit(row);
    }

  }
  
  toggleRowExpansion(row: any): void {
    row.isExpanded = !row.isExpanded;

    if (row.isExpanded && !row.childData) {
      row.isLoading = true;
      this.loadChildData.emit(row);
    }
  }

  setChildData(parentRow: any, childData: any[]): void {
    parentRow.childData = childData;
    parentRow.isLoading = false;
  }

  openColumnModal(): void {
    this.columnManagerModal.openModal();
  }

  applyColumnVisibility(): void {
    this.paginateData();
  }

  applyChanges(): void {
    this.columns.forEach((col, index) => {
      col.show = this.columnSettings[index].show;
    });
    this.columnManagerModal.closeModal();
  }

  closeModal(): void {
    this.columnSettings = JSON.parse(JSON.stringify(this.columns));
    this.columnManagerModal.closeModal();
  }


  selectAll(event: any): void {
    if (this.selectMulti) {
      this.checked = event.target.checked;
      this.paginatedData.forEach(row => row.selected = this.checked);
  
      this.selectedRows();
    }
  }

  selectedRows(): any[] {
    return this.paginatedData.filter(row => row.selected);
  }

  getRows(): any[] {
    return this.paginatedData;
  }

  calculateAverage(): number {
    let totalWeightedScores = 0;
    let totalPercentage = 0;

    this.data.forEach(row => {
      const percentage = parseFloat(row.percentage);
      const score = parseFloat(row.score);
      if (!isNaN(percentage) && !isNaN(score)) {
        totalWeightedScores += (percentage * score) / 100;
        totalPercentage += percentage;
      }
    });

    return totalPercentage > 0 ? totalWeightedScores : 0;
  }

  makeEditable(row: any, column: any): void {
    row.isEditing = true;
  }
  
  finishEditing(row: any, column: any): void {
    row.isEditing = false;
    this.editEvent.emit({ row, column });
  }

  formatCellValue(value: any, type?: string): string {
    if (type === 'percentage' && value) {
      return `${value}%`; // Agregar símbolo de porcentaje
    }
    else if (type === 'date' && value) {

      const date = new Date(value);
      const fecha = date.toISOString().split('T')[0];

      return fecha;
    }
    return this.capitalize(value) || "";
  }

  capitalize(value: any, locale = 'en-US') {
    if (!value) return '';
    if (typeof value !== 'string') return value;
    return value[0].toLocaleUpperCase(locale) + value.slice(1);
  }

}
