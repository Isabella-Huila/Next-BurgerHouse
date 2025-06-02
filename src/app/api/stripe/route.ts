import { NextRequest, NextResponse } from 'next/server';
import { Product } from '../../../lib/types/product.types';

export async function POST(req: NextRequest) {
    try {
        const public_key = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;
        const secret_key = process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY;

        const data = {
            'line_items[0][quantity]': ,
            'line_items[0][price_data][currency]': 'cop',
            'line_items[0][price_data][product_data][name]': ,
            'line_items[0][price_data][unit_amount]':  * 100,
            'payment_method_types[0]': 'card',
            mode: 'payment',
            success_url: `${requesturl}/buy/success`,
            cancel_url: `requestUrl/cart`,
            'metadata[userId]': user.id,
            'metadata[productIds]': JSON.stringify(productIds), // ← Aquí serializas el array
            'metadata[address]': address, // ← Aquí serializas el array
            'metadata[total]': total, // ← Aquí serializas el array


        };

        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        };

        try {
            const response: { data: { url: string } } = await axios.post(
                'https://api.stripe.com/v1/checkout/sessions',
                qs.stringify(data),
                { headers },
            );
            return response.data;
        } catch (error) {
            console.error('Error creating checkout session', error);
            throw error;
        }
        return NextResponse.json();
    } catch (err) {
        console.log(err)
        return NextResponse.json({ error: 'Upload failed', details: err }, { status: 500 });
    }
}

