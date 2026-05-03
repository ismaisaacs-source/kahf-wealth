import { Injectable } from "@nestjs/common";

@Injectable()
export class NotificationsService {
  listNotifications() {
    return [
      {
        id: "notif-1",
        title: "Zakat reminder ready",
        body: "Your next lunar-cycle check-in is approaching.",
      },
    ];
  }
}
