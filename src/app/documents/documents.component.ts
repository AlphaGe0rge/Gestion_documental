import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DocumentsService } from '../services/documents.service';
import { CasesService } from '../services/cases.service';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {
  folderPath: any[] = [];
  currentFolders: any[] = [];
  currentFiles: any[] = [];
  uploadForm: FormGroup;
  folderForm: FormGroup;
  cases: any[] = [];
  isFolderModalOpen: boolean = false;
  isFileUploadOpen: boolean = false;
  selectedFile: File | null = null;
  currentFileUrl: string | null = null;

  constructor(
    private documentService: DocumentsService,
    private casesService: CasesService,
    private fb: FormBuilder
  ) {
    this.uploadForm = this.fb.group({
      title: ['', Validators.required]
    });
    this.folderForm = this.fb.group({
      folderName: ['', Validators.required],
      caseId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadRootFolder();
    this.loadCases();
  }

  loadCases(): void {
    this.casesService.getAllCases().subscribe(
      (data) => this.cases = data,
      (error) => console.error('Error al cargar los casos', error)
    );
  }

  loadRootFolder(): void {
    this.documentService.getRootContents().subscribe(
      (data) => {
        this.currentFolders = data.folders;
        this.currentFiles = data.files;
      },
      (error) => console.error('Error al cargar la carpeta raíz', error)
    );
  }

  createFolder(): void {
    if (this.folderForm.invalid) return;

    const folderName = this.folderForm.get('folderName')?.value;
    const caseId = this.folderForm.get('caseId')?.value;
    const parentFolderId = this.folderPath.length ? this.folderPath[this.folderPath.length - 1].folderId : null;

    this.documentService.createFolder({ name: folderName, caseId, parentFolderId }).subscribe({
      next: () => {
        this.navigateToFolder(this.folderPath[this.folderPath.length - 1]);
        this.closeFolderModal();
      },
      error: (error) => console.error('Error al crear la carpeta', error)
    });
  }

  navigateToFolder(folder: any): void {
    if (!this.folderPath.find(o => o.folderId === folder.folderId)) {
      this.folderPath.push(folder);
    }

    this.documentService.getFolderContents(folder.folderId).subscribe({
      next: (data) => {
        this.currentFolders = data.folders;
        this.currentFiles = data.files;
      },
      error: (error) => console.error('Error al cargar la carpeta', error)
    });
  }

  goBack(): void {
    this.folderPath.pop();

    const parentFolder = this.folderPath.length > 0 ? this.folderPath[this.folderPath.length - 1] : null;

    if (parentFolder) {
      this.navigateToFolder(parentFolder);
    } else {
      this.loadRootFolder();
    }
  }

  openFileUpload(): void {
    this.isFileUploadOpen = true;
  }

  closeFileUpload(): void {
    this.isFileUploadOpen = false;
    this.uploadForm.reset();
    this.selectedFile = null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files ? input.files[0] : null;
  }

  uploadFile(): void {
    if (!this.selectedFile) return;

    const title = this.uploadForm.get('title')?.value;
    const formData = new FormData();

    const parentFolder = this.folderPath.length ? this.folderPath[this.folderPath.length - 1] : {};

    formData.append('file', this.selectedFile);
    formData.append('title', title);
    formData.append('caseId', parentFolder.caseId);
    formData.append('folderId', parentFolder.folderId);

    this.documentService.uploadDocument(formData).subscribe({
      next: () => {
        this.navigateToFolder(this.folderPath[this.folderPath.length - 1]);
        this.closeFileUpload();
      },
      error: (error) => console.error('Error al subir el archivo', error)
    });
  }

  openFolderModal(): void {
    this.isFolderModalOpen = true;
  }

  closeFolderModal(): void {
    this.isFolderModalOpen = false;
    this.folderForm.reset();
  }

  viewDocument(url: string): void {
    this.currentFileUrl = url;
  }

  // Método para eliminar una carpeta
deleteFolder(folder: any) {
  // Lógica para eliminar la carpeta
  console.log('Eliminar carpeta:', folder);
}

// Método para eliminar un archivo
deleteFile(file: any) {
  // Lógica para eliminar el archivo
  console.log('Eliminar archivo:', file);
}

// Método para descargar un archivo
downloadFile(file: any) {

  console.log(file); // Verificar que el archivo esté correctamente recibido
  this.documentService.downloadDocument(file.documentId).subscribe((response) => {
    // Aquí puedes manejar la respuesta, por ejemplo, si necesitas mostrar algo
  }, error => {
    console.error("Error al intentar descargar el archivo:", error);
  });

}
}
