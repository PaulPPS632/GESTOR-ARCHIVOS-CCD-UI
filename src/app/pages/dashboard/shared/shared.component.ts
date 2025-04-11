import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FileModel, Folder, Usuario } from '../../../interfaces/types';
import { FilesService } from '../../../services/files.service';
import { FoldersService } from '../../../services/folders.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest } from 'rxjs';
import { FileGridComponent } from '../../../components/file-grid/file-grid.component';
import { FileListComponent } from '../../../components/file-list/file-list.component';
import { AuthService } from '../../../services/auth.service';
import { UploadComponent } from '../../../components/upload/upload.component';
import Swal from 'sweetalert2';
import { LoaderComponent } from "../../../components/loader/loader.component";
import { ModalComponent } from "../../../components/modal/modal.component";

@Component({
  selector: 'app-shared',
  imports: [
    CommonModule,
    RouterLink,
    FileGridComponent,
    FileListComponent,
    UploadComponent,
    LoaderComponent,
    ModalComponent
],
  templateUrl: './shared.component.html',
  styleUrl: './shared.component.css',
})
export class SharedComponent implements OnInit {
  filesService = inject(FilesService);
  foldersService = inject(FoldersService);
  authService = inject(AuthService);
  usuario: Usuario | null = null;
  route = inject(ActivatedRoute);
  router = inject(Router);
  isGridView: boolean = true;
  files: FileModel[] = [];
  folders: Folder[] = [];
  sharedFolders: Folder[] = [];
  currentPath: string = '';
  breadcrumbs: Folder[] = [];
  selectedFiles: FileModel[] = [];
  isOpenNewFolder: boolean = false;
  isOpenUpload: boolean = false;
  Authorizado: boolean = true;
  accessType: string = 'lector';
  historialdata: any[] = [];
  isLoader: boolean = false;
  isOpenHistorial: boolean = false;
  progress = 100;
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

  ngOnInit(): void {
    this.authService.usuario$.subscribe((res) => (this.usuario = res));
    this.route.paramMap.subscribe((params) => {
      if (this.currentPath !== params.get('path')) {
        this.currentPath = params.get('path') || '';
        const folder = this.usuario?.sharedFolders?.find(
          (folder) => this.currentPath.startsWith(folder.path)
        );
        this.accessType = folder?.accessType.toLocaleLowerCase() ?? 'lector';
        if (this.currentPath !== '') {
          this.loadFolderContents();
        } else {
          this.loadFolderShared(this.usuario?.id ?? 0);
        }
      }
    });
    this.filesService.progress$.subscribe(p => this.progress = p);
  }
  reloadcontent(){
    if(this.currentPath !== '' && this.currentPath !== null){
      this.loadFolderContents();
      this.Toast.fire({
        icon: 'success',
        title: 'Se actualizaron los datos',
      });
    }else{
      window.location.reload();
    }
  }
  loadFolderContents(): void {
    this.foldersService.getFolderShared(this.currentPath).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.Authorizado = response.data.access;
          this.folders = response.data.folders;
          this.files = response.data.files;
          this.buildBreadcrumbs();
        } else {
          // Manejo de error
          console.error('Error al cargar contenido', response.error);
        }
      },
      error: (error) => {
        // Manejo de error
        this.Authorizado = false;
        console.error('Error al cargar contenido', error);
      },
    });
  }

  loadFolderShared(id: number): void {
    this.foldersService.getFoldersSharedbyId(id).subscribe({
      next: (response) => {
        this.folders = response.folders;
        this.sharedFolders = response.folders;
        this.Authorizado = true;
        this.buildBreadcrumbs();
      },
      error: (error) => {
        // Manejo de error
        this.Authorizado = false;
        console.error('Error al cargar contenido', error);
      },
    });
  }
  buildBreadcrumbs(): void {
    // Suponiendo que el currentPath es algo como "IMAGENES/VIAJE/SEMANA1"
    const breadcrumbs: Folder[] = [
      {
        id: 0,
        name: 'root',
        path: '',
      },
    ];

    // Si currentPath está vacío, solo muestra el root
    if (!this.currentPath || this.currentPath.trim() === '') {
      this.breadcrumbs = breadcrumbs;
      console.log('se activa return', this.breadcrumbs);

      return;
    }

    // Elimina barras iniciales y divide en segmentos
    const segments = this.currentPath
      .split('/')
      .filter((segment) => segment.trim() !== '');
    let cumulativePath = '';

    segments.forEach((segment, index) => {
      // Acumula el path con "/" solo cuando no es el primer segmento
      cumulativePath += (cumulativePath ? '/' : '') + segment;
      const current = `${cumulativePath}/`;
      if (
        this.usuario?.sharedFolders?.some((folder) => {
          return current.startsWith(folder.path);
        })
      ) {
        breadcrumbs.push({
          id: index + 1, // O usa un ID adecuado
          name: segment,
          path: current,
        });
      }
      console.log('=====================');
    });

    this.breadcrumbs = breadcrumbs;
  }
  getCrumbPath(folder: Folder): any[] {
    return folder.path
      ? ['/Dashboard/Shared', folder.path]
      : ['/Dashboard/Shared'];
  }
  navigateBreadcrumbblank(folder: Folder) {
    const newPath =
      folder.path && folder.path !== ''
        ? ['/Dashboard/Shared', folder.path]
        : ['/Dashboard/Shared'];
    this.router.navigate(newPath);
  }
  search(event: Event) {
    const packageName = (event.target as HTMLInputElement).value;
    if (packageName === '') {
      this.loadFolderContents();
      return;
    }
    this.filesService.searchFiles(packageName).subscribe((res) => {
      this.files = res;
      this.folders = [];
    });
  }
  toggleIsOpenNewFolder() {
    this.isOpenNewFolder = !this.isOpenNewFolder;
  }
  toggleIsOpenUpload() {
    this.isOpenUpload = !this.isOpenUpload;
  }
  deletefiles() {
    const paths = this.selectedFiles.map((file) => file.path);
    this.delete(paths);
  }
  delete(paths: string[]){
    this.isLoader = true;
    this.filesService.delete(paths, this.usuario?.id,'').subscribe({
      next: (res) => {
        this.files = this.files.filter((f) => !paths.includes(f.path));
        this.selectedFiles = this.selectedFiles.filter(
          (f) => !paths.includes(f.path)
        );
        this.isLoader = false;
        this.Toast.fire({
          icon: 'success',
          title: 'Se eliminaron correctamente',
        });
        //this.loadFolderContents();
      },
      error: (err) => {
        this.isLoader = false;
        this.Toast.fire({
          icon: 'success',
          title: 'Error al eliminar archivos',
        });
        console.log(err);
      },
    });
  }
  navigateFolder(path: string): void {
    // Generar el nuevo path. Si el currentPath es 'root' o vacío, se usa directamente el folder.name;
    // de lo contrario, se concatena al path actual.
    //const newPath = this.currentPath === 'root' || this.currentPath === '' ? folder.name : `${this.currentPath}/${folder.name}`;
    console.log('navega a: ', path);
    this.router.navigate(['/Dashboard/Shared', path]);
  }
  selectPaths(files: FileModel[]) {
    this.selectedFiles = files;
  }
  redirectShared() {
    this.router.navigate(['/Dashboard/Shared']);
  }
  updatefoldersfiles(data: { files: FileModel[]; folder: Folder | undefined  }) {
    console.log('LLEGA A LAYOUT:', data);
    if (data.files) {
      this.files = [...this.files, ...data.files];
    }
    if (data.folder) {
      this.folders = [...this.folders, data.folder];
    }
    //this.folders = [...this.folders, data.folders];
  }

  renamefile(data: {folder:Folder, newName: string}){
    this.isLoader = true;
    this.filesService.rename(data.folder.path, data.newName, this.usuario?.id).subscribe({
      next: (res) =>{
        this.isLoader = false;
        this.Toast.fire({
          icon: 'success',
          title: 'Se renombro correctamente',
        });
        this.loadFolderContents();
      },
      error: (err) =>{
        this.isLoader = false;
        this.Toast.fire({
          icon: 'error',
          title: 'Error al renombrar',
        });
      }
    })
  }
  historial(){
    this.isLoader = true;
    this.foldersService.historial(this.currentPath).subscribe({
      next: (res)=> {
        this.historialdata = res.historial;
        this.isLoader = false;
        this.isOpenHistorial = true; 
      },
      error: (err) =>{
        this.isLoader = false;
        this.isOpenHistorial = false; 
        this.Toast.fire({
          icon: 'error',
          title: 'Error al obtener historial',
        });
      }
    })
  }
  DownloadFolder(){
      this.progress = 0;
      const MAX_SIZE_BYTES = 2 * 1024 * 1024 * 1024; // 2GB
      const filesdownload = this.files
      .filter(file => file.size <= MAX_SIZE_BYTES).map((file) => {
        return { name: file.name, url: file.url };
      });
      //this.filesService.downloadFolderAsZipWithProgress(filesdownload, this.currentPath);
      Swal.fire({
        title: 'Descargando archivos...',
        html: `
          <div style="margin-top: 10px;">
            <progress id="zipProgress" value="0" max="100" style="width: 100%;"></progress>
            <div id="zipPercentText" style="margin-top: 5px; font-weight: bold;">0%</div>
          </div>
        `,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          // Empieza la descarga cuando se abre el SweetAlert
          this.filesService.downloadFolderAsZipWithProgress(filesdownload, this.currentPath, (progress: number) => {
            const progressBar = document.getElementById('zipProgress') as HTMLProgressElement;
            const percentText = document.getElementById('zipPercentText');
            if (progressBar && percentText) {
              progressBar.value = progress;
              percentText.textContent = `${progress}%`;
            }
          }).then(() => {
            Swal.fire({
              icon: 'success',
              title: '¡Descarga completada!',
              timer: 2000,
              showConfirmButton: false,
            });
          }).catch(() => {
            Swal.fire({
              icon: 'error',
              title: 'Error al descargar archivos',
              text: 'Verifica tu conexión o intenta más tarde.',
            });
          });
        }
      });
    }
}
