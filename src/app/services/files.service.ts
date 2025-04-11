import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import {
  HttpClient,
  HttpEvent,
  HttpEventType,
  HttpHeaders,
  HttpParams,
  HttpRequest,
  HttpUploadProgressEvent,
} from '@angular/common/http';
import { BehaviorSubject, catchError, finalize, forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { ApiResponse, FileModel, Folder } from '../interfaces/types';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
@Injectable({
  providedIn: 'root',
})
export class FilesService {
  private apiUrl = environment.API_URL + '/gestor'; // Ajusta esta URL según tu API
  http = inject(HttpClient);
  constructor() {}
  searchFiles(query: string): Observable<FileModel[]> {
    return this.http.get<FileModel[]>(`${this.apiUrl}/search?search=${query}`);
  }
  /*
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
  }*/
  /* version 2
    upload(
      path: string,
      files: File[],
      newfolder: boolean,
      userId: number | undefined,
      token?: string
    ): Observable<HttpEvent<ApiResponse<{ files: FileModel[]; folder: Folder }>>> {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('path', path);
      formData.append('newfolder', newfolder.toString());
      if (userId) {
        formData.append('userId', userId.toString());
      }
      if (token) {
        formData.append('token', token);
      }
    
      const req = new HttpRequest(
        'POST',
        `${this.apiUrl}/upload`,
        formData,
        {
          reportProgress: true,
        }
      );
    
      return this.http.request<ApiResponse<{ files: FileModel[]; folder: Folder }>>(req);
    }
    */

  upload(
    path: string,
    files: File[],
    newfolder: boolean,
    userId: number | undefined,
    token?: string
  ): Observable<
    HttpEvent<ApiResponse<{ files: FileModel[]; folder: Folder }>>
  > {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('path', path);
    formData.append('newfolder', newfolder.toString());
    if (userId) formData.append('userId', userId.toString());
    if (token) formData.append('token', token);

    return this.http.post<ApiResponse<{ files: FileModel[]; folder: Folder }>>(
      `${this.apiUrl}/upload`,
      formData,
      {
        reportProgress: true,
        observe: 'events',
      }
    );
  }
  /*
  uploadPresigned(path: string, files: File[], newfolder: boolean, userId: number | undefined, token?: string): Observable<HttpEvent<any>[]> {
    // Paso 1: Solicitar las URLs firmadas al backend
    console.log('Archivos a subir:', files);

  // Verifica si los archivos contienen datos
    if (files.length === 0) {
      console.error('No hay archivos para subir');
      return of([]); // Retorna un observable vacío en caso de que no haya archivos
    }
    const fileMetadata = files.map((file) => ({
      originalName: file.name, // Nombre original del archivo
      type: file.type,         // Tipo MIME del archivo
    }));
    return this.http.post<{ urls: string[] }>(`${this.apiUrl}/generate-presigned-url`, { files: fileMetadata, path, newfolder }).pipe(
      switchMap((response) => {
        const urls = response.urls;
        
        // Paso 2: Crear observables de subida para cada archivo
        const uploadObservables = files.map((file, index) => {
          return this.http.post(urls[index], file, {
            headers: new HttpHeaders({ 'Content-Type': file.type }),
            observe: 'events',
            reportProgress: true,
          });
        });
  
        // Paso 3: Usar forkJoin para ejecutar todas las subidas de forma paralela
        return forkJoin(uploadObservables);
      }),
      catchError((error) => {
        console.error('Error al subir archivos', error);
        throw error;
      })
    );
  }
*/
uploadPresigned(path: string, files: File[], newfolder: boolean, userId: number | undefined, token?: string): Observable<HttpEvent<any>[]> {
  console.log('Archivos a subir:', files);

  if (files.length === 0) {
    console.error('No hay archivos para subir');
    return of([]);
  }

  // Extraer metadata de cada archivo para enviarla al backend
  const fileMetadata = files.map(file => ({
    originalName: file.name,
    type: file.type
  }));

  // Solicitar las URLs prefirmadas al backend
  return this.http.post<{ urls: Array<{ url: string, originalName: string, type: string }> }>(
    `${this.apiUrl}/generate-presigned-url`, 
    { files: fileMetadata, path, newfolder }
  ).pipe(
    switchMap(response => {
      const signedUrls = response.urls;

      // Crear un observable para cada subida PUT directa a Cloudflare R2
      const uploadObservables = files.map((file, index) => {
        const signedData = signedUrls[index];
        const headers = new HttpHeaders({ 'Content-Type': file.type });

        return this.http.put(signedData.url, file, {
          headers,
          observe: 'events',
          reportProgress: true
        });
      });

      return forkJoin(uploadObservables);
    }),
    catchError((error: any) => {
      console.error('Error al subir archivos', error);
      throw error;
    })
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
    return this.http.post(
      `${this.apiUrl}/rename`,
      { oldkey, newname, userId },
      { headers }
    );
  }

  uploadLargeFiles(path: string, files: File[], newfolder: boolean): Observable<any[]> {
    // Mapea cada archivo a una llamada a uploadLargeFile
    const uploadObservables = files.map(file => this.uploadLargeFile(file, path, newfolder));
    // forkJoin retorna un array con todas las respuestas cuando todos terminen
    return forkJoin(uploadObservables);
  }

  uploadLargeFile(file: File, path: string, newfolder: boolean): Observable<any> {
    // 1. Definir la clave en R2, por ejemplo: "Marketing/filename"
    const key = `${path}/${file.name}`;

    // 2. Iniciar el multipart upload
    return this.http.post<{ uploadId: string, key: string }>(`${this.apiUrl}/multipart-initiate`, {
      key,
      contentType: file.type
    }).pipe(
      switchMap(initResponse => {
        const uploadId = initResponse.uploadId;
        const partSize = 50 * 1024 * 1024; // Tamaño de cada parte (10 MB, modificar según necesidad)
        const totalParts = Math.ceil(file.size / partSize);
        const partsMetadata = [];
        for (let i = 1; i <= totalParts; i++) {
          partsMetadata.push({ partNumber: i, size: partSize });
        }

        // 3. Solicitar las URLs prefirmadas para cada parte
        return this.http.post<{ urls: Array<{ partNumber: number, url: string }> }>(`${this.apiUrl}/generate-presigned-part-urls`, {
          key,
          uploadId,
          parts: partsMetadata
        }).pipe(
          switchMap(urlResponse => {
            const urls = urlResponse.urls;
            // 4. Subir cada parte usando PUT
            const uploadObservables: Observable<any>[] = urls.map(obj => {
              const partNumber = obj.partNumber;
              const start = (partNumber - 1) * partSize;
              const end = Math.min(file.size, start + partSize);
              const blobPart = file.slice(start, end);
              const headers = new HttpHeaders({ 'Content-Type': file.type });
              return this.http.put(obj.url, blobPart, {
                headers,
                observe: 'response'
              });
            });

            return forkJoin(uploadObservables).pipe(
              switchMap(responses => {
                // 5. Extraer los ETag de cada respuesta
                const parts = responses.map((resp, index) => ({
                  PartNumber: index + 1,
                  ETag: resp.headers.get("ETag")?.replace(/"/g, '')
                }));
                // 6. Completar el multipart upload
                return this.http.post(`${this.apiUrl}/multipart-complete`, {
                  key,
                  uploadId,
                  parts
                });
              })
            );
          })
        );
      })
    );
  }
  uploadMultipartFiles(
    path: string,
    files: File[],
    newfolder: boolean,
    userId: number | undefined
  ): Observable<void[]> {
    // Paso 1: iniciar todas las subidas
    const uploadTasks = files.map(file => {
      return new Observable<void>(observer => {
        const uniqueKey = `${path}/${file.name}`.replace(/\/+/g, '/');
  
        // Paso 2: Solicitar al backend el inicio del multipart upload
        this.http.post<{ uploadId: string, key: string }>(
          `${this.apiUrl}/multipart-initiate`,
          { key: uniqueKey, contentType: file.type }
        ).pipe(
          switchMap(init => {
            const partSize = 20 * 1024 * 1024; // 5 MB mínimo por parte
            const partCount = Math.ceil(file.size / partSize);
            const parts = Array.from({ length: partCount }, (_, i) => ({
              partNumber: i + 1
            }));
  
            // Paso 3: Obtener URLs firmadas para cada parte
            return this.http.post<{ urls: { partNumber: number, url: string }[] }>(
              `${this.apiUrl}/generate-presigned-part-urls`,
              { key: init.key, uploadId: init.uploadId, parts }
            ).pipe(
              switchMap(res => {
                const uploadPartObservables = res.urls.map(({ partNumber, url }) => {
                  const start = (partNumber - 1) * partSize;
                  const end = Math.min(start + partSize, file.size);
                  const blob = file.slice(start, end);
  
                  return this.http.put(url, blob, {
                    observe: 'response'
                  }).pipe(
                    map(resp => ({
                      ETag: resp.headers.get('ETag')!,
                      PartNumber: partNumber
                    }))
                  );
                });
  
                return forkJoin(uploadPartObservables).pipe(
                  switchMap(completedParts => {
                    // Paso 4: Completar el multipart
                    return this.http.post(
                      `${this.apiUrl}/multipart-complete`,
                      {
                        key: init.key,
                        uploadId: init.uploadId,
                        parts: completedParts,
                        userId: userId, 
                        path,
                        foldername: path.split("/").pop(),
                        nombrearchivo: file.name
                      }
                    );
                  })
                );
              })
            );
          })
        ).subscribe({
          next: () => {
            observer.next();
            observer.complete();
          },
          error: err => observer.error(err)
        });
      });
    });
  
    // Ejecutar todas las subidas en paralelo y emitir cuando todas estén completas
    return forkJoin(uploadTasks);
  }
  public progress$ = new BehaviorSubject<number>(0);
  async downloadFolderAsZipWithProgress(
    files: { name: string, url: string }[],
    zipName = 'carpeta.zip',
    onProgress?: (progress: number) => void
  ): Promise<void> {
    const zip = new JSZip();
    const total = files.length;
    let completed = 0;

    for (const file of files) {
      try {
        const response = await fetch(file.url);
        const blob = await response.blob();
        zip.file(file.name, blob);
      } catch (err) {
        console.error(`Error descargando ${file.name}`, err);
      }
      completed++;
      const progress = Math.floor((completed / total) * 90); // hasta 90% (los otros 10% se reservan para compresión)
      onProgress?.(progress);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
      const percent = Math.floor(metadata.percent);
      onProgress?.(90 + Math.floor(percent * 0.1)); // los últimos 10%
    });

    onProgress?.(100);
    saveAs(zipBlob, zipName);
  }
}
