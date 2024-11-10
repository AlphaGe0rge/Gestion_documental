import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DocumentsService } from '../services/documents.service';
import { CasesService } from '../services/cases.service';

import { saveAs } from 'file-saver'; // Importar correctamente la librería

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
    this.loadCases();
  }

  loadCases(): void {
    // this.casesService.getAllCases().subscribe(
    //   (data) => this.cases = data,
    //   (error) => console.error('Error al cargar los casos', error)
    // );

    this.cases = [
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
      },
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
      }
  ]

  }

  loadRootFolder(caseId: any) {

    return new Promise((resolve, reject) => {

      this.documentService.getRootContents(caseId).subscribe(

        (data) => {
          this.currentFolders = data.folders;
          this.currentFiles = data.files;
          resolve('ok');
        },

        (error) => {
          console.error('Error al cargar la carpeta raíz', error);
          reject()
        }
  
      );

    }) 

  }

  async handleCollapseClick(item: any, event:any){

    this.currentFolders = [];

    const target = event.target as HTMLElement;
    const isExpanding = target.getAttribute('aria-expanded') === 'true'; // Chequea si está expandido o no
  
    // Aquí estamos revisando si el acordeón se expande o colapsa
    if (isExpanding) {
      await this.loadRootFolder(item.caseId);
    } else {
      this.currentFolders = [];
    }

    item.isOpen = !item.isOpen;

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
    } 
    else {
      this.cases.map(o => o.isOpen = false);
      this.currentFiles = [];
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
    saveAs(response, file.name);
  }, error => {
    console.log(error)
  });

}
}
