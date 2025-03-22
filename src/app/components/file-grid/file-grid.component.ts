import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FileModel, Folder, Usuario } from '../../interfaces/types';
import { FileiconComponent } from "../fileicon/fileicon.component";
import { CommonModule } from '@angular/common';
import { ModalComponent } from "../modal/modal.component";
import { SelectSearchComponent } from "../select-search/select-search.component";
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-file-grid',
  imports: [FileiconComponent, CommonModule, ModalComponent, SelectSearchComponent, FormsModule],
  templateUrl: './file-grid.component.html',
  styleUrl: './file-grid.component.css'
})
export class FileGridComponent {

  @Input() Files: FileModel[] = [];
  @Input() Folders: Folder[]=[];
  @Input() accessTypeUser: string = 'lector';
  @Output() navigateFolder = new EventEmitter<Folder>();
  @Output() selectedFilesChange = new EventEmitter<FileModel[]>();
  @Output() sharedFolder = new EventEmitter<{folder: Folder, userId: number, accessType: string}>();
  @Output() renameFolder = new EventEmitter<{folder: Folder, newName: string}>();
  @Output() deletefile = new EventEmitter<string[]>();
  authService = inject(AuthService);
  showContextMenu: boolean = false;
  contextMenuX: number = 0;
  contextMenuY: number = 0;

  selectedItem: any = {
    name: '',
    path: ''
  };
  usuarios: Usuario[]=[];
  usuarioSelectedShare: Usuario | null = null;
  accessType: string = 'lector';
  selectedPathslist: string[] = [];

  // Variables para el modal de renombrar
  newName: string = '';

  isOpenRename: boolean = false;
  isOpenShare: boolean = false;

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
  // Captura el evento de clic derecho
  onRightClick(event: MouseEvent, item: any) {
    event.preventDefault(); // Evita que aparezca el menú del navegador

    this.showContextMenu = true;
    this.contextMenuX = event.clientX;
    this.contextMenuY = event.clientY;
    this.selectedItem = item;
  }

  // Cierra el menú contextual
  closeContextMenu() {
    this.showContextMenu = false;
  }

  // Acciones del menú
  renameItem() {
    this.isOpenRename = true;
    this.newName = this.selectedItem.name;
    this.closeContextMenu();
  }
  previewbyid(file: FileModel){
    window.open(file.url, '_blank');
  }
  copyurl(){
    navigator.clipboard.writeText(this.selectedItem.url);
    this.Toast.fire({
      icon: 'success',
      title: 'url copiada',
    });
    this.closeContextMenu();
  }
  preview(){
    window.open(this.selectedItem.url, '_blank');
    this.closeContextMenu();
  }
  deleteItem() {
    this.deletefile.emit([this.selectedItem.path])
    this.closeContextMenu();
  }
  shareFolder(){
    this.isOpenShare = true;
    this.authService.listar().subscribe((response) => {
      this.usuarios = response;
    });
    this.closeContextMenu();
  }
  TriggerNavigatefolder(folder: Folder){
    this.navigateFolder.emit(folder);
  }
  UsuarioSearch(searchFlow: string){
    this.authService.search(searchFlow).subscribe((res) => {
      this.usuarios = res;
    });
  }

  UsuarioSelect(id: number){
    //this.NewAsignacion.flow = this.flows.find((flow) => flow.id == id);
    const selected = this.usuarios.find((user) => user.id == id)!;
    this.usuarioSelectedShare = selected;
  }
  Compartir(){
    if(this.usuarioSelectedShare!.id){
      this.sharedFolder.emit({
        folder: this.selectedItem,
        userId: this.usuarioSelectedShare!.id,
        accessType: this.accessType 
      })
      this.isOpenShare = false;
    }
  }
  rename(){
    this.renameFolder.emit({folder:this.selectedItem, newName: this.newName});
    this.isOpenRename = false;
  }
  /*
  select(path: string){
    this.selectedPathslist = this.selectedPathslist.includes(path)
    ? this.selectedPathslist.filter(p => p !== path) // Elimina si ya está
    : [...this.selectedPathslist, path]; // Agrega si no está

    this.selectedpaths.emit(this.selectedPathslist);
  }*/

  // ------------------------------------------------------------
  isSelecting = false;
  selectionBox = { x: 0, y: 0, width: 0, height: 0 };
  selectedFiles: FileModel[] = [];
  lastSelectedIndex: number | null = null;
  preSelection: FileModel[] = [];
  startX = 0;
  startY = 0;
  select(file: FileModel, index: number, event: MouseEvent) {
    if (event.shiftKey && this.lastSelectedIndex !== null) {
      // ✅ Selección en rango (Shift + Click)
      const min = Math.min(this.lastSelectedIndex, index);
      const max = Math.max(this.lastSelectedIndex, index);
      const range = this.Files.slice(min, max + 1);

      this.selectedFiles = [...new Set([...this.selectedFiles, ...range])];
    } else if (event.ctrlKey || event.metaKey) {
      // ✅ Selección múltiple con Ctrl (o Cmd en Mac)
      if (this.selectedFiles.some(f => f.id === file.id)) {
        this.selectedFiles = this.selectedFiles.filter(f => f.id !== file.id);
      } else {
        this.selectedFiles = [...this.selectedFiles, file];
      }
    } else {
      // ✅ Selección normal (Click simple)
      this.selectedFiles = this.selectedFiles.includes(file)
    ? this.selectedFiles.filter(p => p.id !== file.id) // Elimina si ya está
    : [...this.selectedFiles, file]
      //this.selectedFiles = [file];
    }

    this.lastSelectedIndex = index;
    this.selectedFilesChange.emit(this.selectedFiles);
  }


  
  startSelection(event: MouseEvent) {
    this.isSelecting = true;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.selectionBox = { x: this.startX, y: this.startY, width: 0, height: 0 };
    this.preSelection = [...this.selectedFiles];
  }
  
  updateSelection(event: MouseEvent) {
    if (!this.isSelecting) return;

    const endX = event.clientX;
    const endY = event.clientY;

    this.selectionBox = {
      x: Math.min(this.startX, endX),
      y: Math.min(this.startY, endY),
      width: Math.abs(endX - this.startX),
      height: Math.abs(endY - this.startY),
    };
  }
  
  endSelection() {
    //if (!this.isSelecting) return;
    this.isSelecting = false;
    this.checkFilesInSelection();
  }
  checkFilesInSelection() {
    let flag = false;
    const newSelectedFiles = this.Files.filter(file => {
      const element = document.getElementById(`file-${file.id}`);
      if (!element) return false;

      const rect = element.getBoundingClientRect();
      
      return (
        rect.left >= this.selectionBox.x &&
        rect.top >= this.selectionBox.y &&
        rect.right <= this.selectionBox.x + this.selectionBox.width &&
        rect.bottom <= this.selectionBox.y + this.selectionBox.height
      )
    });

    // ✅ Combina la selección previa con la nueva
    //'si selecciona un file hace [...new Set([...this.preSelection, ...newSelectedFiles])], sino selecciona un file es decir afuera del file entonces this.selectedFiles = newSelectedFiles;

    if (this.selectionBox.width == 0 || this.selectionBox.height == 0 ) {
      this.selectedFiles = [...this.preSelection];
    } else {
      this.selectedFiles = [...new Set([...this.preSelection, ...newSelectedFiles])];
    }
    this.selectedFilesChange.emit(this.selectedFiles);
  }
}
