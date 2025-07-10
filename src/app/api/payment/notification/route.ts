import { NextRequest, NextResponse } from 'next/server';
import { coreApi } from '@/lib/midtrans';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const notificationJson = await req.json();
    const statusResponse = await coreApi.transaction.notification(notificationJson);

    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    let newStatus: 'pending' | 'paid' | 'cancelled' | 'failed' = 'pending';

    if (transactionStatus == 'capture') {
      if (fraudStatus == 'accept') {
        newStatus = 'paid';
      }
    } else if (transactionStatus == 'settlement') {
      newStatus = 'paid';
    } else if (transactionStatus == 'cancel' || transactionStatus == 'expire') {
      newStatus = 'cancelled';
    } else if (transactionStatus == 'deny') {
      newStatus = 'failed';
    }

    const { error } = await supabaseAdmin
      .from('orders')
      .update({
        status: newStatus,
        midtrans_transaction_id: statusResponse.transaction_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) {
      console.error('Failed to update order status:', error);
      return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
    }

    // If payment is successful, clear the user's cart
    if (newStatus === 'paid') {
        const { data: order } = await supabaseAdmin.from('orders').select('user_id').eq('id', orderId).single();
        if (order) {
            await supabaseAdmin.from('cart_items').delete().eq('user_id', order.user_id);
        }
    }

    return NextResponse.json({ message: 'Notification received successfully' }, { status: 200 });

  } catch (error) {
    console.error('Midtrans notification error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}