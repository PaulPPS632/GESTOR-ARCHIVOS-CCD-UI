import { ChangeDetectorRef, Component, inject, Input, OnInit } from '@angular/core';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { FileModel, Folder } from '../../../interfaces/types';
import { FileGridComponent } from '../../../components/file-grid/file-grid.component';
import { FileListComponent } from '../../../components/file-list/file-list.component';
import { FoldersService } from '../../../services/folders.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BehaviorSubject, combineLatest,} from 'rxjs';
import { FilesService } from '../../../services/files.service';
import { ModalComponent } from "../../../components/modal/modal.component";
import { UploadComponent } from "../../../components/upload/upload.component";

@Component({
  selector: 'app-layout',
  imports: [
    SidebarComponent,
    CommonModule,
    FileGridComponent,
    FileListComponent,
    RouterLink,
    UploadComponent
],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent implements OnInit{
  @Input('path') path: string = '';
  foldersService = inject(FoldersService);
  filesService = inject(FilesService);
  route = inject(ActivatedRoute)
  router = inject(Router);
  cdr = inject(ChangeDetectorRef)
  currentPath: string = '';
  breadcrumbs: Folder[] = [];
  files: FileModel[] = [];
  folders: Folder[] = [];

  token?: string;
  Selected: boolean = true;
  isGridView: boolean = true;
  
  isOpenUpload: boolean = false;
  isOpenNewFolder: boolean = false;

  rename(value: string): void {
    console.log('Realizando búsqueda con:', value);
    // Aquí llamarías al servicio para buscar archivos
  }
  ngOnInit(): void {
    combineLatest([this.route.paramMap, this.route.queryParamMap]).subscribe(([params, queryParams]) => {
      this.currentPath = params.get('path') || '';
      this.token = queryParams.get('token') || undefined;
      this.loadFolderContents();
    });
  }

  loadFolderContents(): void {
    this.foldersService.getFolderContents(this.currentPath, this.token).subscribe(response => {
      if(response.success && response.data) {
        this.folders = response.data.folders;
        console.log(this.folders)
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
    const breadcrumbs: Folder[] = [{
      id: 0,
      name: 'root',
      path: ''
    }];
  
    // Si currentPath está vacío, solo muestra el root
    if (!this.currentPath || this.currentPath.trim() === '') {
      this.breadcrumbs = breadcrumbs;
      return;
    }
  
    // Elimina barras iniciales y divide en segmentos
    const segments = this.currentPath.split('/').filter(segment => segment.trim() !== '');
    let cumulativePath = '';
  
    segments.forEach((segment, index) => {
      // Acumula el path con "/" solo cuando no es el primer segmento
      cumulativePath += (cumulativePath ? '/' : '') + segment;
      breadcrumbs.push({
        id: index + 1, // O usa un ID adecuado
        name: segment,
        path: cumulativePath
      });
    });
  
    this.breadcrumbs = breadcrumbs;
  }

  navigateFolder(folder: Folder): void {
    // Generar el nuevo path. Si el currentPath es 'root' o vacío, se usa directamente el folder.name;
    // de lo contrario, se concatena al path actual.
    const newPath = this.currentPath === 'root' || this.currentPath === '' ? folder.name : `${this.currentPath}/${folder.name}`;
    this.router.navigate(['/files', newPath], { queryParams: { token: this.token } });
  }

  
  navigateBreadcrumbblank(folder: Folder) {
    const newPath = folder.path && folder.path !== '' ? ['/files', folder.path] : ['/files'];
    this.router.navigate(newPath, { queryParams: { token: this.token } });
  }
  navigateBreadcrumb(event: MouseEvent, folder: Folder): void {
    if (event.button === 0) { 
      // Click izquierdo → Navegar en la misma pestaña
      event.preventDefault();
      this.router.navigate(this.getCrumbPath(folder), { queryParams: { token: this.token } });
    }
  }
  getCrumbPath(folder: Folder): any[] {
    return folder.path ? ['/files', folder.path] : ['/files'];
  }
  search(event: Event) {
    const packageName = (event.target as HTMLInputElement).value;
    if(packageName === '') {this.loadFolderContents(); return}
    this.filesService.searchFiles(packageName).subscribe((res)=>{
      this.files = res;
      this.folders = [];
    })
  }
  toggleIsOpenUpload(){
    this.isOpenUpload = !this.isOpenUpload;
  }
  toggleIsOpenNewFolder(){
    this.isOpenNewFolder = !this.isOpenNewFolder;
  }
  updatefoldersfiles(data: {files: FileModel[], folders: Folder}){
    console.log('LLEGA A LAYOUT:',data)
    this.files = [...this.files, ...data.files];
    this.folders = [...this.folders, data.folders];
  }
}
