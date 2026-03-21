import React from 'react';
import { FileText, CreditCard } from 'lucide-react';
import SettingsCard from '../components/SettingsCard';
import SubscriptionStatus from '../../subscription/SubscriptionStatus';

/**
 * BillingTab — Plan & Abrechnung.
 *
 * Stateless extraction. SubscriptionStatus is embedded as a protected unit
 * (uses useSubscription() internally — do not modify its logic).
 *
 * Billing history and payment method are honest placeholders:
 * no mock invoices, no fake card numbers.
 *
 * Token-first: uses --vektrus-* CSS custom properties exclusively.
 */
const BillingTab: React.FC = () => {
  return (
    <div className="space-y-6">

      {/* Subscription status — real component, protected */}
      <SettingsCard
        title="Aktueller Plan"
        description="Dein Vektrus-Abonnement und dessen Status."
      >
        <SubscriptionStatus />
      </SettingsCard>

      {/* Billing history — placeholder */}
      <SettingsCard
        title="Rechnungshistorie"
        description="Übersicht deiner bisherigen Rechnungen."
      >
        <div className="flex items-start gap-4 py-2">
          <div className="w-10 h-10 rounded-[var(--vektrus-radius-sm)] bg-[var(--vektrus-mint)] flex items-center justify-center flex-shrink-0 mt-0.5">
            <FileText className="w-5 h-5 text-[var(--vektrus-blue)]" />
          </div>
          <div>
            <div className="text-sm font-medium text-[var(--vektrus-anthrazit)] mb-1">Rechnungen</div>
            <p className="text-[13px] text-[var(--vektrus-gray)] leading-relaxed">
              Die Rechnungsübersicht mit PDF-Download wird in einer kommenden Version direkt hier verfügbar sein.
              Bei Fragen zu bestehenden Rechnungen wende dich bitte an den Support.
            </p>
          </div>
        </div>
      </SettingsCard>

      {/* Payment method — placeholder */}
      <SettingsCard
        title="Zahlungsmethode"
        description="Deine hinterlegte Zahlungsmethode."
      >
        <div className="flex items-start gap-4 py-2">
          <div className="w-10 h-10 rounded-[var(--vektrus-radius-sm)] bg-[var(--vektrus-mint)] flex items-center justify-center flex-shrink-0 mt-0.5">
            <CreditCard className="w-5 h-5 text-[var(--vektrus-blue)]" />
          </div>
          <div>
            <div className="text-sm font-medium text-[var(--vektrus-anthrazit)] mb-1">Zahlungsdaten verwalten</div>
            <p className="text-[13px] text-[var(--vektrus-gray)] leading-relaxed">
              Die Verwaltung deiner Zahlungsmethode wird in einer kommenden Version direkt hier verfügbar sein.
              Änderungen an deiner Zahlungsmethode kannst du derzeit über den Support vornehmen.
            </p>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
};

export default BillingTab;
