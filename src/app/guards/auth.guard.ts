import { Injectable } from '@angular/core';
import { CanActivate, Router} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router,
              private authService:AuthService
  ) {}

  // Método para verificar si el usuario está autenticado
  canActivate(): boolean {

    const token = localStorage.getItem('token'); // Puedes cambiar a sessionStorage si prefieres
    const user: any = localStorage.getItem('user');

    if (token) {

      this.authService.usuario = JSON.parse(user);
      // Si hay un token, el usuario está autenticado
      return true;

    } else {
      // Si no hay token, redirigir al login
      this.router.navigate(['']);
      return false;
      
    }
  }
  
}
