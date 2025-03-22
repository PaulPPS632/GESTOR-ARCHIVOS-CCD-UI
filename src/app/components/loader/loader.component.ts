import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';

@Component({
  selector: 'app-loader',
  imports: [],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.css',
})
export class LoaderComponent implements OnChanges{
  @Input() isOpen: boolean = true;
  @Output() isOpenChange = new EventEmitter<boolean>();
  @ViewChild('loader') loader?: ElementRef;
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.loader) return;
    if (this.isOpen) {
      this.loader.nativeElement.showModal();
    } else {
      this.loader.nativeElement.close();
    }
  }
  close(): void {
    this.isOpen = false;
    this.isOpenChange.emit(this.isOpen);
  }
}
