// cases.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CasesService } from '../services/cases.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-cases',
  templateUrl: './cases.component.html',
  styleUrls: ['./cases.component.css']
})
export class CasesComponent implements OnInit {

  cases: any[] = [];
  caseForm: FormGroup;
  isModalOpen: boolean = false;
  isEditing: boolean = false;
  currentCaseId: number | null = null;

  constructor(private caseService: CasesService, 
              private fb: FormBuilder,
              private authService: AuthService) {

    this.caseForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required]
    });

  }

  ngOnInit(): void {
    this.loadCases();
  }

  loadCases(): void {
    // this.caseService.getAllCases().subscribe(
    //   (data) => this.cases = data,
    //   (error) => console.error('Error al cargar los casos', error)
    // );
    this.cases = [
      {
          caseId: "70fea6bd-f2c6-4fee-a030-883d5b7c147c",
          title: "caso 2",
          description: "prueba caso 2",
          userId: "54992aea-ed7c-4c3c-9e19-88ac61e16aef",
          status: true,
          createdAt: "2024-11-10T13:45:02.000Z",
          updatedAt: "2024-11-10T13:45:02.000Z",
          Documents: []
      },
      {
          caseId: "dc1ff08f-e4a2-4efd-9453-8de1c45e8077",
          title: "caso 3",
          description: "prueba caso 3",
          userId: "54992aea-ed7c-4c3c-9e19-88ac61e16aef",
          status: true,
          createdAt: "2024-11-10T13:45:24.000Z",
          updatedAt: "2024-11-10T13:45:24.000Z",
          Documents: []
      },
      {          
          caseId: "e27b1e5f-a785-4cd3-9256-08e318d76804",
          title: "caso 1",
          description: "pruebas caso 1",
          userId: "54992aea-ed7c-4c3c-9e19-88ac61e16aef",
          status: true,
          createdAt: "2024-11-10T13:43:53.000Z",
          updatedAt: "2024-11-10T13:43:53.000Z",
          Documents: [
              {
                  documentId: "9326c9a2-43f9-4ac2-8e4e-d04b23e01289",
                  name: "foto perfil",
                  filePath: "perfil-1731247418114.avif",
                  fileType: "avif",
                  uploadedAt: "2024-11-10T14:03:38.000Z",
                  folderId: "a905fa8c-e411-4e8f-91a1-b458e8da3cdb",
                  caseId: "e27b1e5f-a785-4cd3-9256-08e318d76804",
                  createdAt: "2024-11-10T14:03:38.000Z",
                  updatedAt: "2024-11-10T14:03:38.000Z"
              }
          ]
      }
  ]
  }

  openAddCaseModal(): void {
    this.isEditing = false;
    this.caseForm.reset();
    this.isModalOpen = true;
  }

  openEditCaseModal(caseItem: any): void {
    this.isEditing = true;
    this.currentCaseId = caseItem.id;
    this.caseForm.patchValue(caseItem);
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.currentCaseId = null;
  }


  saveCase(): void {
    
    if (this.caseForm.invalid) return;

    debugger;

    const caseData = this.caseForm.value;

    caseData.userId = this.authService.usuario.userId;

    if (this.isEditing && this.currentCaseId) {
      this.caseService.updateCase(this.currentCaseId, caseData).subscribe(() => {
        this.loadCases();
        this.closeModal();
      });
    } else {
      this.caseService.createCase(caseData).subscribe(() => {
        this.loadCases();
        this.closeModal();
      });
    }
  }

  deleteCase(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este caso?')) {
      this.caseService.deleteCase(id).subscribe(() => {
        this.loadCases();
      });
    }
  }
}
