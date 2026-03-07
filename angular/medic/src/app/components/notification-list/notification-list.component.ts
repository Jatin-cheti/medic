import { Component, OnInit } from '@angular/core';
import { NotificationService, Notification } from '../../services/notification.service';
import { fadeInAnimation } from '../../animations/fade-in.animation'; // Import your fade-in animation

@Component({
  selector: 'app-notification-list',
  standalone: true,
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss'],
  animations: [fadeInAnimation]
})
export class NotificationListComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.getNotifications().subscribe(
      (data) => {
        this.notifications = data;
      },
      (error) => {
        console.error('Error fetching notifications', error);
      }
    );
  }
}
