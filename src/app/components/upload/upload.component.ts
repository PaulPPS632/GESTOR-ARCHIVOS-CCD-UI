import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { FilesService } from '../../services/files.service';
import Swal from 'sweetalert2';
import { FileModel } from '../../interfaces/types';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-upload',
  imports: [ModalComponent, FormsModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css',
})
export class UploadComponent {
  @Input() isOpenUpload: boolean = false;
  @Output() isOpenUploadChange = new EventEmitter<boolean>();
  @Output() uploadedFilesChange = new EventEmitter<FileModel[]>();
  @Output() uploadedNewFolderChange = new EventEmitter<{folderPath: string, files: FileModel[]}>();
  @Input() path: string = '';
  @Input() token: string = '';
  @Input() newFolderFlag: boolean = false;
  @Input() titulo: string = '';
  newFolderPath: string = '';
  isDragging = false;
  files: File[] = [];
  isUploading: boolean = false;

  filesService = inject(FilesService);
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
    this.isOpenUploadChange.emit(false);

    const createpath = this.newFolderFlag ? this.path : `${this.path}/${this.newFolderPath}`;

    this.filesService.upload(createpath, this.files, this.token).subscribe({
      next: (res) => {
        this.files = [];
        this.Toast.fire({
          icon: 'success',
          title: 'Archivos subidos correctamente',
        });
      },
      error: (err) => {
        this.Toast.fire({
          icon: 'error',
          title: 'Error al subir archivos',
        });
      },
    });
  }
}
