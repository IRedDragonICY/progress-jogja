import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { snap } from '@/lib/midtrans';
import { v4 as uuidv4 } from 'uuid';
import type { CartItem, OrderItem } from '@/types/supabase';

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { cartItems, checkoutData } = await req.json();

  if (!cartItems || cartItems.length === 0 || !checkoutData) {
    return NextResponse.json({ error: 'Invalid checkout data' }, { status: 400 });
  }

  const orderId = `PJ-${uuidv4()}`;
  let totalAmount = 0;
  const orderItems: OrderItem[] = cartItems.map((item: CartItem) => {
    const itemTotal = item.products.price * item.quantity;
    totalAmount += itemTotal;
    return {
      product_id: item.products.id,
      name: item.products.name,
      price: item.products.price,
      quantity: item.quantity,
      image_url: item.products.image_urls[0] || null,
    };
  });

  const { data: newOrder, error: orderError } = await supabase
    .from('orders')
    .insert({
      id: orderId,
      user_id: user.id,
      order_items: orderItems,
      total_amount: totalAmount,
      status: 'pending',
      shipping_address: {
        recipient_name: checkoutData.nama,
        recipient_phone: checkoutData.telepon,
        full_address: checkoutData.alamat,
      },
      payment_method: checkoutData.metodePembayaran,
    })
    .select()
    .single();

  if (orderError) {
    console.error('Error creating order:', orderError);
    return NextResponse.json({ error: 'Could not create order' }, { status: 500 });
  }

  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: totalAmount,
    },
    customer_details: {
      first_name: checkoutData.nama,
      email: user.email,
      phone: checkoutData.telepon,
      shipping_address: {
        first_name: checkoutData.nama,
        address: checkoutData.alamat,
        phone: checkoutData.telepon,
      }
    },
    item_details: orderItems.map(item => ({
      id: item.product_id,
      price: item.price,
      quantity: item.quantity,
      name: item.name,
    })),
  };

  try {
    const transaction = await snap.createTransaction(parameter);

    await supabase
      .from('orders')
      .update({
        midtrans_snap_token: transaction.token,
        midtrans_snap_redirect_url: transaction.redirect_url,
      })
      .eq('id', orderId);

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Midtrans error:', error);
    await supabase.from('orders').delete().eq('id', orderId);
    return NextResponse.json({ error: 'Failed to create payment transaction' }, { status: 500 });
  }
}