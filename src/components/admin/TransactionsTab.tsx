import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';
import { getOrders, updateOrderStatus } from '@/lib/supabase';
import type { Order, OrderStatus } from '@/types/supabase';
import {
  XMarkIcon,
  ChevronDownIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

const statusStyles: { [key in OrderStatus]: string } = {
  pending: 'bg-yellow-800/50 border-yellow-700/50 text-yellow-300',
  paid: 'bg-blue-800/50 border-blue-700/50 text-blue-300',
  processing: 'bg-purple-800/50 border-purple-700/50 text-purple-300',
  shipped: 'bg-cyan-800/50 border-cyan-700/50 text-cyan-300',
  completed: 'bg-green-800/50 border-green-700/50 text-green-300',
  cancelled: 'bg-red-800/50 border-red-700/50 text-red-300',
  failed: 'bg-red-900/50 border-red-800/50 text-red-400',
};

const StatusBadge = ({ status }: { status: OrderStatus }) => (
  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusStyles[status]}`}>
    {status}
  </span>
);

const OrderDetailsDialog = ({
  order,
  isOpen,
  onClose,
  onStatusUpdate
}: {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: () => void;
}) => {
  const [newStatus, setNewStatus] = useState<OrderStatus | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [provider, setProvider] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (order) {
      setNewStatus(order.status);
      setTrackingNumber(order.shipping_tracking_number || '');
      setProvider(order.shipping_provider || '');
    }
  }, [order]);

  if (!order) return null;

  const handleSave = async () => {
    if (!newStatus) return;
    setIsSaving(true);
    await updateOrderStatus(order.id, newStatus, provider, trackingNumber);
    setIsSaving(false);
    onStatusUpdate();
    onClose();
  };

  const availableStatuses: OrderStatus[] = ['paid', 'processing', 'shipped', 'completed', 'cancelled'];

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-slate-800 rounded-2xl p-6 z-50 border border-slate-700">
          <Dialog.Title className="text-xl font-bold mb-4">Order #{order.id.slice(0, 8)}</Dialog.Title>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Items</h4>
              {order.order_items.map(item => (
                <div key={item.product_id}>{item.name} x {item.quantity}</div>
              ))}
            </div>
            <div>
              <h4 className="font-semibold">Status</h4>
              <Select.Root value={newStatus || ''} onValueChange={(val) => setNewStatus(val as OrderStatus)}>
                <Select.Trigger className="input-field w-full mt-1">
                  <Select.Value />
                  <Select.Icon><ChevronDownIcon className="w-4 h-4" /></Select.Icon>
                </Select.Trigger>
                <Select.Content className="bg-slate-700 border border-slate-600 rounded-lg p-1 z-[60]">
                    {availableStatuses.map(status => (
                        <Select.Item key={status} value={status} className="px-3 py-1 rounded hover:bg-slate-600 cursor-pointer flex items-center justify-between">
                            {status}
                             <Select.ItemIndicator><CheckIcon className="w-4 h-4"/></Select.ItemIndicator>
                        </Select.Item>
                    ))}
                </Select.Content>
              </Select.Root>
            </div>
            {newStatus === 'shipped' && (
              <>
                <input type="text" value={provider} onChange={e => setProvider(e.target.value)} placeholder="Shipping Provider" className="input-field w-full" />
                <input type="text" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} placeholder="Tracking Number" className="input-field w-full" />
              </>
            )}
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={onClose} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={isSaving} className="btn-primary">
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
          <Dialog.Close asChild>
            <button className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-700"><XMarkIcon className="w-5 h-5"/></button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export function TransactionsTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    const allOrders = await getOrders();
    setOrders(allOrders);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <div className="p-8">Loading transactions...</div>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">All Transactions</h2>
      <div className="bg-slate-800/40 rounded-xl border border-slate-700/50">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="p-4 text-left text-sm font-semibold">Order ID</th>
              <th className="p-4 text-left text-sm font-semibold">Date</th>
              <th className="p-4 text-left text-sm font-semibold">User</th>
              <th className="p-4 text-right text-sm font-semibold">Total</th>
              <th className="p-4 text-center text-sm font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} onClick={() => setSelectedOrder(order)} className="hover:bg-slate-700/50 cursor-pointer">
                <td className="p-4">#{order.id.slice(0, 8)}...</td>
                <td className="p-4">{new Date(order.created_at).toLocaleDateString()}</td>
                <td className="p-4">{order.shipping_address.recipient_name}</td>
                <td className="p-4 text-right">Rp {order.total_amount.toLocaleString()}</td>
                <td className="p-4 text-center"><StatusBadge status={order.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <OrderDetailsDialog
        isOpen={!!selectedOrder}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onStatusUpdate={fetchOrders}
      />
    </div>
  );
}