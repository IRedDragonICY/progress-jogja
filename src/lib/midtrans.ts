// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import midtransClient from 'midtrans-client';

const isProduction = process.env.NODE_ENV === 'production';
const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '';

if (!serverKey || !clientKey) {
  if (isProduction) {
    throw new Error('Midtrans server key or client key is not set in environment variables.');
  }
  console.warn('Midtrans keys are not set. Payment functionality will not work.');
}

export const snap = new midtransClient.Snap({
  isProduction,
  serverKey,
  clientKey,
});

export const coreApi = new midtransClient.CoreApi({
  isProduction,
  serverKey,
  clientKey,
});