import { Component} from '@angular/core';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [
    SidebarComponent,
    RouterOutlet
],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent{
  
}
