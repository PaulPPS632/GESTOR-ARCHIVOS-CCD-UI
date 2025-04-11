import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { FilesService } from '../../services/files.service';
import Swal from 'sweetalert2';
import { FileModel, Folder, Usuario } from '../../interfaces/types';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { HttpEvent, HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-upload',
  imports: [ModalComponent, FormsModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css',
})
export class UploadComponent implements OnInit{
  @Input() isOpenUpload: boolean = false;
  @Output() isOpenUploadChange = new EventEmitter<boolean>();
  @Output() isOpenLoaderChange = new EventEmitter<boolean>();
  @Output() uploadedFilesChange = new EventEmitter<FileModel[]>();
  @Output() uploadedNewFolderFiles = new EventEmitter<{files: FileModel[], folder: Folder| undefined}>();
  @Input() path: string = '';
  @Input() token: string = '';
  @Input() newFolderFlag: boolean = false;
  @Input() titulo: string = '';
  usuario: Usuario | null = null;
  newFolderPath: string = '';
  isDragging = false;
  files: File[] = [];
  isUploading: boolean = false;

  filesService = inject(FilesService);
  authService = inject(AuthService);
  ngOnInit(): void {
      this.authService.usuario$.subscribe((res)=> this.usuario = res);
  }
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
  constructor(private cdr: ChangeDetectorRef) {}

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;

    if (event.dataTransfer?.files.length) {
      this.addFiles(event.dataTransfer.files);
    }
  }

  upload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.addFiles(input.files);
    }
  }

  addFiles(fileList: FileList) {
    const newFiles = Array.from(fileList);
    this.files = [...this.files, ...newFiles];

    this.cdr.detectChanges(); // Forzar actualización de la UI
  }

  removeFile(index: number) {
    this.files.splice(index, 1);
    this.cdr.detectChanges(); // Asegurar actualización de la UI
  }
  close(flag: boolean): void {
    this.isOpenUploadChange.emit(flag);
  }
  /*
    uploadFiles() {
      const createpath = this.newFolderFlag ? `${this.path}/${this.newFolderPath}/` : this.path;
      this.isOpenUploadChange.emit(false);
      let progressValue = 0;
      let alreadySwitchedToProcessing = false;
      // Loader SweetAlert con barra de progreso personalizada
      Swal.fire({
        title: 'Subiendo archivos...',
        html: `
          <div id="swal-progress-wrapper">
            <progress id="uploadProgress" value="0" max="100" style="width: 100%;" class="rounded-lg"></progress>
            <span id="progressText">0%</span>
          </div>`,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          this.filesService.uploadPresigned(createpath, this.files, this.newFolderFlag, this.usuario?.id, this.token)
            .subscribe({
              next: (event: HttpEvent<any>) => {
                if (event.type === HttpEventType.UploadProgress && event.total) {
                  progressValue = Math.round((event.loaded / event.total) * 100);
                  const progressEl = document.getElementById('uploadProgress') as HTMLProgressElement;
                  const textEl = document.getElementById('progressText')!;
                  progressEl.value = progressValue;
                  textEl.innerText = `${progressValue}%`;
                  if (progressValue === 100 && !alreadySwitchedToProcessing) {
                    alreadySwitchedToProcessing = true;
    
                    const wrapper = document.getElementById('swal-progress-wrapper');
                    if (wrapper) {
                      wrapper.innerHTML = `
                        <div style="text-align: center; padding-top: 10px;">
                          <div class="spinner" style="
                            border: 4px solid #f3f3f3;
                            border-top: 4px solid #3498db;
                            border-radius: 50%;
                            width: 30px;
                            height: 30px;
                            animation: spin 1s linear infinite;
                            margin: 0 auto;
                          "></div>
                          <p style="margin-top: 10px;">Finalizando subida...</p>
                        </div>
                        <style>
                          @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                          }
                        </style>`;
                    }
                  }
    
                } else if (event.type === HttpEventType.Response) {
                  this.files = [];
                  this.uploadedNewFolderFiles.emit(event.body.data);
                  this.isOpenLoaderChange.emit(false);
                  Swal.close(); // Cierra el loader
                  this.Toast.fire({
                    icon: 'success',
                    title: 'Archivos subidos correctamente',
                  });
                }
              },
              error: (err) => {
                console.error(err);
                this.isOpenLoaderChange.emit(false);
                Swal.close();
                this.Toast.fire({
                  icon: 'error',
                  title: 'Error al subir archivos',
                });
              }
            });
        }
      });
    
    }
      */
  /*uploadFiles() {
    const createpath = this.newFolderFlag ? `${this.path}/${this.newFolderPath}/` : this.path;
    this.isOpenUploadChange.emit(false);
    this.isUploading = true;
    this.filesService.upload(createpath, this.files, this.newFolderFlag, this.usuario?.id, this.token)
      .subscribe({
        next: (event: HttpEvent<any>) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            const progressValue = Math.round((event.loaded / event.total) * 100);
            console.log(`Progreso: ${progressValue}%`);
          } else if (event.type === HttpEventType.Response) {
            this.files = [];
            this.uploadedNewFolderFiles.emit(event.body.data);
            this.isUploading = false;
            this.Toast.fire({
              icon: 'success',
              title: 'Archivos subidos correctamente',
            });
          }
        },
        error: (err) => {
          console.error(err);
          this.isUploading = false;
          this.Toast.fire({
            icon: 'error',
            title: 'Error al subir archivos',
          });
        }
      });
  }*/
 uploadFiles(){
  const createpath = this.newFolderFlag ? `${this.path}/${this.newFolderPath}/` : this.path;
    this.isOpenUploadChange.emit(false);
    this.isOpenLoaderChange.emit(true);
  this.Toast.fire({
    icon: 'success',
    title: 'Subiendo archivos, esto puede tardar varios minutos ...',
  });
  this.filesService.uploadMultipartFiles(createpath, this.files, this.newFolderFlag, this.usuario?.id).subscribe({
    next: (responses: void[]) => {
      if (responses.length === this.files.length) {
        this.isOpenLoaderChange.emit(false);
        this.Toast.fire({
          icon: 'success',
          title: 'Archivos subidos correctamente',
        });
        console.log(this.files);
        const uploaded = {
          files: !this.newFolderFlag ? this.files.map((res)=> ({
            id: Math.floor(Math.random() * 1000000),
            name: res.name,
            mimetype: res.type,
            size: res.size,
            url: `https://pub-9d2abfa175714e64aed33b90722a9fd5.r2.dev/${createpath}/${res.name}`,
            thumbnailUrl : `https://pub-9d2abfa175714e64aed33b90722a9fd5.r2.dev/${createpath}/${res.name}`,
            path: createpath,
          }) as FileModel) : [] ,
          folder: this.newFolderFlag ? {
            name: this.newFolderPath,
            path: `${this.path}/${this.newFolderPath}`,
            accessType: 'editor' as 'editor',
          }: undefined
          }
          console.log(uploaded)
        this.uploadedNewFolderFiles.emit(uploaded)
        this.files = [];
      }
    },
    error: (err) => {
      console.error(err);
      this.isOpenLoaderChange.emit(false);
      this.Toast.fire({
        icon: 'error',
        title: 'Error al subir archivos',
      });
    }
  });
  
 }
 /**
  * this.filesService.uploadLargeFiles(createpath, this.files, this.newFolderFlag)
    .subscribe({
      next: (responses: any[]) => {
        if (responses.length === this.files.length) {
          this.files = [];
          this.isUploading = false;
          this.Toast.fire({
            icon: 'success',
            title: 'Archivos subidos correctamente',
          });
          this.uploadedFilesChange.emit(responses);
        }
      },
      error: (err) => {
        console.error(err);
        this.isUploading = false;
        this.Toast.fire({
          icon: 'error',
          title: 'Error al subir archivos',
        });
      }
    });
  * 
  * 
  * 
  * 
  * 
  Swal.fire({
    title: 'Subiendo archivos...',
    html: `
      <div id="swal-progress-wrapper">
        <progress id="uploadProgress" value="0" max="100" style="width: 100%;" class="rounded-lg"></progress>
        <span id="progressText">0%</span>
      </div>`,
    allowOutsideClick: false,
    showConfirmButton: false,
    didOpen: () => {
      this.filesService.uploadPresigned(createpath, this.files, this.newFolderFlag, this.usuario?.id, this.token)
      .subscribe({
        next: (events: HttpEvent<any>[]) => {
          // Manejar el progreso de cada archivo
          events.forEach((event) => {
            if (event.type === HttpEventType.UploadProgress && event.total) {
              const progressValue = Math.round((event.loaded / event.total) * 100);
              const progressEl = document.getElementById('uploadProgress') as HTMLProgressElement;
              const textEl = document.getElementById('progressText')!;
              progressEl.value = progressValue;
              textEl.innerText = `${progressValue}%`;

              if (progressValue === 100 && !alreadySwitchedToProcessing) {
                alreadySwitchedToProcessing = true;
                const wrapper = document.getElementById('swal-progress-wrapper');
                if (wrapper) {
                  wrapper.innerHTML = `
                    <div style="text-align: center; padding-top: 10px;">
                      <div class="spinner" style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 0 auto;"></div>
                      <p style="margin-top: 10px;">Finalizando subida...</p>
                    </div>
                    <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }}</style>`;
                }
              }
            } else if (event.type === HttpEventType.Response) {
              // Cuando todas las subidas terminan
              this.files = [];
              this.uploadedNewFolderFiles.emit(event.body.data);
              this.isOpenLoaderChange.emit(false);
              Swal.close(); // Cierra el loader
              this.Toast.fire({
                icon: 'success',
                title: 'Archivos subidos correctamente',
              });
            }
          });
        },
        error: (err) => {
          console.error(err);
          this.isOpenLoaderChange.emit(false);
          Swal.close();
          this.Toast.fire({
            icon: 'error',
            title: 'Error al subir archivos',
          });
        }
      });
    }
  });
  */
}
