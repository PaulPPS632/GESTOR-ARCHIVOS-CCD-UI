import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-select-search',
  imports: [CommonModule, RouterLink],
  templateUrl: './select-search.component.html',
  styleUrl: './select-search.component.css'
})
export class SelectSearchComponent implements OnInit {
  @Input() lista: any[] = [];
  @Input() title: string = '';
  @Input() rutacreate: string = '';
  @Input() Tipo: string = 'producto';
  @Input() withLabel: boolean = true;

  @Output() emitterSelectedValue = new EventEmitter<number>();
  @Output() emitterSearchText = new EventEmitter<string>();
  @ViewChild('busqueda', { static: true }) inputBusqueda!: ElementRef;

  SearchText: string = 'INGRENSA NUEVA CONSULTA';
  @Input() SelectedText: string = 'BUSCADOR';

  SelectedValue: number = 0;

  flagbusqueda: boolean;
  inicial = true;

  private debounceTimer: any;
  constructor() {
    this.flagbusqueda = false;
  }
  ngOnInit(): void {
    console.log(this.title,this.lista);
    if (this.SelectedText == 'null | null') {
      this.SelectedText = 'BUSCADOR';
    }
  }

  onBusquedaChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const selectedText = inputElement.value.toLowerCase();
    this.SearchText = selectedText;
    //this.emitterSearchText.emit(this.SearchText);

    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.emitterSearchText.emit(this.SearchText);
    }, 300); // 300 ms de espera antes de emitir
  }

  tooglebusqueda() {
    this.flagbusqueda = !this.flagbusqueda;
    if (this.inicial) {
      this.inicial = false;
    }
  }
  seleccionar(event: Event, id: string) {
    const selectedElement = event.target as HTMLElement;
    const selectedText = selectedElement.innerText;

    if (this.inputBusqueda) {
      this.inputBusqueda.nativeElement.value = '';
    }
    this.tooglebusqueda();

    const selected = this.lista.find((p: any) => p.id === id) || null;

    
    this.SelectedText = selectedText;
    if (selected) {
      this.SelectedValue = selected.id; 
      this.emitterSelectedValue.emit(this.SelectedValue);
    }
  }
}
