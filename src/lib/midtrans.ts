// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import midtransClient from 'midtrans-client';

const isProduction = process.env.NODE_ENV === 'production';
const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '';

if (isProduction && (!serverKey || !clientKey)) {
    throw new Error('Midtrans keys are not properly configured for production environment.');
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