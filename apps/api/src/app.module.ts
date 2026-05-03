import { Module } from "@nestjs/common";
import { AdminModule } from "./modules/admin/admin.module";
import { AssetsModule } from "./modules/assets/assets.module";
import { DocumentsModule } from "./modules/documents/documents.module";
import { EstateModule } from "./modules/estate/estate.module";
import { MethodologyModule } from "./modules/methodology/methodology.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { PreferencesModule } from "./modules/preferences/preferences.module";
import { ProfileModule } from "./modules/profile/profile.module";
import { ScreeningModule } from "./modules/screening/screening.module";
import { SubscriptionsModule } from "./modules/subscriptions/subscriptions.module";
import { ZakatModule } from "./modules/zakat/zakat.module";

@Module({
  imports: [
    ProfileModule,
    PreferencesModule,
    AssetsModule,
    ZakatModule,
    ScreeningModule,
    EstateModule,
    DocumentsModule,
    NotificationsModule,
    SubscriptionsModule,
    MethodologyModule,
    AdminModule,
  ],
})
export class AppModule {}
