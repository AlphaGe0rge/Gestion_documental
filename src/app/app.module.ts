import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CasesComponent } from './cases/cases.component';
import { DocumentsComponent } from './documents/documents.component';
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { SafeUrlPipe } from './pipes/safeUrl';
import { DataGridComponent } from './widgets/data-grid/data-grid.component';
import { UsersComponent } from './users/users.component';
import { ModalComponent } from './widgets/modal/modal.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    CasesComponent,
    DocumentsComponent,
    UserSettingsComponent,
    DataGridComponent,
    UsersComponent,
    ModalComponent,
    SafeUrlPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
