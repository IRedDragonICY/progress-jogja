// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import midtransClient from 'midtrans-client';

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
const serverKey = process.env.MIDTRANS_SERVER_KEY!;
const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!;

export const snap = new midtransClient.Snap({
  isProduction: isProduction,
  serverKey: serverKey,
  clientKey: clientKey,
});

export const coreApi = new midtransClient.CoreApi({
  isProduction: isProduction,
  serverKey: serverKey,
  clientKey: clientKey,
});