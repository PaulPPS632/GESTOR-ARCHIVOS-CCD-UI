import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FileModel, Folder } from '../../interfaces/types';
import { FileiconComponent } from "../fileicon/fileicon.component";
import { CommonModule } from '@angular/common';
import { ModalComponent } from "../modal/modal.component";
@Component({
  selector: 'app-file-grid',
  imports: [FileiconComponent, CommonModule, ModalComponent],
  templateUrl: './file-grid.component.html',
  styleUrl: './file-grid.component.css'
})
export class FileGridComponent {

  @Input() Files: FileModel[] | null = [];
  @Input() Folders: Folder[]=[];
  @Output() navigateFolder = new EventEmitter<Folder>();

  showContextMenu: boolean = false;
  contextMenuX: number = 0;
  contextMenuY: number = 0;

  selectedItem: any = null;

  isOpenRename: boolean = false;
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
    alert(`Renombrar: ${this.selectedItem.name}`);
    this.closeContextMenu();
  }
  previewbyid(file: FileModel){
    window.open(file.url, '_blank');
  }
  preview(){
    window.open(this.selectedItem.url, '_blank');
    this.closeContextMenu();
  }
  deleteItem() {
    alert(`Eliminar: ${this.selectedItem.name}`);
    this.closeContextMenu();
  }
  TriggerNavigatefolder(folder: Folder){
    console.log(folder);
    this.navigateFolder.emit(folder);
  }
}
