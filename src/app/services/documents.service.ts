import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface Folder {
  id: number;
  name: string;
  parentFolderId: number | null;
}

interface Document {
  id: number;
  name: string;
  folderId: number;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentsService {

  private apiUrl = 'http://localhost:8081/api/documents';

  constructor(private http: HttpClient) {}

  getRootContents(caseId: any): Observable<{ folders: Folder[]; files: Document[] }> {
    return this.http.get<{ folders: Folder[]; files: Document[] }>(
      `${this.apiUrl}/root/${caseId}`
    );
  }

  getFolderContents(folderId: number): Observable<{ folders: Folder[]; files: Document[] }> {
    return this.http.get<{ folders: Folder[]; files: Document[] }>(
      `${this.apiUrl}/folder/${folderId}`
    );
  }

  // Crear una nueva carpeta
  createFolder(data: { name: string; caseId: string; parentFolderId: number | null }): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-folder`, data);
  }

  // Subir un archivo
  uploadDocument(formData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload`, formData );
  }

  // Descargar un archivo
  downloadDocument(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${id}`, { responseType: 'blob' });
  }

  // Eliminar un archivo o carpeta
  deleteDocument(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }

}
