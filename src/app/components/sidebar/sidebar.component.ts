import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../interfaces/types';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit{
  authservice = inject(AuthService);
  usuario: Usuario | null = null;
  ngOnInit(): void {
    this.authservice.usuario$.subscribe((res) => {
      this.usuario = res;
    });
  }
  logout(){
    this.authservice.logout();
  } 
}
