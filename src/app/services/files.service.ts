import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, FileModel, Folder } from '../interfaces/types';

@Injectable({
  providedIn: 'root'
})
export class FilesService {
  private apiUrl = environment.API_URL +'/api/gestor'; // Ajusta esta URL según tu API
  http = inject(HttpClient);
  constructor() { }
  searchFiles(query: string): Observable<FileModel[]> {
    return this.http.get<FileModel[]>(`${this.apiUrl}/search?search=${query}`);
  }
  upload(path: string, files: File[], token?: string): Observable<ApiResponse<{files:FileModel[], folders: Folder}>> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('path', path);
    if (token) {
      formData.append('token', token);
    }
    return this.http.post<ApiResponse<{files:FileModel[], folders: Folder}>>(`${this.apiUrl}/upload`, formData);
  }
}
