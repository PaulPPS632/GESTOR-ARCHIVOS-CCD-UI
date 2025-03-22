import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-fileicon',
  imports: [CommonModule],
  templateUrl: './fileicon.component.html',
  styleUrl: './fileicon.component.css'
})
export class FileiconComponent {
  @Input() fileType: string = '';
  @Input() customClass: string = '';
  getFileIcon(): string {
    if (this.fileType === 'folder') return 'folder-icon';
    if (this.fileType.includes('image/')) return 'image-icon';
    if (this.fileType.includes('video/')) return 'video-icon';
    if (this.fileType.includes('audio/')) return 'audio-icon';
    if (this.fileType.includes('spreadsheet') || this.fileType.includes('excel')) return 'spreadsheet-icon';
    if (this.fileType.includes('html') || this.fileType.includes('javascript') || this.fileType.includes('css')) return 'code-icon';
    if (this.fileType.includes('pdf') || this.fileType.includes('document') || this.fileType.includes('text')) return 'document-icon';
    if (this.fileType.includes('zip') || this.fileType.includes('rar') || this.fileType.includes('tar')) return 'archive-icon';
    if (this.fileType.includes('x-sql')) return 'x-sql';
    return 'unknown-icon';
  }
}
