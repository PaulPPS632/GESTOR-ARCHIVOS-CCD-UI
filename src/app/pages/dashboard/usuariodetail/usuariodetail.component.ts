import { Component, inject, Input, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Folder, Usuario } from '../../../interfaces/types';
import { FoldersService } from '../../../services/folders.service';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { ModalComponent } from "../../../components/modal/modal.component";

@Component({
  selector: 'app-usuariodetail',
  imports: [FormsModule, RouterLink, ModalComponent],
  templateUrl: './usuariodetail.component.html',
  styleUrl: './usuariodetail.component.css'
})
export class UsuariodetailComponent implements OnInit {
  @Input('id') id: number = 0;
  authService = inject(AuthService);
  foldersService = inject(FoldersService);
  router = inject(Router);
  folders: Folder[] = []; 
  usuario: Usuario = {
    name: '',
    email: '',
    password: '',
    rolId: 0
  };
  isModalEditAccess: boolean = false;
  idSharedSelected: number = 0;
  accessType: string = 'lector';
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
    this.authService.getUserById(this.id).subscribe({
      next: (res) =>{
        this.usuario = res;
      },
      error: (error) =>{
        console.log(error);
      }
    });
    this.loadsharedfolders();
  }
  loadsharedfolders(){
    this.foldersService.getFoldersSharedbyId(this.id).subscribe({
      next: (res) =>{
        this.folders = res.folders;
      },
      error: (error) =>{
        console.log(error);
      }
    });
  }
  navigateFolder(folder: Folder): void {
    // Generar el nuevo path. Si el currentPath es 'root' o vacío, se usa directamente el folder.name;
    // de lo contrario, se concatena al path actual.
    this.router.navigate(['/Dashboard/Home', folder.path]);
  }
  EliminarShared(id: number | undefined){
    if(!id) return;
    Swal.fire({
      title: '¿Estas seguro?',
      text: 'No podras revertir esto',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.foldersService.deleteshared(id).subscribe({
          next: (res) =>{
            this.Toast.fire({
              icon: 'success',
              title: 'Se eliminaron correctamente',
            });
            this.loadsharedfolders();
          },
          error: (err)=>{
            Swal.fire({
              icon: 'error',
              title:'Error al editar sheets',
              text: err.message,
              timer: 1000
            })
          }
        })
      } 
      });
  }
  toggleModalEditAccess(id: number | undefined, accesscurrent: string | undefined){
    if(!id || !accesscurrent) return;
    this.idSharedSelected = id;
    this.accessType = accesscurrent;
    this.isModalEditAccess = !this.isModalEditAccess;
  }
  editaraccessModal(){
    
    this.foldersService.editsharedaccess(this.idSharedSelected, this.accessType).subscribe({
      next: (res) =>{
        this.isModalEditAccess = false;
        this.Toast.fire({
          icon: 'success',
          title: 'Se editaron los accesos correctamente',
        });
        this.loadsharedfolders();
      },
      error: (err)=>{
        this.isModalEditAccess = false;
        Swal.fire({
          icon: 'error',
          title:'Error al editar accesos',
          text: err.message,
          timer: 1000
        })
      }
    })
  }
}
