import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataGridComponent } from 'src/app/widgets/data-grid/data-grid.component';
@Component({
  selector: 'app-add-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  
 @ViewChild('dataGrid', { static: false }) dataGrid: DataGridComponent;


  filters = {
    roleId: 'student',
    nombre: '',
    usuario: '',
    correo: '',
    phoneNumber: '',
    gradeId: '',
    status: null
  };

  isOpenModal = false;

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

  filteredData: any[] = [
    {fullName: "Jorge Amaya", userName: "jamaya", phone: "3125047189", rol: "Admin"},
    {fullName: "Jorge Ortega", userName: "jortega", phone: "3125047189", rol: "Abogado"},
    {fullName: "Fabian Fonnegra", userName: "fanegra", phone: "3125047189", rol: "Abogado"},
  ];

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
              private fb: FormBuilder
  ) { 
    this.dataGrid = new DataGridComponent();
  }

  ngOnInit(): void {

    this.userForm = this.fb.group({
      fullName: ['', Validators.required],
      userName: ['', Validators.required],
      password: ['', Validators.required],
      roleId: ['', Validators.required]
    });

    this.setupGridColumns();
 
  }

  setupGridColumns() {

    this.gridColumns = [
      { name: 'Nombre', field: 'fullName', editable: false, show: true },
      { name: 'Usuario', field: 'userName', editable: false, show: true},
      { name: 'Celular', field: 'phone', editable: false, show: true},
      { name: 'Rol', field: 'rol', editable: false, show: true },
    ]

  }

  getDataGrid(){
    this.filteredData = [
      {fullName: "Jorge Amaya", userName: "jamaya", rol: "Admin"},
      {fullName: "Jorge Ortega", userName: "jortega", rol: "Abogado"},
      {fullName: "Fabian Fonnegra", userName: "fanegra", rol: "Abogado"},
    ]

    this.changeDetectorRef.detectChanges();
  }

  changeRol() {

    this.setupGridColumns();
    this.getDataGrid();

  }

  openUserModal(): void {
    this.isOpenModal = true;
  }

  closeFileUpload(): void {
    this.isOpenModal = false;
    // this.uploadForm.reset();
  }

  saveUser() {

  }

  formInvalid(form: string) {
    return this.userForm.get(form)?.invalid && this.userForm.get(form)?.touched 
  }

  getErrorMessage(controlName: string) {

    const errors: any = this.userForm.get(controlName)?.errors;

    if (errors?.required) return 'Campo Requerido';
    if (errors?.userNameExists) {
      return 'Este usuario ya existe'
    }
    else{
      return ''
    }

  }

}
