import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  usuario: any;

  constructor(private router: Router,
              private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.usuario = this.authService.usuario
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}
