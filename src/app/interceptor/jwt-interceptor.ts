import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Obtén el token del AuthService
    const token = this.authService.getToken();

    if (token) {
      request = request.clone({
        setHeaders: {
          AuthorizationTokenx: token
        }
      });
    }

    return next.handle(request);
  }
}
