import React, { useState, useEffect, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import * as Select from '@radix-ui/react-select';
import {
  XMarkIcon,
  ChevronDownIcon,
  CheckIcon,
  PencilIcon,
  TrashIcon,
  TruckIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import type { Order, OrderStatus } from '@/types/supabase';

interface TransactionsTabProps {
  orders: Order[];
  isDataLoading: boolean;
  onUpdateStatus: (orderId: string, status: OrderStatus, provider?: string, trackingNumber?: string) => Promise<void>;
  onDeleteOrder: (orderId: string) => Promise<void>;
  activeSubMenu?: string;
}

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
  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusStyles[status] || 'bg-gray-700'}`}>
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </span>
);

const OrderEditDialog = ({
  order,
  isOpen,
  onClose,
  onUpdateStatus
}: {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus, provider?: string, trackingNumber?: string) => Promise<void>;
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
    await onUpdateStatus(order.id, newStatus, provider, trackingNumber);
    setIsSaving(false);
    onClose();
  };

  const availableStatuses: OrderStatus[] = ['pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled', 'failed'];

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-slate-800/95 backdrop-blur-xl rounded-2xl p-8 z-50 border border-slate-700/50 shadow-2xl">
          <Dialog.Title className="text-xl font-bold mb-4 text-white">Ubah Status Pesanan #{order.display_id}</Dialog.Title>
          <Dialog.Description className="text-slate-400 mb-6">
            Pilih status baru untuk pesanan dari <strong>{order.shipping_address.recipient_name}</strong>.
          </Dialog.Description>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Status Pesanan</label>
              <Select.Root value={newStatus || ''} onValueChange={(val) => setNewStatus(val as OrderStatus)}>
                <Select.Trigger className="w-full flex items-center justify-between px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:ring-2 focus:ring-red-500/50 focus:border-red-500">
                  <Select.Value />
                  <Select.Icon><ChevronDownIcon className="w-4 h-4" /></Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className="bg-slate-800 border border-slate-700 rounded-xl shadow-lg z-[60] p-2">
                    <Select.Viewport>
                      {availableStatuses.map(status => (
                        <Select.Item key={status} value={status} className="px-3 py-2 text-sm text-white rounded-lg hover:bg-slate-700 flex items-center justify-between outline-none cursor-pointer data-[highlighted]:bg-slate-700">
                          <Select.ItemText>{status.charAt(0).toUpperCase() + status.slice(1)}</Select.ItemText>
                          <Select.ItemIndicator><CheckIcon className="w-4 h-4 text-red-400"/></Select.ItemIndicator>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>
            {newStatus === 'shipped' && (
              <div className="space-y-4 p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center gap-2 text-cyan-300 text-sm"><TruckIcon className="w-4 h-4" /> Masukkan Detail Pengiriman</div>
                <input type="text" value={provider} onChange={e => setProvider(e.target.value)} placeholder="Kurir Pengiriman (e.g., JNE, SiCepat)" className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500" />
                <input type="text" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} placeholder="Nomor Resi" className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500" />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 mt-8">
            <button onClick={onClose} className="px-6 py-2 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-600 transition-colors">Batal</button>
            <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50">
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
          <Dialog.Close asChild>
            <button className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white"><XMarkIcon className="w-5 h-5"/></button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export function TransactionsTab({ orders, isDataLoading, onUpdateStatus, onDeleteOrder, activeSubMenu }: TransactionsTabProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
      if (!activeSubMenu || activeSubMenu === 'transactions-overview') {
          return orders;
      }
      const statusMap: { [key: string]: OrderStatus[] } = {
          'transactions-pending': ['pending', 'paid', 'processing'],
          'transactions-completed': ['completed'],
          'transactions-failed': ['failed', 'cancelled'],
      };
      const targetStatuses = statusMap[activeSubMenu];
      if (targetStatuses) {
          return orders.filter(order => targetStatuses.includes(order.status));
      }
      return orders;
  }, [orders, activeSubMenu]);

  const confirmDelete = async () => {
    if (deleteOrderId) {
      await onDeleteOrder(deleteOrderId);
      setDeleteOrderId(null);
    }
  };

  const getSubMenuTitle = () => {
    switch (activeSubMenu) {
      case 'transactions-pending': return 'Pesanan Tertunda';
      case 'transactions-completed': return 'Pesanan Selesai';
      case 'transactions-failed': return 'Pesanan Gagal';
      default: return 'Semua Transaksi';
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
            <BanknotesIcon className="w-6 h-6 text-white"/>
        </div>
        <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">{getSubMenuTitle()}</h2>
            <p className="text-slate-400">Tinjau, perbarui status, dan kelola semua pesanan.</p>
        </div>
      </div>

      <div className="bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
            <table className="w-full">
            <thead className="bg-slate-800/60 backdrop-blur-sm">
                <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-700/50">ID Pesanan</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-700/50">Tanggal</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-700/50">Pelanggan</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-700/50">Total</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-700/50">Status</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-700/50">Aksi</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
                {filteredOrders.map(order => (
                <tr key={order.id} className="group hover:bg-slate-700/20 transition-all duration-200">
                    <td className="px-6 py-4 font-mono text-sm text-red-300">{order.display_id}</td>
                    <td className="px-6 py-4 text-slate-400">{new Date(order.created_at).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4 text-white font-medium">{order.shipping_address.recipient_name}</td>
                    <td className="px-6 py-4 text-right text-white font-semibold">Rp {order.total_amount.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-center"><StatusBadge status={order.status} /></td>
                    <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                            <button onClick={() => setSelectedOrder(order)} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"><PencilIcon className="w-4 h-4" /></button>
                            <button onClick={() => setDeleteOrderId(order.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><TrashIcon className="w-4 h-4" /></button>
                        </div>
                    </td>
                </tr>
                ))}
                 {!filteredOrders.length && !isDataLoading && (<tr><td colSpan={6} className="px-6 py-16 text-center"><div className="flex flex-col items-center"><div className="w-20 h-20 bg-slate-700/50 rounded-3xl flex items-center justify-center mb-6"><BanknotesIcon className="w-10 h-10 text-slate-500" /></div><h3 className="text-xl font-semibold text-slate-300 mb-2">{orders.length === 0 ? 'Tidak Ada Transaksi' : 'Tidak Ada Transaksi yang Sesuai'}</h3><p className="text-slate-500">{orders.length === 0 ? 'Belum ada pesanan yang masuk ke sistem.' : 'Tidak ada pesanan yang cocok dengan filter yang dipilih.'}</p></div></td></tr>)}
            </tbody>
            </table>
        </div>
      </div>
      <OrderEditDialog
        isOpen={!!selectedOrder}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={onUpdateStatus}
      />
      <AlertDialog.Root open={!!deleteOrderId} onOpenChange={() => setDeleteOrderId(null)}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" />
          <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-slate-800/95 backdrop-blur-xl rounded-2xl p-8 z-50 border border-slate-700/50 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <AlertDialog.Title className="text-xl font-bold text-white">Hapus Pesanan</AlertDialog.Title>
                <AlertDialog.Description className="text-slate-400 mt-1">Tindakan ini tidak dapat dibatalkan.</AlertDialog.Description>
              </div>
            </div>
            <p className="text-slate-300 my-4">Apakah Anda yakin ingin menghapus pesanan <strong>#{deleteOrderId?.slice(0, 8)}...</strong> secara permanen? </p>
            <div className="flex justify-end gap-3 mt-6">
              <AlertDialog.Cancel asChild>
                <button className="px-5 py-2 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-600 transition-colors">Batal</button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button onClick={confirmDelete} className="px-5 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors">Ya, Hapus</button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}