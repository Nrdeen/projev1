import type { Category } from '../types/marketplace';

export type ExpectedPriceValidationResult =
  | { ok: true; value: number | null }
  | { ok: false; error: string };

/**
 * Validates optional expected negotiation price against asking priceAmount.
 * Business rule: if provided, expectedPrice must be > 0 and <= priceAmount.
 */
export function validateExpectedPriceRule(params: {
  priceAmount: number | string;
  expectedPrice: number | string | null | undefined;
}): ExpectedPriceValidationResult {
  const rawExpected = params.expectedPrice;
  if (rawExpected === null || rawExpected === undefined) {
    return { ok: true, value: null };
  }
  if (typeof rawExpected === 'boolean' || typeof rawExpected === 'object') {
    return {
      ok: false,
      error: 'السعر المتوقع للتفاوض يجب أن يكون رقماً موجباً أكبر من صفر',
    };
  }
  const strExpected = typeof rawExpected === 'string' ? rawExpected.trim() : String(rawExpected);
  if (strExpected === '') {
    return { ok: true, value: null };
  }

  const expectedNum = Number(strExpected);
  if (!Number.isFinite(expectedNum) || expectedNum <= 0) {
    return {
      ok: false,
      error: 'السعر المتوقع للتفاوض يجب أن يكون رقماً موجباً أكبر من صفر',
    };
  }

  const askingNum = Number(params.priceAmount);
  if (Number.isFinite(askingNum) && askingNum > 0 && expectedNum > askingNum) {
    return {
      ok: false,
      error: 'السعر المتوقع للتفاوض يجب أن يكون مساوياً أو أقل من السعر المطلوب للرأس',
    };
  }

  return { ok: true, value: expectedNum };
}

export interface HerdSummaryFeedback {
  unitPrice: number;
  unitExpectedPrice: number | null;
  quantity: number;
  isValidQuantity: boolean;
  totalAskingValue: number;
  totalExpectedValue: number | null;
}

/**
 * Computes live livestock quantity and total herd value feedback for listing forms.
 */
export function computeHerdSummary(params: {
  priceAmount: number | string;
  expectedPrice?: number | string | null;
  quantity: number | string;
}): HerdSummaryFeedback {
  const rawPrice = Number(params.priceAmount);
  const unitPrice = Number.isFinite(rawPrice) && rawPrice > 0 ? rawPrice : 0;

  const rawExpected =
    params.expectedPrice === null || params.expectedPrice === undefined
      ? NaN
      : String(params.expectedPrice).trim() === ''
      ? NaN
      : Number(params.expectedPrice);
  const unitExpectedPrice = Number.isFinite(rawExpected) && rawExpected > 0 ? rawExpected : null;

  const rawQty = Number(params.quantity);
  const isValidQuantity = Number.isInteger(rawQty) && rawQty >= 1;
  const quantity = isValidQuantity ? rawQty : Math.max(0, Math.floor(Number.isFinite(rawQty) ? rawQty : 0));

  return {
    unitPrice,
    unitExpectedPrice,
    quantity,
    isValidQuantity,
    totalAskingValue: unitPrice * quantity,
    totalExpectedValue: unitExpectedPrice !== null ? unitExpectedPrice * quantity : null,
  };
}

/**
 * Filters subcategories strictly by their parent category ID.
 */
export function filterSubCategoriesByParent(
  categories: Category[],
  parentCategoryId: string
): Category[] {
  return categories.filter((c) => c.parentId !== null && c.parentId === parentCategoryId);
}
