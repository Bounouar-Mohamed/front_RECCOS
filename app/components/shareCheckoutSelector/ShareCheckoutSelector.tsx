'use client';

import NumberFlow from '@number-flow/react';
import { MotionConfig, AnimatePresence, motion } from 'framer-motion';
import { ArrowDownUp, ChevronDown, Equal, Wallet, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import { shareCheckoutSelectorStyles as styles } from './shareCheckoutSelector.styles';

type PaymentPayload = {
    propertyId: string | number;
    shares: number;
    total: number;
};

type ShareCheckoutSelectorProps = {
    propertyId: string | number;
    pricePerShare: number;
    maxShares?: number | null;
    currency?: string;
    paymentPath?: string;
    propertyName?: string;
    developerLabel?: string;
    onBeforeRedirect?: (payload: PaymentPayload) => void;
    /** If provided, this callback is called instead of redirecting to paymentPath */
    onPaymentSubmit?: (payload: PaymentPayload) => Promise<void>;
    /** Show loading state during payment processing */
    isProcessing?: boolean;
};

export const ShareCheckoutSelector = ({
    propertyId,
    pricePerShare,
    maxShares = null,
    currency = 'AED',
    paymentPath = '/wallet',
    propertyName = 'Opportunité RECCOS',
    developerLabel,
    onBeforeRedirect,
    onPaymentSubmit,
    isProcessing = false,
}: ShareCheckoutSelectorProps) => {
    const router = useRouter();
    const t = useTranslations('product.checkout');
    const [shares, setShares] = useState(1);
    const [inputValue, setInputValue] = useState('1');
    const inputRef = useRef<HTMLInputElement>(null);

    const digits = (inputValue === '' ? '0' : inputValue).split('');
    const totalAmount = useMemo(() => shares * pricePerShare, [shares, pricePerShare]);
    const insufficient = typeof maxShares === 'number' && shares > maxShares;
    const disabled = !propertyId || shares <= 0 || insufficient;
    const canDecrement = shares > 1;
    const canIncrement = typeof maxShares === 'number' ? shares < maxShares : true;

    const normalizeShares = (value: number) => {
        if (!Number.isFinite(value)) return 1;
        let next = Math.max(1, Math.round(value));
        if (typeof maxShares === 'number') {
            next = Math.min(next, maxShares);
        }
        return next;
    };

    const applyShareValue = (value: number) => {
        const normalized = normalizeShares(value);
        setShares(normalized);
        setInputValue(String(normalized));
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const raw = event.target.value.replace(/\s+/g, '');
        if (!/^(\d+([.,]?\d*)?)?$/.test(raw)) return;

        if (!raw || raw === '.' || raw === ',') {
            setInputValue('');
            setShares(0);
            return;
        }

        const parsed = Number(raw.replace(',', '.'));
        if (Number.isNaN(parsed)) {
            setInputValue('');
            setShares(0);
            return;
        }

        applyShareValue(parsed);
    };

    const handleInputBlur = () => {
        if (!inputValue) {
            applyShareValue(1);
            return;
        }
        const parsed = Number(inputValue.replace(',', '.'));
        applyShareValue(parsed);
    };

    const handleUseMax = () => {
        if (typeof maxShares !== 'number') return;
        applyShareValue(maxShares);
    };

    const handleStep = (delta: number) => {
        applyShareValue(shares + delta);
    };

    const handlePayment = async () => {
        if (disabled || isProcessing) return;
        
        const payload: PaymentPayload = { propertyId, shares, total: totalAmount };
        
        // Si onPaymentSubmit est fourni, l'utiliser au lieu de rediriger
        if (onPaymentSubmit) {
            await onPaymentSubmit(payload);
            return;
        }
        
        // Sinon, comportement par défaut : redirection
        onBeforeRedirect?.(payload);
        const params = new URLSearchParams({
            propertyId: String(propertyId),
            shares: String(shares),
        });
        router.push(`${paymentPath}?${params.toString()}`);
    };

    return (
        <MotionConfig transition={{ type: 'spring', stiffness: 400, damping: 35 }}>
            <div className={styles.wrapper}>
                <div className={styles.stack}>
                    <div className={styles.cardPrimary}>
                        <div className={styles.propertyRow}>
                            <div className={styles.propertyInfo}>
                                <span className={styles.propertyTitle}>{propertyName}</span>
                                <span className={styles.propertyMeta}>
                                    {developerLabel || t('shareSelection')} · {pricePerShare.toLocaleString()} {currency}/part
                                </span>
                            </div>
                            {typeof maxShares === 'number' ? (
                                <button type="button" className={styles.actionChip} onClick={handleUseMax}>
                                    {t('useMax')}
                                </button>
                            ) : null}
                        </div>

                        <div className={styles.divider} />

                        <div className={styles.inputShell}>
                            <div className={styles.valueRow}>
                                <button
                                    type="button"
                                    className={styles.stepButton}
                                    onClick={() => handleStep(-1)}
                                    disabled={!canDecrement}
                                    aria-label={t('decreaseShares')}
                                >
                                    −
                                </button>
                                <div className={styles.valueDisplay}>
                                    <div className={styles.inputWrapper}>
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            className={styles.inputField}
                                            value={inputValue}
                                            onChange={handleInputChange}
                                            onBlur={handleInputBlur}
                                            placeholder="0"
                                            inputMode="decimal"
                                        />
                                        <div className={styles.digitsLayer}>
                                            <div className={styles.digitsValue}>
                                                <AnimatePresence initial={false} mode="popLayout">
                                                    {digits.map((digit, index) => (
                                                        <motion.span
                                                            key={`${digit}-${index}`}
                                                            initial={{ y: '100%', opacity: 0 }}
                                                            animate={{ y: '0%', opacity: 1 }}
                                                            exit={{ y: '-100%', opacity: 0 }}
                                                            className={styles.digitChar}
                                                        >
                                                            {digit}
                                                        </motion.span>
                                                    ))}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className={styles.stepButton}
                                    onClick={() => handleStep(1)}
                                    disabled={!canIncrement}
                                    aria-label={t('increaseShares')}
                                >
                                    +
                                </button>
                            </div>

                            <div className={styles.summaryRow}>
                                <AnimatePresence mode="popLayout" initial={false}>
                                    {!insufficient ? (
                                        <motion.div
                                            key="summary"
                                            className={styles.conversionRow}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                        >
                                            <span className={styles.iconBadge}>
                                                <Equal className="size-4" />
                                            </span>
                                            {/* <ArrowDownUp className="size-4" /> */}
                                            <div className={styles.iconBadge}>
                                                <Wallet className="size-4" />
                                            </div>
                                            <motion.div layout className={styles.propertyTitle}>
                                                {totalAmount.toLocaleString(undefined, {
                                                    style: 'currency',
                                                    currency,
                                                    minimumFractionDigits: 0,
                                                    maximumFractionDigits: 0,
                                                })}
                                            </motion.div>
                                        </motion.div>
                                    ) : (
                                        <motion.p
                                            key="insufficient"
                                            className={styles.notice}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                        >
                                            {t('sharesExceeded')}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* <div className={styles.stepControls}>
                                <p>{t('inputHint')}</p>
                            </div> */}

                        </div>
                        <div className={styles.connector}>
                            <div className={styles.chevron}>
                                <ChevronDown className="size-4 opacity-60" />
                            </div>
                        </div>
                    </div>


                    <div className={styles.secondaryCard}>
                        <div className={styles.secondaryHeader}>
                            <div>
                                <p className={styles.secondaryLabel}>{t('totalInvested')}</p>
                                <div className={styles.numberEmphasis}>
                                    <NumberFlow value={totalAmount || 0} />
                                    <span style={{ marginLeft: 6, fontSize: '0.9rem' }}>{currency}</span>
                                </div>
                            </div>
                            <div className={styles.tipIcon}>
                                <ArrowDownUp className="size-4 opacity-70" />
                            </div>
                        </div>
                        <p className={styles.secondaryFoot}>
                            {t('sharesSelected', { count: shares })}
                        </p>
                        {typeof maxShares === 'number' ? (
                            <p className={styles.secondaryFoot}>
                                {maxShares - shares >= 0
                                    ? t('sharesAvailable', { count: Math.max(maxShares - shares, 0) })
                                    : t('sharesLimitExceeded', { count: shares - maxShares })}
                            </p>
                        ) : null}
                    </div>

                    <button 
                        type="button" 
                        className={styles.paymentButton} 
                        disabled={disabled || isProcessing} 
                        onClick={handlePayment}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                {t('processing')}
                            </>
                        ) : (
                            <>
                                <Wallet className="size-4" />
                                {t('payment')}
                            </>
                        )}
                    </button>
                    {/* <p className={styles.hint}>{t('paymentHint')}</p> */}
                </div>
            </div>
        </MotionConfig>
    );
};

