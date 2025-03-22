import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, FileModel, Folder } from '../interfaces/types';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FoldersService {
  private apiUrl = environment.API_URL +'/api/gestor'; // Ajusta esta URL según tu API
  http = inject(HttpClient);

  getFolderContents(path: string): Observable<ApiResponse<{ folders: Folder[], files: FileModel[], access: boolean }>> {
    let params = new HttpParams().set('path', path);
    const token = localStorage.getItem('authToken') ?? '';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    if (token) {
      params = params.set('token', token);
    }
    return this.http.get<ApiResponse<{ folders: Folder[], files: FileModel[], access: boolean }>>(this.apiUrl, { params, headers });
  }
  getFolderShared(path: string): Observable<ApiResponse<{ folders: Folder[], files: FileModel[], access: boolean }>> {
    const token = localStorage.getItem('authToken') ?? '';
    let params = new HttpParams().set('path', path);
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<ApiResponse<{ folders: Folder[], files: FileModel[], access: boolean }>>(this.apiUrl + '/shared', { params, headers});
  } 
  getFoldersSharedbyId(id: number): Observable<{folders: Folder[]}>{
    const token = localStorage.getItem('authToken') ?? '';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<{folders: Folder[], access: boolean}>(`${this.apiUrl}/shared/${id}`, { headers });
  }
  shared(name: string, path: string, userId: number, accessType: string){
    const token = localStorage.getItem('authToken') ?? '';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post(`${this.apiUrl}/sharedfolder`, {name,path, userId, accessType}, { headers });
  }
  editsharedaccess( id: number, accessType: string){
    const token = localStorage.getItem('authToken') ?? '';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post(`${this.apiUrl}/editaccesssharedfolder`, { id, accessType}, { headers });
  }
  deleteshared(id: number){
    const token = localStorage.getItem('authToken') ?? '';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete(`${this.apiUrl}/shared/${id}`, { headers });

  }
  historial(path: string): Observable<{historial: any[]}>{
    const token = localStorage.getItem('authToken') ?? '';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<{historial: any[]}>(`${this.apiUrl}/historial`, {path},{ headers });
  }
}
