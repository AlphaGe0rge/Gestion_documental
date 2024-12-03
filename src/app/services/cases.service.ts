import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CasesService {

  private baseUrl = 'http://localhost:8081/api/cases';

  constructor(private http: HttpClient) {}

  getAllCases(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  getCaseById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  createCase(data: any): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }

  updateCase(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  deleteCase(id: any): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
