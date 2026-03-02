import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-error-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-error.component.html',
  styleUrls: ['./app-error.component.scss']
})
export class AppErrorComponent {
  @Input() message = '';
  @Input() dismissible = true;
  @Output() dismissed = new EventEmitter<void>();

  onDismiss() {
    this.dismissed.emit();
  }
}
