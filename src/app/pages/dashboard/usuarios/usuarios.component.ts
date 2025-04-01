import { Component, inject, OnInit } from '@angular/core';
import { ModalComponent } from '../../../components/modal/modal.component';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Usuario } from '../../../interfaces/types';
import { RouterLink } from '@angular/router';
import { LoaderComponent } from '../../../components/loader/loader.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuarios',
  imports: [ModalComponent, FormsModule, RouterLink, LoaderComponent],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css',
})
export class UsuariosComponent implements OnInit {
  modalusuarios: boolean = false;
  isLoader: boolean = false;
  authservice = inject(AuthService);
  usuario: Usuario | null = null;
  newUsusario: Usuario = {
    name: '',
    email: '',
    password: '',
    rolId: 0,
  };
  ListaUsuarios: Usuario[] = [];
  Toast = Swal.mixin({
    toast: true,
    position: 'bottom-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });
  ngOnInit(): void {
    this.authservice.usuario$.subscribe((res) => {
      this.usuario = res;
    });
    this.cargarUsuarios();
  }
  cargarUsuarios(){
    this.authservice.listar().subscribe({
      next: (res) => {
        this.ListaUsuarios = res;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
  tooglemodalusuarios() {
    this.modalusuarios = !this.modalusuarios;
  }
  crear() {
    if (this.usuario?.rol?.name === 'admin') {
      this.isLoader = true;
      this.authservice.crear(this.newUsusario).subscribe({
        next: (res) => {
          console.log(res);
          this.isLoader = false;
          this.modalusuarios = false;
          this.cargarUsuarios();
          this.newUsusario = {
            name: '',
            email: '',
            password: '',
            rolId: 0,
          };
          this.Toast.fire({
            icon: 'success',
            title: 'Se creao el usuario correctamente correctamente',
          });
        },
        error: (error) => {
          console.log(error);
          this.isLoader = false;
          this.modalusuarios = false;
          this.newUsusario = {
            name: '',
            email: '',
            password: '',
            rolId: 0,
          };
          this.Toast.fire({
            icon: 'error',
            title: 'Se creao el usuario correctamente correctamente',
          });
        },
      });
    }
  }
}
