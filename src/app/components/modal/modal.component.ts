import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
})
export class ModalComponent implements OnChanges{
  @Input() isOpen: boolean = false;
  @Input() title: string = 'Mensajes enviados';
  @Output() isOpenChange = new EventEmitter<boolean>();
  @ViewChild('modal') modal?: ElementRef;
  ngOnChanges(changes: SimpleChanges): void {
    if(!this.modal) return;
    if(this.isOpen){
      this.modal.nativeElement.showModal()
    }else{
      this.modal.nativeElement.close()
    }
  }
  close(): void {
    this.isOpen = false;
    this.isOpenChange.emit(this.isOpen);
  }
}
