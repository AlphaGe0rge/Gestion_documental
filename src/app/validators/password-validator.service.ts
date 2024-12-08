import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidator, ValidationErrors } from '@angular/forms';
import { delay, map, Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PasswordValidatorService implements AsyncValidator {

  constructor(private http: HttpClient,
              private authService: AuthService 
  ) { }

  validate(control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {

      const password = control.value

      return this.http.post(`http://localhost:8081/api/validations/checkPassword`, {password, userId: this.authService.usuario.userId})
             .pipe(
              delay(1000),
              map(resp => {
                return (resp) ? {passwordNoExist: true} : null
              })
            );
  }


}
