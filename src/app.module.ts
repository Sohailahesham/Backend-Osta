import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TechnicianModule } from './technician/technician.module';
import { CategoriesModule } from './categories/categories.module';
import { ServicesModule } from './services/services.module';
import { AdminModule } from './admin/admin.module';
import { AssistantModule } from './assistant/assistant.module';
import { RequestModule } from './request/request.module';
import { EmergencyModule } from './emergency/emergency.module';
import { ReviewsModule } from './reviews/reviews.module';
import { PaymentModule } from './payment/payment.module';
import { ScheduleModule } from '@nestjs/schedule';
import { InvoiceModule } from './invoice/invoice.module';
import { WalletModule } from './wallet/wallet.module';
import { MaintenanceShopsModule } from './maintenance-shops/maintenance-shops.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    TechnicianModule,
    CategoriesModule,
    ServicesModule,
    AdminModule,
    AssistantModule,
    RequestModule,
    EmergencyModule,
    ReviewsModule,
    PaymentModule,
    InvoiceModule,
    WalletModule,
    MaintenanceShopsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
