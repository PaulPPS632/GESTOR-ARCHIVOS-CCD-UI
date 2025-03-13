import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiResponse, FileModel, Folder } from '../interfaces/types';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FoldersService {
  private apiUrl = environment.API_URL +'/api/gestor'; // Ajusta esta URL según tu API
  http = inject(HttpClient);

  getFolderContents(path: string, token?: string): Observable<ApiResponse<{ folders: Folder[], files: FileModel[] }>> {
    let params = new HttpParams().set('path', path);
    if (token) {
      params = params.set('token', token);
    }
    return this.http.get<ApiResponse<{ folders: Folder[], files: FileModel[] }>>(this.apiUrl, { params });
  }
  
}
