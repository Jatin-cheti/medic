import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Notifications</h1>
        <p>Manage your notification preferences</p>
      </div>
      <div class="coming-soon">
        <div class="icon">🔔</div>
        <h2>Coming Soon</h2>
        <p>This feature is under development</p>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .page-header {
      margin-bottom: 32px;
      h1 {
        font-size: 32px;
        font-weight: 700;
        color: #1f2937;
        margin: 0 0 8px;
      }
      p {
        color: #6b7280;
        font-size: 16px;
        margin: 0;
      }
    }
    .coming-soon {
      text-align: center;
      padding: 80px 24px;
      .icon {
        font-size: 80px;
        margin-bottom: 24px;
      }
      h2 {
        font-size: 28px;
        font-weight: 700;
        color: #1f2937;
        margin: 0 0 12px;
      }
      p {
        color: #6b7280;
        font-size: 16px;
      }
    }
  `]
})
export class NotificationsComponent {}
