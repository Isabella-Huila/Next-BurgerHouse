import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import qs from 'qs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.text();
    
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY}`
    };

    const stripeResponse = await axios.post(
      'https://api.stripe.com/v1/checkout/sessions',
      formData,
      { headers }
    );

    return NextResponse.json(stripeResponse.data);
  } catch (err: any) {
    console.error('Stripe API error:', err.response?.data || err.message);
    return NextResponse.json(
      { error: 'Error creating checkout session', details: err.response?.data || err.message },
      { status: err.response?.status || 500 }
    );
  }
}