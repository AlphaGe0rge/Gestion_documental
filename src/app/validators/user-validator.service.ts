import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidator, ValidationErrors } from '@angular/forms';
import { delay, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserValidatorService implements AsyncValidator {

  constructor(private http: HttpClient) { }

  validate(control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {

      const userName = control.value

      return this.http.post(`http://localhost:8081/api/validations/checkUserName`, {userName})
             .pipe(
              delay(1000),
              map(resp => {
                return (resp) ? {userExists: true} : null
              })
            );
  }


}
