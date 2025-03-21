import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, FileModel, Folder } from '../interfaces/types';

@Injectable({
  providedIn: 'root',
})
export class FilesService {
  private apiUrl = environment.API_URL + '/api/gestor'; // Ajusta esta URL según tu API
  http = inject(HttpClient);
  constructor() {}
  searchFiles(query: string): Observable<FileModel[]> {
    return this.http.get<FileModel[]>(`${this.apiUrl}/search?search=${query}`);
  }
  upload(
    path: string,
    files: File[],
    newfolder: boolean,
    userId: number | undefined,
    token?: string
  ): Observable<ApiResponse<{ files: FileModel[]; folder: Folder }>> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('path', path);
    console.log(path, files, token, newfolder);
    formData.append('newfolder', newfolder.toString());
    if (userId) {
      formData.append('userId', userId.toString());
    }
    if (token) {
      formData.append('token', token);
    }
    return this.http.post<ApiResponse<{ files: FileModel[]; folder: Folder }>>(
      `${this.apiUrl}/upload`,
      formData
    );
  }
  delete(
    paths: string[],
    userId: number | undefined,
    token?: string
  ): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}`, {
      body: { paths, userId },
    });
  }
  rename(oldkey: string, newname: string, userId: number | undefined) {
    const token = localStorage.getItem('authToken') ?? '';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post(`${this.apiUrl}/rename`, { oldkey, newname, userId }, {headers});
  }
}
