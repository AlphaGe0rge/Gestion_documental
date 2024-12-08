import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PasswordValidatorService } from '../validators/password-validator.service';
import { NotificationsService } from '../services/notifications.service';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.css']
})
export class UserSettingsComponent implements OnInit {

  passwordForm: FormGroup;

  constructor(private authService:AuthService,
              private fb: FormBuilder,
              private notificationsService: NotificationsService,
              private passwordValidator: PasswordValidatorService,

  ) {

    this.passwordForm = this.fb.group({
      actuallyPassword: ['', Validators.required, [this.passwordValidator]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]]
    });

   }

  ngOnInit(): void {
    console.log(this.authService.usuario);
  }

  formInvalid(form: string) {
    return this.passwordForm.get(form)?.invalid && this.passwordForm.get(form)?.touched 
  }

  getErrorMessage(controlName: string) {

    const errors: any = this.passwordForm.get(controlName)?.errors;

    if (errors?.required) return 'Campo Requerido';
    if (errors?.minLength) return 'Debe tener al menos 8 caracteres'
    if (errors?.passwordNoExist) {
      return 'Contraseña Incorrecta'
    }
    else{
      return ''
    }

  }

  saveNewPassword() {

    if (this.passwordForm.invalid) {
      this.notificationsService.warning('Formulario invalido');
      return;
    }

    console.log(this.passwordForm.value);
  }


}
