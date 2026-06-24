import type { FC } from 'react';
import { FEATURE_CATALOG } from '../../features/featureCatalog';
import type { FeatureFlagsState } from '../../features/featureFlags/featureFlagsSlice';
import { useTranslation } from '../../hooks/useTranslation';
import { Badge, type BadgeVariant } from '../ui/Badge';

// QNBS-v3: maturity → badge variant, single source for the whole Settings surface. Derived from
// FEATURE_CATALOG so a section's badge can never drift from the catalog/slice. `stable`/unlisted → no
// badge (Production needs no pill); `stub`/`experimental` → Experimental; `beta` → Beta.
const MATURITY_TO_BADGE: Record<string, BadgeVariant | undefined> = {
  experimental: 'experimental',
  stub: 'experimental',
  beta: 'beta',
  stable: undefined,
};

/** Returns the badge variant a flag's feature should carry, or `undefined` for stable/unlisted. */
export function maturityBadgeVariant(flagKey: keyof FeatureFlagsState): BadgeVariant | undefined {
  const entry = FEATURE_CATALOG.find((e) => e.flagKey === flagKey);
  return entry ? MATURITY_TO_BADGE[entry.maturity] : undefined;
}

/**
 * Inline maturity pill for a Settings section/flag, driven by FEATURE_CATALOG. Renders nothing for
 * stable/unlisted features. Reused by both the dedicated section headers and the Experimental flags
 * list, so the maturity signalling is consistent everywhere.
 */
export const MaturityBadge: FC<{
  flagKey: keyof FeatureFlagsState;
  className?: string;
  /** When true the pill is decorative (already-labelled context) and hidden from the a11y tree. */
  decorative?: boolean;
}> = ({ flagKey, className, decorative }) => {
  const { t } = useTranslation();
  const variant = maturityBadgeVariant(flagKey);
  if (!variant) return null;
  const label = variant === 'beta' ? t('common.badge.beta') : t('common.badge.experimental');
  // QNBS-v3: exactOptionalPropertyTypes — only pass optional props when defined (never `undefined`).
  return (
    <Badge
      variant={variant}
      {...(className !== undefined && { className })}
      {...(decorative ? { srLabel: '' } : {})}
    >
      {label}
    </Badge>
  );
};

MaturityBadge.displayName = 'MaturityBadge';
