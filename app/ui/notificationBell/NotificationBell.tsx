'use client';

import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { css, cx } from '@/styled-system/css';
import { ComponentPropsWithoutRef } from 'react';

const notificationBellStyles = {
  button: css({
    position: 'relative',
    width: 'auto',
    height: 'auto',
    border: 'none',
    background: 'transparent',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, opacity 0.2s ease',
    color: '#fefefe',
    padding: 0,
    _hover: {
      opacity: 0.85,
    },
    _active: {
      transform: 'scale(0.94)',
    },
  }),
  iconWrapper: css({
    width: 22,
    height: 22,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  pulse: css({
    position: 'absolute',
    inset: '-8px',
    borderRadius: '999px',
    border: '1px solid rgba(255,255,255,0.25)',
    opacity: 0,
    transition: 'opacity 0.2s ease',
  }),
  pulseActive: css({
    opacity: 1,
  }),
  srOnly: css({
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  }),
};

interface NotificationBellProps extends ComponentPropsWithoutRef<'button'> {
  active?: boolean;
  label?: string;
}

export const NotificationBell = ({
  active = false,
  label = 'Activer les notifications',
  className,
  ...props
}: NotificationBellProps) => {
  return (
    <button
      type="button"
      className={cx(notificationBellStyles.button, className)}
      aria-pressed={active}
      {...props}
    >
      <motion.span
        className={notificationBellStyles.iconWrapper}
        animate={{
          rotate: active ? [0, -12, 4, -2, 0] : 0,
        }}
        transition={{
          duration: active ? 0.6 : 0.4,
          ease: 'easeInOut',
        }}
      >
        <Bell strokeWidth={1.6} width={20} height={20} aria-hidden="true" />
      </motion.span>
      <span
        className={cx(notificationBellStyles.pulse, active && notificationBellStyles.pulseActive)}
        aria-hidden="true"
      />
      <span className={notificationBellStyles.srOnly}>{label}</span>
    </button>
  );
};

