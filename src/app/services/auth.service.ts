import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Usuario } from '../interfaces/types';
import { BehaviorSubject, map, Observable, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  http = inject(HttpClient);
  apiUrl: string = environment.API_URL + `/api/auth`;

  public usuarioSubject = new BehaviorSubject<any | null>(null);
  public usuario$ = this.usuarioSubject.asObservable();

  constructor() { 
    this.cargarUsuario();
  }
  cargarUsuario(){
    const token = this.getToken();
    if(token){
      this.isLoggedIn().subscribe((res) =>{
        if(res.estado){
          console.log(res.usuario);
          this.usuarioSubject.next(res.usuario);
        }else{
          this.logout();
        }
      })
    }
  }

  login(usuario: Usuario): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, {
      username: usuario.username,
      password: usuario.password
    }).pipe(tap((response) => {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('rol', response.rol);
      localStorage.setItem('usuario', response.usuario);
      this.usuarioSubject.next(response.usuario);
    }));
  }
  isLoggedIn(): Observable<any> {
    const token = this.getToken();
    if(!token){
      return of({estado: false, rol: '', user: null})
    }
    const request = { token };
    return this.http.post<any>(`${this.apiUrl}/validate`, request).pipe(
      map((res) => ({
        estado: res.estado,
        rol: res.rol,
        usuario: res.usuario
      }))
    );
  }
  getToken():string | null{
    return localStorage.getItem('authToken');
  }
  logout(){
    localStorage.removeItem('authToken');
    localStorage.removeItem('rol');
    localStorage.removeItem('usuario');
    this.usuarioSubject.next(null);
  }
  getUsuario(): any | null{
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  } 

  listar(): Observable<any>{
    return this.http.get<any>(this.apiUrl);
  }
  crear(usuario: Usuario):Observable<any>{
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    })
    return this.http.post<any>(this.apiUrl,{usuario},{headers});
  }
}
