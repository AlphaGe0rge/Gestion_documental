import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DocumentsService } from '../services/documents.service';
import { CasesService } from '../services/cases.service';

import { saveAs } from 'file-saver'; // Importar correctamente la librería
import { NotificationsService } from '../services/notifications.service';
import { ModalComponent } from '../widgets/modal/modal.component';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';

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

  @ViewChild('confirmModal', {static: false}) confirmModal!: ModalComponent; 
  @ViewChild('fileUploadModal', {static: false}) fileUploadModal!: ModalComponent; 

  usuario: any;

  constructor(
    private documentService: DocumentsService,
    private casesService: CasesService,
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationsService,
    private userService: UserService
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

    this.usuario = this.authService.usuario
    
    const today = new Date();
    const todayFormatted = today.toISOString().split('T')[0];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7); // Restar 7 días
    const sevenDaysAgoFormatted = sevenDaysAgo.toISOString().split('T')[0];

    this.filters.dateFrom = sevenDaysAgoFormatted;
    this.filters.dateTo = todayFormatted;

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

    if (this.selectedLawyerId) {
      where.userId = this.selectedLawyerId;
    }
    else {
      where.userId = this.authService.usuario.userId
    }

    
    this.casesService.getAllCases(where).subscribe(
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

        this.notificationService.success('Carpeta Creada');

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

        this.notificationService.success('Carpeta Eliminada');

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

        this.notificationService.success('Archivo Eliminado');

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

    if (this.uploadForm.invalid) {
      this.notificationService.warning('Formulario invalido');
      return;
    }

    if (!this.selectedFile) {
      this.notificationService.warning('Archivo no seleccionado');
      return;
    }

    const title = this.uploadForm.get('title')?.value;
    const formData = new FormData();

    const parentFolder = this.folderPath.length ? this.folderPath[this.folderPath.length - 1] : {};

    formData.append('file', this.selectedFile);
    formData.append('title', title);
    formData.append('caseId', parentFolder.caseId);
    formData.append('folderId', parentFolder.folderId);

    this.documentService.uploadDocument(formData).subscribe({
      
      next: () => {
        this.notificationService.success('Archivo Subido');
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

  // Método para descargar un archivo
  downloadFile(file: any) {
  
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

}
