import { media } from '@wix/sdk';

/** Resolves a Wix product/CMS image field (which may be a `wix:image://` id or an
 * already-absolute URL) to a real, renderable image URL. Returns '' when there's
 * nothing to show — callers should render a themed fallback block instead of <img>. */
export function imgSrc(mediaMain: any, w = 800, h = 800): string {
  const v = mediaMain?.image ?? mediaMain?.url ?? mediaMain;
  if (!v) return '';
  if (typeof v === 'string' && v.startsWith('wix:image://')) {
    return media.getScaledToFillImageUrl(v, w, h, {});
  }
  return typeof v === 'string' ? v : (v.url ?? '');
}
