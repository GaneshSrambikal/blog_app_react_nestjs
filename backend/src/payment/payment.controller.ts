import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/shared/decorators/get-user.decorator';
import { User } from 'src/user/user.schema';

@Controller('/api/payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('/razorpay/orders')
  @UseGuards(JwtAuthGuard)
  async initialOrders(@Body() body: any) {
    return await this.paymentService.initialOrders(body);
  }

  @Post('/razorpay/validate')
  @UseGuards(JwtAuthGuard)
  async validateRazPayment(@Body() body: any, @GetUser() user: User) {
    return await this.paymentService.validateRazPayment(body, user.id);
  }
}
