import { Component, OnInit } from '@angular/core';
import { NotificationService, Notification } from '../../services/notification.service';
import { fadeInAnimation } from '../../animations/fade-in.animation'; // Import your fade-in animation

@Component({
  selector: 'app-notification',
  standalone: true,
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  animations: [fadeInAnimation]
})
export class NotificationComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.getNotifications().subscribe((data) => {
      this.notifications = data;
    });
  }
}
