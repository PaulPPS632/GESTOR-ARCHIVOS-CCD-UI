import { ChangeDetectorRef, Component, inject, Input } from '@angular/core';
import { UploadComponent } from '../../../components/upload/upload.component';
import { FileGridComponent } from '../../../components/file-grid/file-grid.component';
import { FileListComponent } from '../../../components/file-list/file-list.component';
import { FoldersService } from '../../../services/folders.service';
import { FilesService } from '../../../services/files.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FileModel, Folder, Usuario } from '../../../interfaces/types';
import { combineLatest } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../components/modal/modal.component';
import { LoaderComponent } from '../../../components/loader/loader.component';
import Swal from 'sweetalert2';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-home',
  imports: [
    UploadComponent,
    FileGridComponent,
    FileListComponent,
    CommonModule,
    RouterLink,
    ModalComponent,
    LoaderComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  @Input('path') path: string = '';
  foldersService = inject(FoldersService);
  filesService = inject(FilesService);
  authService = inject(AuthService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  cdr = inject(ChangeDetectorRef);
  currentPath: string = '';
  breadcrumbs: Folder[] = [];
  files: FileModel[] = [];
  folders: Folder[] = [];
  selectedFiles: FileModel[] = [];

  token?: string;
  Selected: boolean = true;
  isGridView: boolean = true;

  isOpenUpload: boolean = false;
  isOpenNewFolder: boolean = false;
  isLoader: boolean = false;
  usuario: Usuario | null = null;
  historialdata: any[] = [];
  isOpenHistorial: boolean = false;
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
  rename(value: string): void {
    console.log('Realizando búsqueda con:', value);
    // Aquí llamarías al servicio para buscar archivos
  }
  ngOnInit(): void {
    this.authService.usuario$.subscribe((res) => this.usuario = res);
    combineLatest([this.route.paramMap, this.route.queryParamMap]).subscribe(
      ([params, queryParams]) => {
        this.currentPath = params.get('path') || '';
        this.token = queryParams.get('token') || undefined;
        this.loadFolderContents();
      }
    );
  }
  reloadcontent(){
    this.loadFolderContents();
      this.Toast.fire({
        icon: 'success',
        title: 'Se actualizaron los datos',
      });
  }
  loadFolderContents(): void {
    this.foldersService
      .getFolderContents(this.currentPath)
      .subscribe((response) => {
        if (response.success && response.data) {
          this.folders = response.data.folders;
          console.log(this.folders);
          this.files = response.data.files;
          this.buildBreadcrumbs();
        } else {
          // Manejo de error
          console.error('Error al cargar contenido', response.error);
        }
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
      breadcrumbs.push({
        id: index + 1, // O usa un ID adecuado
        name: segment,
        path: cumulativePath,
      });
    });

    this.breadcrumbs = breadcrumbs;
  }

  navigateFolder(path: string): void {
    // Generar el nuevo path. Si el currentPath es 'root' o vacío, se usa directamente el folder.name;
    // de lo contrario, se concatena al path actual.
    this.router.navigate(['/Dashboard/Home', path], {
      queryParams: { token: this.token },
    });
  }

  navigateBreadcrumbblank(folder: Folder) {
    const newPath =
      folder.path && folder.path !== ''
        ? ['/Dashboard/Home', folder.path]
        : ['/Dashboard/Home'];
    this.router.navigate(newPath, { queryParams: { token: this.token } });
  }
  navigateBreadcrumb(event: MouseEvent, folder: Folder): void {
    if (event.button === 0) {
      // Click izquierdo → Navegar en la misma pestaña
      event.preventDefault();
      this.router.navigate(this.getCrumbPath(folder), {
        queryParams: { token: this.token },
      });
    }
  }
  getCrumbPath(folder: Folder): any[] {
    return folder.path ? ['/Dashboard/Home', folder.path] : ['/Dashboard/Home'];
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
  toggleIsOpenUpload() {
    this.isOpenUpload = !this.isOpenUpload;
  }
  toggleIsOpenNewFolder() {
    this.isOpenNewFolder = !this.isOpenNewFolder;
  }
  updatefoldersfiles(data: { files: FileModel[]; folder: Folder }) {
    console.log('LLEGA A LAYOUT:', data);
    if (data.files) {
      this.files = [...this.files, ...data.files];
    }
    if (data.folder) {
      this.folders = [...this.folders, data.folder];
    }
    //this.folders = [...this.folders, data.folders];
  }
  selectPaths(files: FileModel[]) {
    this.selectedFiles = files;
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
  deletefiles() {
    const paths = this.selectedFiles.map((file) => file.path);
    this.delete(paths);
  }
  compartir(data: { folder: Folder; userId: number, accessType: string }) {
    this.isLoader = true;
    this.foldersService
      .shared(data.folder.name,data.folder.path, data.userId, data.accessType)
      .subscribe({
        next: (response) => {
          this.isLoader = false;
          this.Toast.fire({
            icon: 'success',
            title: `Carpeta Compartida: ${data.folder.name}`,
          });
        },
        error: (error) => {
          this.isLoader = false;
          this.Toast.fire({
            icon: 'error',
            title: `Error al Compartida: ${data.folder.name}`,
          });
          console.error('Error al compartir:', error);
        },
      });
  }
  renamefile(data: {folder:Folder, newName: string}){
    this.filesService.rename(data.folder.path, data.newName, this.usuario?.id).subscribe({
      next: (res) =>{
        this.Toast.fire({
          icon: 'success',
          title: 'Se renombro correctamente',
        });
        this.loadFolderContents();
      },
      error: (err) =>{
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
        this.isOpenHistorial = false; 
        this.isLoader = false;
        this.Toast.fire({
          icon: 'error',
          title: 'Error al obtener historial',
        });
      }
    })
  }
}
