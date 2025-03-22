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
  @Output() uploadedNewFolderFiles = new EventEmitter<{files: FileModel[], folder: Folder}>();
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
  uploadFiles() {
    console.log(this.path, this.files, this.token);
    this.Toast.fire({
      icon: 'success',
      title: 'Subiendo archivos',
    });
    const createpath = this.newFolderFlag ? `${this.path}/${this.newFolderPath}/` : this.path;
    this.isOpenUploadChange.emit(false);
    this.isOpenLoaderChange.emit(true);
    console.log("el usuario id es: ",this.usuario?.id);
    this.filesService.upload(createpath, this.files, this.newFolderFlag , this.usuario?.id, this.token).subscribe({
      next: (res) => {
        this.files = [];
        this.isOpenLoaderChange.emit(false);
        this.uploadedNewFolderFiles.emit(res.data)
        this.Toast.fire({
          icon: 'success',
          title: 'Archivos subidos correctamente',
        });
      },
      error: (err) => {
        this.isOpenLoaderChange.emit(false);
        this.Toast.fire({
          icon: 'error',
          title: 'Error al subir archivos',
        });
      },
    });
  }
}
