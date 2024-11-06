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
    this.caseService.getAllCases().subscribe(
      (data) => this.cases = data,
      (error) => console.error('Error al cargar los casos', error)
    );
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
