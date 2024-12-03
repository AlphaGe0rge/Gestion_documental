// cases.component.ts

import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CasesService } from '../services/cases.service';
import { AuthService } from '../services/auth.service';
import { ModalComponent } from '../widgets/modal/modal.component';
import { NotificationsService } from '../services/notifications.service';
import { DataGridComponent } from '../widgets/data-grid/data-grid.component';

@Component({
  selector: 'app-cases',
  templateUrl: './cases.component.html',
  styleUrls: ['./cases.component.css']
})
export class CasesComponent implements OnInit {

  cases: any[] = [];
  caseForm: FormGroup;
  isEditing: boolean = false;
  currentCaseId: any = null;

  gridColumns: any = [];
  
  @ViewChild('confirmModal', {static: false}) confirmModal!: ModalComponent;
  @ViewChild('dataGrid', { static: false }) dataGrid!: DataGridComponent;
  @ViewChild('caseModal', { static: false }) caseModal!: ModalComponent;

  filters: any = {
    title: "",
    status: null,
    date: null
  }

  status = [
    {
      value: null,
      name: 'All'
    },
    {
      value: true,
      name: 'Active'
    },
    {
      value: false,
      name: 'Inactive'
    }
  ]

  constructor(private caseService: CasesService, 
              private fb: FormBuilder,
              private authService: AuthService,
              private notificationService: NotificationsService,
              private changeDetectorRef: ChangeDetectorRef
            ) {

    this.caseForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required]
    });

  }

  ngOnInit(): void {
    this.setupGridColumns();
  }

  setupGridColumns() {

    this.gridColumns = [
      { name: 'Titulo', field: 'title', editable: false, show: true },
      { name: 'Descripción', field: 'description', editable: false, show: true},
      { name: 'Fecha de creación', field: 'createdAt', editable: false, show: true, type: "date" },
    ]

    this.loadCases();

  }

  loadCases(): void {

    this.caseService.getAllCases().subscribe(
      (data) => {
        this.cases = data;
        this.changeDetectorRef.detectChanges();
        this.dataGrid.paginateData();
      },
      (error) => console.error('Error al cargar los casos', error)
    );

  }

  openAddCaseModal(): void {
    this.isEditing = false;
    this.caseForm.reset();
    this.caseModal.openModal();
  }

  openEditCaseModal(caseItem: any): void {
    this.caseForm.get('title')?.setValue(caseItem.title);
    this.caseForm.get('description')?.setValue(caseItem.description);
    this.isEditing = true;
    this.currentCaseId = caseItem.caseId;
    this.caseModal.openModal();

  }

  closeModal(): void {
    this.caseModal.closeModal();
    this.currentCaseId = null;
  }

  saveCase(): void {
    
    if (this.caseForm.invalid) return;
    
    const caseData = this.caseForm.value;

    caseData.userId = this.authService.usuario.userId;

    if (this.isEditing && this.currentCaseId) {
      this.caseService.updateCase(this.currentCaseId, caseData).subscribe(() => {
        this.currentCaseId = "";
        this.notificationService.success('Caso Editado Satisfatoriamente');
        this.loadCases();
        this.closeModal();
        this.caseForm.reset();
      });
    } else {
      this.caseService.createCase(caseData).subscribe(() => {
        this.notificationService.success('Caso Guardado Satisfatoriamente');
        this.loadCases();
        this.closeModal();
        this.caseForm.reset();
      });
    }
  }

  deleteCase(id: any): void {
    this.currentCaseId = id;
    this.confirmModal.openModal();
  }

  caseDelete() {
    this.caseService.deleteCase(this.currentCaseId).subscribe(() => {
      this.notificationService.success('Caso Eliminado Satisfatoriamente');
      this.loadCases();
    });
  }

  editRow(row: any) {
    this.openEditCaseModal(row);
  }

}
