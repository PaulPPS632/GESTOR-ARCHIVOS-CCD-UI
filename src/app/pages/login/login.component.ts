import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Usuario } from '../../interfaces/types';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  authService = inject(AuthService);
  router = inject(Router);

  usuario: Usuario ={
    email: '',
    password:''
  }

  login(){
    
    
    this.authService.login(this.usuario).subscribe({
      next: (res) =>{
        if(res.rol == "admin"){
          this.router.navigate(['/Dashboard/Home'])
        }else{
          this.router.navigate(['/Dashboard/Shared'])
        }
      },
      error: (error) =>{
        Swal.fire({
          title:'NO EXISTE',
          icon:'error',
          text:'el usuario no existe',
          timer: 1000
        })
      }
    });
    
  }
}
