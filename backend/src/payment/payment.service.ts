import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Payment } from './payment.schema';
import { Model } from 'mongoose';
// import { rp1 } from 'src/config/razorpay-config';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/user/user.schema';
const Razorpay = require('razorpay');

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    @InjectModel(User.name) private userModel: Model<User>,

    private configService: ConfigService,
  ) {}
  rp1 = new Razorpay({
    key_id: this.configService.get('RAZORPAY_KEY_ID'),
    key_secret: this.configService.get('RAZORPAY_KEY_SECRET'),
  });
  async initialOrders(body) {
    const options = body;
    const orders = await this.rp1.orders.create(options);

    if (!orders) {
      throw new BadRequestException('Failed to place order. Bad request');
    }
    console.log(orders);
    return orders;
  }

  async validateRazPayment(body, userId) {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;

    const sha = crypto.createHmac(
      'sha256',
      this.configService.get('RAZORPAY_KEY_SECRET'),
    );

    sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = sha.digest('hex');

    if (digest !== razorpay_signature) {
      throw new BadRequestException({
        message: 'Transaction not legit',
        isValid: false,
      });
    }

    // update user record
    const user = await this.userModel.findById(userId);
    const payment = {
      paymentId: razorpay_payment_id,
      noOfCredits: 100,
      userId: user._id,
      userEmail: user.email,
      platform: 'razorpay',
    };
    const newPayment = new this.paymentModel(payment);
    const savedPayment = await newPayment.save();

    // update credits
    const newCredit = user?.totalAiCredits ? user?.totalAiCredits + 100 : 100;
    await this.userModel.findByIdAndUpdate(
      user._id,
      { totalAiCredits: newCredit },
      { new: true },
    );

    return {
      message: 'Transaction is legit',
      orderId: razorpay_order_id,
      isValid: true,
      savedPayment: savedPayment,
    };
  }
}
