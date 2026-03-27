import type { RecentTransaction } from '@/types/admin';

interface RecentTransactionsTableProps {
  data: RecentTransaction[];
  isLoading?: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  SUCCEEDED: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  FAILED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-gray-100 text-gray-700',
};

const STATUS_LABELS: Record<string, string> = {
  SUCCEEDED: 'Reussi',
  PENDING: 'En attente',
  FAILED: 'Echoue',
  REFUNDED: 'Rembourse',
};

const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount);

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

const RecentTransactionsTable = ({ data, isLoading }: RecentTransactionsTableProps) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="h-4 bg-gray-200 rounded w-40 mb-4 animate-pulse" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 py-3 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded w-1/6" />
            <div className="h-4 bg-gray-200 rounded w-1/6" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
      <h3 className="text-sm font-medium text-gray-500 mb-4">Transactions recentes</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 text-gray-500 font-medium">Utilisateur</th>
              <th className="text-left py-2 text-gray-500 font-medium">Reference</th>
              <th className="text-right py-2 text-gray-500 font-medium">Montant</th>
              <th className="text-center py-2 text-gray-500 font-medium">Statut</th>
              <th className="text-right py-2 text-gray-500 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {data.map((tx) => (
              <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3">
                  <p className="font-medium text-gray-900">{tx.userName}</p>
                  <p className="text-gray-400 text-xs">{tx.userEmail}</p>
                </td>
                <td className="py-3 text-gray-600 font-mono text-xs">{tx.bookingReference}</td>
                <td className="py-3 text-right font-medium text-gray-900">
                  {formatCurrency(tx.amount, tx.currency)}
                </td>
                <td className="py-3 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[tx.status] || 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_LABELS[tx.status] || tx.status}
                  </span>
                </td>
                <td className="py-3 text-right text-gray-500 text-xs">{formatDate(tx.createdAt)}</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">Aucune transaction</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentTransactionsTable;
