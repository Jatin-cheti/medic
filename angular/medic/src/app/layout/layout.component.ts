import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="app-layout">
      <!-- Permanent Left Sidebar -->
      <app-sidebar class="app-sidebar"></app-sidebar>

      <!-- Main Content Area (Navbar + Content) -->
      <div class="main-wrapper">
        <app-navbar class="app-navbar"></app-navbar>

        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
      background: var(--background);
    }

    .app-sidebar {
      width: 280px;
      position: fixed;
      left: 0;
      top: 0;
      height: 100vh;
      z-index: 1000;
    }

    .main-wrapper {
      flex: 1;
      margin-left: 280px;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .app-navbar {
      position: sticky;
      top: 0;
      z-index: 999;
    }

    .main-content {
      flex: 1;
      padding: 0;
      background: var(--background);
    }

    @media (max-width: 768px) {
      .app-sidebar {
        width: 240px;
      }

      .main-wrapper {
        margin-left: 240px;
      }
    }

    @media (max-width: 576px) {
      .app-sidebar {
        width: 100%;
        transform: translateX(-100%);
        transition: transform 0.3s ease;
      }

      .main-wrapper {
        margin-left: 0;
      }

      .app-layout.sidebar-open .app-sidebar {
        transform: translateX(0);
      }
    }
  `]
})
export class LayoutComponent {
  // No need for sidebar toggle state anymore - it's permanent on desktop
}
