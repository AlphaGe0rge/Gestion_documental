import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  
  authForm: FormGroup;

  formInvalid: boolean = false;

  constructor(private authService: AuthService,
              private fb: FormBuilder,
              private router: Router
  ) { 

    this.authForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', [Validators.required]], 
   });

  }


  ngOnInit(): void {

  }

  login(){

    this.authForm.markAllAsTouched();

    if (this.authForm.valid) {

      this.authService.login(this.authForm.value).subscribe(data=>{
         this.router.navigate(['/dashboard/cases']);
      },
      error => {
        console.log(error)
        this.formInvalid = true; 
      });

    }
    else {
      this.formInvalid = true
    }

  }


}
