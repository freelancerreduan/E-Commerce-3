/**
 * Meta Pixel, TikTok Pixel, and GA4 — shared e-commerce event queue from HATILO_TRACKING.
 */
(function () {
  var cfg = window.HATILO_TRACKING || {};
  var TT_PURCHASE = 'CompletePayment';

  function gaItems(data) {
    var contents = data && data.contents ? data.contents : [];
    if (contents.length) {
      return contents.map(function (c) {
        return {
          item_id: String(c.id || ''),
          quantity: c.quantity || 1,
          price: c.item_price || 0,
        };
      });
    }
    var ids = (data && data.content_ids) || [];
    return ids.map(function (id) {
      return { item_id: String(id), quantity: 1 };
    });
  }

  function gaParams(data) {
    var params = {
      currency: (data && data.currency) || 'BDT',
      value: data && data.value != null ? data.value : 0,
    };
    var items = gaItems(data);
    if (items.length) {
      params.items = items;
    }
    if (data && data.search_string) {
      params.search_term = data.search_string;
    }
    if (data && data.order_id) {
      params.transaction_id = data.order_id;
    }
    if (data && data.content_name) {
      params.method = data.content_name;
    }
    if (data && data.content_category) {
      params.content_category = data.content_category;
    }
    return params;
  }

  function trackFb(name, data) {
    if (!cfg.fb || typeof window.fbq !== 'function') {
      return;
    }
    if (data && Object.keys(data).length) {
      window.fbq('track', name, data);
    } else {
      window.fbq('track', name);
    }
  }

  function trackTt(name, data) {
    if (!cfg.tt || typeof window.ttq !== 'object' || typeof window.ttq.track !== 'function') {
      return;
    }
    var ev = name === 'Purchase' ? TT_PURCHASE : name;
    if (data && Object.keys(data).length) {
      window.ttq.track(ev, data);
    } else {
      window.ttq.track(ev);
    }
  }

  function trackGa(name, data) {
    if (!cfg.ga || typeof window.gtag !== 'function') {
      return;
    }
    var map = {
      ViewContent: 'view_item',
      AddToCart: 'add_to_cart',
      InitiateCheckout: 'begin_checkout',
      Purchase: 'purchase',
      Search: 'search',
      Contact: 'generate_lead',
      CompleteRegistration: 'sign_up',
      Lead: 'generate_lead',
    };
    var gaEv = map[name];
    if (!gaEv) {
      return;
    }
    window.gtag('event', gaEv, gaParams(data || {}));
  }

  function trackAll(name, data) {
    trackFb(name, data);
    trackTt(name, data);
    trackGa(name, data);
  }

  function runQueue() {
    var queue = cfg.queue;
    if (!Array.isArray(queue)) {
      return;
    }
    queue.forEach(function (item) {
      if (!item || !item.event) {
        return;
      }
      trackAll(item.event, item.data || {});
    });
    cfg.queue = [];
  }

  function vendorTrackingConfigs() {
    if (Array.isArray(window.HATILO_VENDOR_TRACKINGS) && window.HATILO_VENDOR_TRACKINGS.length) {
      return window.HATILO_VENDOR_TRACKINGS;
    }
    if (window.HATILO_VENDOR_TRACKING) {
      return [window.HATILO_VENDOR_TRACKING];
    }
    return [];
  }

  function trackVendorConfig(v, name, data) {
    if (!v) {
      return;
    }
    var payload = data || {};
    var hasData = Object.keys(payload).length > 0;
    if (v.metaPixelId && typeof window.fbq === 'function') {
      if (hasData) {
        window.fbq('trackSingle', v.metaPixelId, name, payload);
      } else {
        window.fbq('trackSingle', v.metaPixelId, name);
      }
    }
    if (v.tiktokPixelId && typeof window.ttq === 'object') {
      var ev = name === 'Purchase' ? TT_PURCHASE : name;
      if (typeof window.ttq.instance === 'function') {
        var inst = window.ttq.instance(v.tiktokPixelId);
        if (inst && typeof inst.track === 'function') {
          if (hasData) {
            inst.track(ev, payload);
          } else {
            inst.track(ev);
          }
        }
      } else if (typeof window.ttq.track === 'function') {
        if (hasData) {
          window.ttq.track(ev, payload);
        } else {
          window.ttq.track(ev);
        }
      }
    }
  }

  function runVendorQueue() {
    vendorTrackingConfigs().forEach(function (v) {
      if (!v || !Array.isArray(v.queue)) {
        return;
      }
      v.queue.forEach(function (item) {
        if (!item || !item.event) {
          return;
        }
        trackVendorConfig(v, item.event, item.data || {});
      });
      v.queue = [];
    });
  }

  function onReady() {
    runQueue();
    runVendorQueue();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }

  window.hatiloTrackMarketing = trackAll;

  window.hatiloTrackVendor = function (name, data) {
    vendorTrackingConfigs().forEach(function (v) {
      trackVendorConfig(v, name, data || {});
    });
  };

  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('[data-tracking-contact]') : null;
    if (!el) {
      return;
    }
    var data = {
      content_type: 'product',
      content_ids: el.getAttribute('data-product-id') ? [el.getAttribute('data-product-id')] : [],
    };
    trackAll('Contact', data);

    vendorTrackingConfigs().forEach(function (v) {
      trackVendorConfig(v, 'Contact', data);
    });
  });
})();
