import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badgeText,
  badgeType = 'default', // 'success', 'warning', 'info', 'default'
  color = 'eco'
}) {
  const badgeStyles = {
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
    info: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300',
    default: 'bg-eco-100 text-eco-900 dark:bg-stone-800 dark:text-eco-200'
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-stone-600 dark:text-dark-muted uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-eco-100 dark:bg-stone-800 text-eco-900 dark:text-eco-200 flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="font-display font-extrabold text-2xl sm:text-3xl text-eco-950 dark:text-dark-text tracking-tight">
            {value}
          </span>
          {badgeText && (
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${badgeStyles[badgeType] || badgeStyles.default}`}>
              {badgeText}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-stone-500 dark:text-dark-muted font-medium">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
