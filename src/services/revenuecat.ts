import { Platform } from 'react-native';

// RevenueCat — only available in dev builds (not Expo Go)
// We use dynamic import to gracefully handle Expo Go environment
let Purchases: typeof import('react-native-purchases').default | null = null;

async function loadPurchases() {
  if (Purchases) return Purchases;
  try {
    const mod = await import('react-native-purchases');
    Purchases = mod.default;
    return Purchases;
  } catch {
    console.warn('[RevenueCat] react-native-purchases not available (Expo Go?)');
    return null;
  }
}

export const ENTITLEMENT_PRO = 'pro';

export async function initRevenueCat(): Promise<void> {
  const RC = await loadPurchases();
  if (!RC) return;

  const apiKey =
    Platform.OS === 'ios'
      ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? ''
      : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '';

  if (!apiKey || apiKey.startsWith('appl_your') || apiKey.startsWith('goog_your')) {
    console.warn('[RevenueCat] API key not configured — running in mock Pro mode');
    return;
  }

  RC.configure({ apiKey });
}

export async function checkIsProEntitlement(): Promise<boolean> {
  // Always grant Pro in dev mode — RevenueCat only works in production builds
  if (__DEV__) return true;

  const RC = await loadPurchases();
  if (!RC) return false;

  try {
    const customerInfo = await RC.getCustomerInfo();
    return customerInfo.entitlements.active[ENTITLEMENT_PRO] != null;
  } catch (e) {
    console.warn('[RevenueCat] checkIsProEntitlement error:', e);
    return false;
  }
}

export async function getOfferings() {
  const RC = await loadPurchases();
  if (!RC) return null;

  try {
    return await RC.getOfferings();
  } catch (e) {
    console.warn('[RevenueCat] getOfferings error:', e);
    return null;
  }
}

export async function purchasePro(): Promise<boolean> {
  const RC = await loadPurchases();
  if (!RC) return false;

  try {
    const offerings = await RC.getOfferings();
    const proPackage = offerings?.current?.availablePackages[0];
    if (!proPackage) return false;

    const { customerInfo } = await RC.purchasePackage(proPackage);
    return customerInfo.entitlements.active[ENTITLEMENT_PRO] != null;
  } catch (e: any) {
    if (e?.userCancelled) return false;
    console.warn('[RevenueCat] purchasePro error:', e);
    return false;
  }
}

export async function restorePurchases(): Promise<boolean> {
  const RC = await loadPurchases();
  if (!RC) return false;

  try {
    const customerInfo = await RC.restorePurchases();
    return customerInfo.entitlements.active[ENTITLEMENT_PRO] != null;
  } catch (e) {
    console.warn('[RevenueCat] restorePurchases error:', e);
    return false;
  }
}
