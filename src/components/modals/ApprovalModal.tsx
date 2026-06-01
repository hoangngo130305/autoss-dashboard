import { CheckCircle, XCircle } from 'lucide-react';
import { ModalBase } from './ModalBase';
import { Button } from '../common/Button';
import type { ModalData } from '../../types/finance';
import { useToast } from '../../hooks/useToast';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ModalData | null;
}

export function ApprovalModal({ isOpen, onClose, data }: ApprovalModalProps) {
  const { showToast } = useToast();

  const handleApprove = () => {
    onClose();
    showToast('✓ Đã duyệt thanh toán thành công', 'success');
  };

  const handleReject = () => {
    onClose();
    showToast('Đã từ chối đề xuất', 'warning');
  };

  if (!data) return null;

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={data.title}
      subtitle={data.subtitle}
      footer={
        data.showApprove ? (
          <>
            <Button variant="success" size="md" onClick={handleApprove}>
              <CheckCircle size={14} />
              Duyệt thanh toán
            </Button>
            <Button variant="danger" size="md" onClick={handleReject}>
              <XCircle size={14} />
              Từ chối
            </Button>
            <Button variant="ghost" size="md" onClick={onClose}>
              Huỷ
            </Button>
          </>
        ) : (
          <Button variant="ghost" size="md" onClick={onClose}>
            Đóng
          </Button>
        )
      }
    >
      <div className="divide-y divide-white/7 border border-white/7 rounded-xl overflow-hidden">
        {data.rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between px-4 py-3">
            <span className="text-xs text-ink-3">{label}</span>
            <span className="text-[13px] font-mono font-medium text-ink-1">{value}</span>
          </div>
        ))}
      </div>
    </ModalBase>
  );
}
