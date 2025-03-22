import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Usuario } from '../interfaces/types';
import { BehaviorSubject, map, Observable, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  http = inject(HttpClient);
  apiUrl: string = environment.API_URL + `/api/auth`;

  public usuarioSubject = new BehaviorSubject<Usuario | null>(null);
  public usuario$ = this.usuarioSubject.asObservable();

  constructor() {
    this.cargarUsuario();
  }
  cargarUsuario() {
    const token = this.getToken();
    ///console.log('Token encontrado:', token ? 'Sí' : 'No');

    if (token) {
      //console.log('Intentando validar token...');
      this.isLoggedIn().subscribe({
        next: (res) => {
          //console.log('Respuesta de validación:', res);
          if (res.estado) {
            //console.log('Usuario cargado completo:', res.usuario);
            this.usuarioSubject.next(res.usuario);
          } else {
            //console.log('Token inválido, haciendo logout');
            this.logout();
          }
        },
        error: (err) => {
          //console.error('Error validando token:', err);
          this.logout();
        },
      });
    } else {
      //console.log('No hay token, usuario null');
      this.usuarioSubject.next(null);
    }
  }

  login(usuario: Usuario): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/login`, {
        email: usuario.email,
        password: usuario.password,
      })
      .pipe(
        tap((response) => {
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('rol', response.rol);
          localStorage.setItem('usuario', JSON.stringify(response.usuario));
          console.log(response.usuario);
          this.usuarioSubject.next(response.usuario);
        })
      );
  }
  isLoggedIn(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return of({ estado: false, rol: '', user: null });
    }
    const request = { token };
    return this.http.post<any>(`${this.apiUrl}/validate`, request).pipe(
      tap((response) => {
        localStorage.setItem('usuario', JSON.stringify(response.usuario));
        this.usuarioSubject.next(response.usuario);
      }),
      map((res) => ({
        estado: res.estado,
        rol: res.rol,
        usuario: res.usuario,
      }))
    );
  }
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('rol');
    localStorage.removeItem('usuario');
    this.usuarioSubject.next(null);
  }
  getUsuario(): any | null {
    return this.usuarioSubject.getValue();
  }

  listar(): Observable<Usuario[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    });
    return this.http.get<Usuario[]>(this.apiUrl, { headers });
  }
  crear(usuario: Usuario): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    });
    return this.http.post<any>(`${this.apiUrl}/register`, { usuario }, { headers });
  }
  getUserById(id: number):Observable<Usuario>{
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    });
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`, { headers });
  }
  search(nombre: string): Observable<Usuario[]>{
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    });
    return this.http.post<Usuario[]>(`${this.apiUrl}/search`, {search: nombre},{ headers });
  }
}
