import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard.component',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    // Redirect to home which has the actual dashboard logic
    this.router.navigate(['/home'], { replaceUrl: true });
  }
}
