import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { NotificationComponent } from './components/notification/notification.component';

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    NotificationComponent // Register the Notification Component
  ],
  providers: [],
  bootstrap: [/* Your main component */]
})
export class AppModule {}
