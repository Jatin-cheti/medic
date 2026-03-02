import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  template: ''
})
export class EditProfileComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    // Redirect to profile component where editing is done
    this.router.navigate(['/profile'], { replaceUrl: true });
  }
}
