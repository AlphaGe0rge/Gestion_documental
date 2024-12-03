import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl = 'http://localhost:8081/api/users';

  constructor(private http: HttpClient) { }

  getAllUsers(where: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/get`, {where});
  }

  // getCaseById(id: number): Observable<any> {
  //   return this.http.get(`${this.baseUrl}/${id}`);
  // }

  createUser(data: any): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }

}
