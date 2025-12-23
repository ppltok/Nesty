// src/utils/tracking.ts
// GTM DataLayer tracking utilities for Nesty

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

// Ensure dataLayer exists
if (typeof window !== 'undefined') {
  window.dataLayer = window.dataLayer || [];
}

// Helper function
const pushEvent = (eventName: string, params: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...params,
    });
  }
};

// ===================
// P0 EVENTS (NSM FUNNEL)
// ===================

export const trackRegistryCreated = (params: {
  registry_id: string;
  user_id: string;
  source?: 'organic' | 'referral' | 'chrome_extension';
}) => {
  pushEvent('registry_created', {
    registry_id: params.registry_id,
    user_id: params.user_id,
    source: params.source || 'organic',
  });
};

export const trackRegistryShared = (params: {
  registry_id: string;
  user_id: string;
  share_method: 'whatsapp' | 'email' | 'link_copied' | 'qr_code';
  items_count: number;
}) => {
  pushEvent('registry_shared', {
    registry_id: params.registry_id,
    user_id: params.user_id,
    share_method: params.share_method,
    items_count: params.items_count,
  });
};

export const trackRegistryViewed = (params: {
  registry_id: string;
  viewer_id: string;
  items_count: number;
  referral_source?: string;
}) => {
  pushEvent('registry_viewed', {
    registry_id: params.registry_id,
    viewer_id: params.viewer_id,
    items_count: params.items_count,
    referral_source: params.referral_source || document.referrer || 'direct',
  });
};

export const trackGiftPurchased = (params: {
  registry_id: string;
  item_id: string;
  item_name: string;
  item_category: string;
  item_price: number;
  quantity: number;
  has_greeting: boolean;
  is_surprise: boolean;
  store_selected: string;
}) => {
  pushEvent('gift_purchased', params);
};

export const trackGiftMarkedBought = (params: {
  registry_id: string;
  item_id: string;
  item_name: string;
  item_category: string;
}) => {
  pushEvent('gift_marked_bought', params);
};

// ===================
// P1 EVENTS (ENGAGEMENT)
// ===================

export const trackItemAdded = (params: {
  registry_id: string;
  item_id: string;
  item_name: string;
  item_category: string;
  item_price?: number;
  source: 'manual' | 'paste' | 'chrome_extension';
  has_extension?: boolean;
}) => {
  pushEvent('item_added', params);
};

export const trackItemEdited = (params: {
  registry_id: string;
  item_id: string;
  item_name: string;
}) => {
  pushEvent('item_edited', params);
};

export const trackItemDeleted = (params: {
  registry_id: string;
  item_id: string;
  item_name: string;
}) => {
  pushEvent('item_deleted', params);
};

export const trackOnboardingStep = (params: {
  user_id: string;
  step: number;
  step_name: string;
  completed: boolean;
}) => {
  pushEvent('onboarding_step', params);
};

export const trackOnboardingCompleted = (params: {
  user_id: string;
  registry_id: string;
}) => {
  pushEvent('onboarding_completed', params);
};

// ===================
// P2 EVENTS (AUTH & NAVIGATION)
// ===================

export const trackSignup = (params: {
  user_id: string;
  auth_method: 'email' | 'google' | 'apple';
}) => {
  pushEvent('signup', params);
};

export const trackLogin = (params: {
  user_id: string;
  auth_method: 'email' | 'google' | 'apple';
}) => {
  pushEvent('login', params);
};

export const trackPageView = (params: {
  page_name: string;
  user_id?: string;
}) => {
  pushEvent('page_view', params);
};
