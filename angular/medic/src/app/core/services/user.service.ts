import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserInfo {
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userInfoSubject = new BehaviorSubject<UserInfo>({
    name: 'Patient',
    email: '',
    role: 'Patient',
    avatar: ''
  });

  public userInfo$: Observable<UserInfo> = this.userInfoSubject.asObservable();

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const firstName = localStorage.getItem('firstName') || '';
    const lastName = localStorage.getItem('lastName') || '';
    const email = localStorage.getItem('userEmail') || '';
    const userName = localStorage.getItem('userName') || '';
    const avatar = localStorage.getItem('userAvatar') || '';

    let name = 'Patient';
    if (firstName && lastName) {
      name = `${firstName} ${lastName}`.trim();
    } else if (userName) {
      name = userName;
    } else if (firstName) {
      name = firstName;
    }

    this.userInfoSubject.next({
      name,
      email,
      role: 'Patient',
      avatar
    });
  }

  setUserInfo(firstName: string, lastName: string, email: string, avatar: string = ''): void {
    let name = 'Patient';
    if (firstName && lastName) {
      name = `${firstName} ${lastName}`.trim();
    } else if (firstName) {
      name = firstName;
    }

    const userInfo: UserInfo = {
      name,
      email,
      role: 'Patient',
      avatar: avatar || ''
    };

    this.userInfoSubject.next(userInfo);

    // Also store in localStorage
    if (firstName) localStorage.setItem('firstName', firstName);
    if (lastName) localStorage.setItem('lastName', lastName);
    if (email) localStorage.setItem('userEmail', email);
    if (avatar) {
      localStorage.setItem('userAvatar', avatar);
    } else {
      localStorage.removeItem('userAvatar');
    }
  }

  getUserInfo(): UserInfo {
    return this.userInfoSubject.value;
  }

  clearUserInfo(): void {
    this.userInfoSubject.next({
      name: 'Patient',
      email: '',
      role: 'Patient',
      avatar: ''
    });
  }
}
