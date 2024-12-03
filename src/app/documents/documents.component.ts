import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DocumentsService } from '../services/documents.service';
import { CasesService } from '../services/cases.service';

import { saveAs } from 'file-saver'; // Importar correctamente la librería
import { NotificationsService } from '../services/notifications.service';
import { ModalComponent } from '../widgets/modal/modal.component';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {

  folderPath: any[] = [];
  currentFolders: any[] = [];
  currentFolder: any = null;
  currentFiles: any[] = [];
  uploadForm: FormGroup;
  folderForm: FormGroup;
  cases: any[] = [];
  isFolderModalOpen: boolean = false;
  isFileUploadOpen: boolean = false;
  selectedFile: File | null = null;
  currentFileUrl: string | null = null;
  fileId: string = "";
  folderId: any = null;
  type: string  = "";

  @ViewChild('confirmModal', {static: false}) confirmModal!: ModalComponent; 
  @ViewChild('fileUploadModal', {static: false}) fileUploadModal!: ModalComponent; 

  constructor(
    private documentService: DocumentsService,
    private casesService: CasesService,
    private fb: FormBuilder,
    private notificationService: NotificationsService
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
    
    this.casesService.getAllCases().subscribe(
      (data) => this.cases = data,
      (error) => console.error('Error al cargar los casos', error)
    );

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

    if (this.folderForm.invalid) {
      this.notificationService.warning('Formulario Invalido');
      this.folderForm.markAllAsTouched();
      return;
    }

    const folderName = this.folderForm.get('folderName')?.value;
    const caseId = this.folderForm.get('caseId')?.value;
    const parentFolderId = this.folderPath.length ? this.folderPath[this.folderPath.length - 1].folderId : null;

    this.documentService.createFolder({ name: folderName, caseId, parentFolderId }).subscribe({
      next: (data) => {

        if (this.currentFolder) {

          this.documentService.getFolderContents(this.currentFolder.folderId).subscribe({
            next: (data) => {
              this.currentFolders = data.folders;
              this.currentFiles = data.files;
            },
            error: (error) => console.error('Error al cargar la carpeta', error)
          });
        }
        else {
          this.loadRootFolder(caseId);
        }

        this.closeFolderModal();
      },
      error: (error) => console.error('Error al crear la carpeta', error)
    });
  }

  navigateToFolder(folder: any, navigate: any = true): void {
    
    if (!this.folderPath.find(o => o.folderId === folder.folderId)) {
      this.folderPath.push(folder);
    }

    this.currentFolder = folder;

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
      this.currentFolder = null;
      this.cases.map(o => o.isOpen = false);
      this.currentFiles = [];
    }
  }

  openFileUpload(): void {
    this.isFileUploadOpen = true;
    this.fileUploadModal.openModal();
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

  openConfirmModal(id: any, type: string) {

    this.type = type;
    this.confirmModal.openModal();

    if (type === "folder") this.folderId = id;
    if (type === "file") this.fileId = id;

  }

  confirmDelete() {

    if (this.type === "folder") {

      this.documentService.deleteFolder(this.folderId.folderId).subscribe((o: any) => {

        if (this.currentFolder) {

          this.documentService.getFolderContents(this.currentFolder.folderId).subscribe({
            next: (data) => {
              this.currentFolders = data.folders;
              this.currentFiles = data.files;
              this.folderId = null;
            },
            error: (error) => console.error('Error al cargar la carpeta', error)
          });
        }
        else {
          this.loadRootFolder(this.folderId.caseId);
        }

      })
    }
    else {
      
      this.documentService.deleteDocument(this.fileId).subscribe((o) => {

        this.documentService.getFolderContents(this.currentFolder.folderId).subscribe({
          next: (data) => {
            this.currentFolders = data.folders;
            this.currentFiles = data.files;
            this.fileId = "";
          },
          error: (error) => console.error('Error al cargar la carpeta', error)
        });
    
      }, error => {
        console.log(error)
      });

    }

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
        this.fileUploadModal.closeModal();
      },
      error: (error) => console.error('Error al subir el archivo', error)
    });
  }

  openFolderModal(): void {
    
    if (this.currentFolder) {
      this.folderForm.get('caseId')?.setValue(this.currentFolder.caseId);
      this.folderForm.get('caseId')?.disable();
    }
    else {
      this.folderForm.get('caseId')?.enable();
      this.folderForm.get('caseId')?.setValue("");
    }

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

  // Método para descargar un archivo
  downloadFile(file: any) {
  
    console.log(file); // Verificar que el archivo esté correctamente recibido
    this.documentService.downloadDocument(file.documentId).subscribe((response) => {
      saveAs(response, file.name);
    }, error => {
      console.log(error)
    });
  
  }

  getFileIconClass(fileType: string): string {
  
    switch (fileType) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'bi bi-image-fill'; // Ícono para imágenes
      case 'pdf':
        return 'bi bi-file-pdf-fill'; // Ícono para PDF
      case 'doc':
      case 'docx':
        return 'bi bi-file-word-fill'; // Ícono para documentos Word
      case 'xls':
      case 'xlsx':
        return 'bi bi-file-spreadsheet-fill'; // Ícono para Excel
      case 'ppt':
      case 'pptx':
        return 'bi bi-file-ppt-fill'; // Ícono para PowerPoint
      case 'zip':
      case 'rar':
        return 'bi bi-file-zip-fill'; // Ícono para archivos comprimidos
      case 'txt':
        return 'bi bi-file-text-fill'; // Ícono para archivos de texto
      case 'mp4':
      case 'mkv':
      case 'avi':
        return 'bi bi-file-play-fill'; // Ícono para videos
      default:
        return 'bi bi-file-earmark-fill'; // Ícono por defecto
    }
  }

  formInvalid(form: string) {
    return this.folderForm.get(form)?.invalid && this.folderForm.get(form)?.touched 
  }

}
