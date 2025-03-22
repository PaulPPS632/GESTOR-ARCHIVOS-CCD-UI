import { Component, inject, OnInit } from '@angular/core';
import { ModalComponent } from "../../../components/modal/modal.component";
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Usuario } from '../../../interfaces/types';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-usuarios',
  imports: [ModalComponent,FormsModule, RouterLink],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit{
  modalusuarios: boolean = false;
  authservice = inject(AuthService);
  usuario: Usuario | null = null;
  newUsusario: Usuario ={
    name: '',
    email: '',
    password: '',
    rolId: 0
  };
  ListaUsuarios: Usuario[] = [];
  ngOnInit(): void {
    this.authservice.usuario$.subscribe((res) => {
      this.usuario = res;
    });
    this.authservice.listar().subscribe({
      next: (res) =>{
        this.ListaUsuarios = res;
      },
      error: (error) =>{
        console.log(error);
      }
    });
  }
  tooglemodalusuarios(){
    this.modalusuarios = !this.modalusuarios;
  } 
  crear(){
    if( this.usuario?.rol?.name === 'admin' ){
      this.authservice.crear(this.newUsusario).subscribe({
        next: (res) =>{
          console.log(res);
        },
        error: (error) =>{
          console.log(error);
        }
      });
    }
  }
}
