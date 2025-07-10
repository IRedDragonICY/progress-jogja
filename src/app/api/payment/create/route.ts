import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { snap } from '@/lib/midtrans';
import { v4 as uuidv4 } from 'uuid';
import type { CartItem, OrderItem } from '@/types/supabase';

export async function POST(req: NextRequest) {
  // ===================================================================
  // VVVV --- DEBUGGING LOGS --- VVVV
  console.log("\n--- [API /api/payment/create] INITIATING PAYMENT ---");
  console.log("1. SERVER-SIDE CHECK: Is Production? ->", process.env.MIDTRANS_IS_PRODUCTION);
  console.log("2. SERVER-SIDE CHECK: Server Key Used ->", process.env.MIDTRANS_SERVER_KEY);
  console.log("---------------------------------------------------\n");
  // ===================================================================

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
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

  const dbId = uuidv4();
  const displayId = `PJ-${uuidv4().slice(0, 13).toUpperCase()}`;
  let subtotalAmount = 0;

  const orderItems: OrderItem[] = cartItems.map((item: CartItem) => {
    const itemTotal = (item.products?.price || 0) * item.quantity;
    subtotalAmount += itemTotal;
    return {
      product_id: item.products.id,
      name: item.products.name,
      price: item.products.price,
      quantity: item.quantity,
      image_url: item.products.image_urls?.[0] || null,
    };
  });

  // Calculate PPN 10% and total
  const ppnAmount = subtotalAmount * 0.1;
  const totalAmount = subtotalAmount + ppnAmount;

  const { error: orderError } = await supabase
    .from('orders')
    .insert({
      id: dbId,
      display_id: displayId,
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
    console.error('Error creating order in Supabase:', orderError);
    return NextResponse.json({ error: 'Could not create order' }, { status: 500 });
  }

  const parameter = {
    transaction_details: {
      order_id: displayId,
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
    item_details: [
      ...orderItems.map(item => ({
        id: item.product_id,
        price: item.price,
        quantity: item.quantity,
        name: item.name,
      })),
      {
        id: 'PPN',
        price: ppnAmount,
        quantity: 1,
        name: 'PPN 10%',
      },
    ],
     credit_card: {
      secure: true,
    },
  };

  try {
    const transaction = await snap.createTransaction(parameter);

    await supabase
      .from('orders')
      .update({
        midtrans_snap_token: transaction.token,
        midtrans_snap_redirect_url: transaction.redirect_url,
      })
      .eq('id', dbId);

    return NextResponse.json(transaction);
  } catch (error: any) {
    console.error('Midtrans API Error:', error.message);
    await supabase.from('orders').delete().eq('id', dbId);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}