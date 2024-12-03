import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CasesComponent } from './cases/cases.component';
import { DocumentsComponent } from './documents/documents.component';
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { AuthGuard } from './guards/auth.guard';
import { UsersComponent } from './users/users.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, 
    canActivate: [AuthGuard],
    children: [
      { path: 'cases', component: CasesComponent },
      { path: 'documents', component: DocumentsComponent },
      { path: 'user-settings', component: UserSettingsComponent },
      { path: 'users', component: UsersComponent },

    ] 
  },
  { path: '**', redirectTo: '' } // Redirige a login si no coincide ninguna ruta
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
