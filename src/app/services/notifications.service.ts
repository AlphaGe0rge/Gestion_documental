import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  constructor(private toastr: ToastrService) { }

  success(message: string, title: string = 'Éxito') {
    this.toastr.success(message, title);
  }

  // Notificación de error
  error(message: string, title: string = 'Error') {
    this.toastr.error(message, title);
  }

  // Notificación de advertencia
  warning(message: string, title: string = 'Advertencia') {
    this.toastr.warning(message, title);
  }

  // Notificación informativa
  info(message: string, title: string = 'Información') {
    this.toastr.info(message, title);
  }
}
