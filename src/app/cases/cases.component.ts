// cases.component.ts

import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CasesService } from '../services/cases.service';
import { AuthService } from '../services/auth.service';
import { ModalComponent } from '../widgets/modal/modal.component';
import { NotificationsService } from '../services/notifications.service';
import { DataGridComponent } from '../widgets/data-grid/data-grid.component';
import { UserService } from '../services/user.service';

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

  filteredUsers: any [] = [];

  filters: any = {
    title: "",
    status: true,
    dateFrom: null,
    dateTo: null,
    lawyerName: null
  }

  selectedLawyerId =  null;

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
              private userService: UserService,
              private notificationService: NotificationsService,
              private changeDetectorRef: ChangeDetectorRef
            ) {

    this.caseForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required]
    });

  }

  ngOnInit(): void {
    
    const today = new Date();
    const todayFormatted = today.toISOString().split('T')[0];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7); // Restar 7 días
    const sevenDaysAgoFormatted = sevenDaysAgo.toISOString().split('T')[0];

    this.filters.dateFrom = sevenDaysAgoFormatted;
    this.filters.dateTo = todayFormatted;

    this.setupGridColumns();
  }

  setupGridColumns() {

    this.gridColumns = [
      { name: 'Titulo', field: 'title', editable: false, show: true },
      { name: 'Descripción', field: 'description', editable: false, show: true},
      { name: 'Fecha de creación', field: 'createdAt', editable: false, show: true, type: "date", width: '180px' },
      { name: 'Estado', field: 'status', editable: false, show: false, width: '140px' }
    ]

    this.loadCases();

  }

  loadCases(): void {

    let where: any = {};

    if (this.filters.title) where.title = this.filters.title;
    if (this.filters.dateFrom) where.dateFrom = this.filters.dateFrom;
    if (this.filters.dateTo) {

      let date = new Date(this.filters.dateTo);

      date.setDate(date.getDate() + 1);
      const today = date.toISOString().split('T')[0];

      where.dateTo = today;

    }

    if (typeof this.filters.status === "boolean") where.status = this.filters.status;
    if (this.selectedLawyerId) where.userId = this.selectedLawyerId;

    this.caseService.getAllCases(where).subscribe(
      (data) => {

        for (const o of data) {
          if (o.status) {
            o.status = 'activo'
          }
          else {
            o.status = 'inactivo'
          }
        }
        
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
    
    if (this.caseForm.invalid) {
      this.notificationService.warning('formulario invalido');
      return;    
    } 
    
    const caseData = this.caseForm.value;

    caseData.userId = this.authService.usuario.userId;

    if (this.isEditing && this.currentCaseId) {
      this.caseService.updateCase(this.currentCaseId, caseData).subscribe(() => {
        this.currentCaseId = "";
        this.notificationService.success('Caso Editado');
        this.loadCases();
        this.closeModal();
        this.caseForm.reset();
      });
    } else {
      this.caseService.createCase(caseData).subscribe(() => {
        this.notificationService.success('Caso Guardado');
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
      this.notificationService.success('Caso Eliminado');
      this.loadCases();
    });
  }

  editRow(row: any) {
    this.openEditCaseModal(row);
  }

  // Método para buscar usuarios por nombre
  searchUsers(name: string): void {

    if (!name) {
      this.filteredUsers = [];
      return;
    }

    const where = { 
      fullName: name
    }; // Condición de búsqueda
  
    this.userService.getAllUsers(where).subscribe({
      next: (data) => {
        this.filteredUsers = data;
      },
      error: (err) => {
        console.error('Error al buscar usuarios:', err);
        this.filteredUsers = [];
      },
    });
  }

  // Método para seleccionar un usuario del autocompletado
  selectUser(user: any): void {
    this.filters.lawyerName = user.fullName; // Mostrar el nombre seleccionado en el input
    this.selectedLawyerId = user.userId; // Almacenar el ID del abogado seleccionado
  }

  clearFilterIfInvalid(): void {

    setTimeout(() => {
      const matchedUser = this.filteredUsers.find(
        (user) =>
          user.fullName.toLowerCase() === this.filters.lawyerName.toLowerCase()
      );

      if (!matchedUser) {
        this.filters.lawyerName = ''; // Limpiar el campo
        this.selectedLawyerId = null; // Limpiar el ID
      }

      this.filteredUsers = []; // Limpiar sugerencias

    }, 200); // Retraso para permitir que el `click` se ejecute primero

  }

  changeStatus() {
    console.log(this.dataGrid.selectedRows());
  }

}
