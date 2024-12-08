import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataGridComponent } from 'src/app/widgets/data-grid/data-grid.component';
import { UserService } from '../services/user.service';
import { ModalComponent } from '../widgets/modal/modal.component';
import { UserValidatorService } from '../validators/user-validator.service';
import { NotificationsService } from '../services/notifications.service';
@Component({
  selector: 'app-add-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  
 @ViewChild('dataGrid', { static: false }) dataGrid: DataGridComponent;
 @ViewChild('userModal', { static: false }) userModal!: ModalComponent;

  filters = {
    roleId: 'student',
    nombre: '',
    usuario: '',
    correo: '',
    phoneNumber: '',
    gradeId: '',
    status: null
  };

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

  userId = "";

  filteredData: any[] = [];

  periods: any[] = [];
  grades: any[] = []

  gridColumns: any[] = [];

  userForm!: FormGroup;
  
  roles: any[] = [
    {
      id: 'admin',
      name: 'Admin'
    },
    {
      id: 'lawyer',
      name: 'Abogado'
    }
  ]

  constructor(private changeDetectorRef:ChangeDetectorRef,
              private fb: FormBuilder,
              private userService: UserService,
              private userValidator: UserValidatorService,
              private notificationService: NotificationsService
  ) { 
    this.dataGrid = new DataGridComponent();
  }

  ngOnInit(): void {

    this.userForm = this.fb.group({
      fullName: ['', Validators.required],
      userName: ['', Validators.required, [this.userValidator]],
      password: ['', Validators.required],
      roleId: ['', Validators.required]
    });

    this.setupGridColumns();
 
  }

  setupGridColumns() {

    this.gridColumns = [
      { name: 'Nombre', field: 'fullName', editable: false, show: true },
      { name: 'Usuario', field: 'userName', editable: false, show: true},
      { name: 'Rol', field: 'role', editable: false, show: true },
    ]

  }

  getDataGrid() {

    let where: any = {};

    if (this.filters.nombre) where.fullName = this.filters.nombre;
    if (this.filters.usuario) where.userName = this.filters.usuario;
    if (this.filters.roleId) where.role = this.filters.roleId;
    if (this.filters.status) where.status = this.filters.status;

    this.userService.getAllUsers(where).subscribe({
      next: (data) => {
          this.filteredData = data;
          this.changeDetectorRef.detectChanges();
          this.dataGrid.paginateData();
      },
    });
    
  }

  changeRol() {
    this.setupGridColumns();
    this.getDataGrid();
  }

  openUserModal(): void {
    this.userModal.openModal();
  }

  closeModal() {
    this.userForm.reset();
  }

  saveUser() {

    const data = this.userForm.value;

    if (this.userForm.invalid) {
      this.notificationService.success('Formulario invalido');
      this.userForm.markAllAsTouched();
      return;
    }

    const body = {
      fullName: this.userForm.get('fullName')?.value,
      userName: this.userForm.get('userName')?.value,
      password: this.userForm.get('password')?.value,
      role: this.userForm.get('roleId')?.value
    }

    this.userService.createUser(body).subscribe({
      next: (value) => {
          this.notificationService.success('Usuario creado');
          this.userModal.closeModal();
          this.getDataGrid();
      },
    });

  }

  formInvalid(form: string) {
    return this.userForm.get(form)?.invalid && this.userForm.get(form)?.touched 
  }

  getErrorMessage(controlName: string) {

    const errors: any = this.userForm.get(controlName)?.errors;

    if (errors?.required) return 'Campo Requerido';
    if (errors?.userExists) {
      return 'Este usuario ya existe'
    }
    else{
      return ''
    }

  }

}
