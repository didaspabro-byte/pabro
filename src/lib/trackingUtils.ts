import { Order, OrderTrackingInfo, OrderTrackingEvent } from '../types';

export const DEFAULT_CARRIER = 'PrimeStockUG Priority Express';
export const DEFAULT_CARRIER_SERVICE = 'Direct Air & Ground Logistics';

export function getOrCreateOrderTrackingInfo(order: Order): OrderTrackingInfo {
  if (order.trackingInfo && order.trackingInfo.events && order.trackingInfo.events.length > 0) {
    // Sync current stage with order.status if changed via Admin
    return syncTrackingWithOrderStatus(order.trackingInfo, order.status, order.shippingDetails);
  }

  const cleanNum = order.id.replace(/[^A-Za-z0-9]/g, '');
  const trackingNumber = order.trackingNumber || `PSUG-${cleanNum.slice(-6)}-EX`;
  const carrier = order.carrier || DEFAULT_CARRIER;
  const carrierService = DEFAULT_CARRIER_SERVICE;

  // Calculate estimated delivery date
  const orderDateObj = new Date(order.date);
  const estDateObj = isNaN(orderDateObj.getTime()) ? new Date() : new Date(orderDateObj);
  estDateObj.setDate(estDateObj.getDate() + 3);

  const estimatedDeliveryDate = order.estimatedDeliveryDate || estDateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const city = order.shippingDetails?.city || 'Regional Hub';
  const country = order.shippingDetails?.country || 'Destination Country';
  const fullLoc = `${city}, ${country}`;

  // Build events based on order status
  const events: OrderTrackingEvent[] = [];
  const status = order.status;

  if (status === 'Cancelled') {
    events.push({
      id: 'evt_1',
      stage: 'placed',
      title: 'Order Placed & Payment Received',
      description: 'Order details verified and sent to processing queue.',
      timestamp: `${order.date}, 09:15 AM`,
      location: 'Online Shop System',
      completed: true,
      current: false
    });
    events.push({
      id: 'evt_cancel',
      stage: 'cancelled',
      title: 'Order Cancelled',
      description: 'Order was cancelled by customer request or store administrator.',
      timestamp: 'Cancellation logged',
      location: 'Customer Support Portal',
      completed: true,
      current: true
    });

    return {
      trackingNumber,
      carrier,
      carrierService,
      estimatedDeliveryDate: 'Cancelled',
      currentStage: 'cancelled',
      events
    };
  }

  // 1. Placed Stage
  events.push({
    id: 'evt_1',
    stage: 'placed',
    title: 'Order Placed & Payment Confirmed',
    description: `Payment authorized via ${order.paymentMethod || 'Secure Checkout'}. Invoice created.`,
    timestamp: `${order.date}, 09:15 AM`,
    location: 'Digital Store Portal',
    completed: true,
    current: status === 'Processing' && false
  });

  // 2. Processing Stage
  const isProcessingCompleted = status === 'Shipped' || status === 'Delivered';
  events.push({
    id: 'evt_2',
    stage: 'processing',
    title: 'Packed & Inspected at Warehouse',
    description: 'Items picked from inventory, security sealed and prepared for express dispatch.',
    timestamp: `${order.date}, 02:40 PM`,
    location: 'Primary Fulfillment Center #4',
    completed: isProcessingCompleted || status === 'Processing',
    current: status === 'Processing'
  });

  // 3. Shipped Stage
  const isShippedCompleted = status === 'Delivered';
  const isShippedCurrent = status === 'Shipped';
  events.push({
    id: 'evt_3',
    stage: 'shipped',
    title: 'In Transit with Express Courier',
    description: `Package loaded onto ${carrier} transport vehicle. In route to sorting hub.`,
    timestamp: isShippedCompleted || isShippedCurrent ? `${order.date}, 07:10 PM` : 'Pending Transit',
    location: 'Central Logistics Hub',
    completed: isShippedCompleted || isShippedCurrent,
    current: isShippedCurrent
  });

  // 4. Out for Delivery Stage
  const isOutCompleted = status === 'Delivered';
  events.push({
    id: 'evt_4',
    stage: 'out_for_delivery',
    title: 'Out for Local Delivery',
    description: 'Courier agent dispatched to final delivery address. Signature required.',
    timestamp: isOutCompleted ? `${estimatedDeliveryDate}, 08:30 AM` : 'Scheduled',
    location: fullLoc,
    completed: isOutCompleted,
    current: false
  });

  // 5. Delivered Stage
  const isDeliveredCurrent = status === 'Delivered';
  events.push({
    id: 'evt_5',
    stage: 'delivered',
    title: 'Package Delivered',
    description: `Handed directly to recipient or left at designated secure location (${fullLoc}).`,
    timestamp: isDeliveredCurrent ? `${estimatedDeliveryDate}, 01:15 PM` : 'Pending Delivery',
    location: fullLoc,
    completed: isDeliveredCurrent,
    current: isDeliveredCurrent
  });

  let currentStage: OrderTrackingInfo['currentStage'] = 'processing';
  if (status === 'Shipped') currentStage = 'shipped';
  if (status === 'Delivered') currentStage = 'delivered';

  return {
    trackingNumber,
    carrier,
    carrierService,
    estimatedDeliveryDate,
    currentStage,
    events
  };
}

function syncTrackingWithOrderStatus(
  info: OrderTrackingInfo,
  status: Order['status'],
  shippingDetails?: Order['shippingDetails']
): OrderTrackingInfo {
  if (status === 'Cancelled') {
    return {
      ...info,
      estimatedDeliveryDate: 'Cancelled',
      currentStage: 'cancelled',
      events: info.events.map((e) => ({
        ...e,
        current: e.stage === 'cancelled',
        completed: e.stage === 'placed' || e.stage === 'cancelled'
      }))
    };
  }

  let currentStage: OrderTrackingInfo['currentStage'] = 'processing';
  if (status === 'Shipped') currentStage = 'shipped';
  if (status === 'Delivered') currentStage = 'delivered';

  const updatedEvents = info.events.map((evt) => {
    if (evt.stage === 'placed') return { ...evt, completed: true, current: false };
    if (evt.stage === 'processing') return { ...evt, completed: true, current: currentStage === 'processing' };
    if (evt.stage === 'shipped') return { ...evt, completed: currentStage === 'shipped' || currentStage === 'delivered', current: currentStage === 'shipped' };
    if (evt.stage === 'out_for_delivery') return { ...evt, completed: currentStage === 'delivered', current: false };
    if (evt.stage === 'delivered') return { ...evt, completed: currentStage === 'delivered', current: currentStage === 'delivered' };
    return evt;
  });

  return {
    ...info,
    currentStage,
    events: updatedEvents
  };
}

export function getStageProgressPercent(stage: OrderTrackingInfo['currentStage']): number {
  switch (stage) {
    case 'placed':
      return 15;
    case 'processing':
      return 40;
    case 'shipped':
      return 70;
    case 'out_for_delivery':
      return 88;
    case 'delivered':
      return 100;
    case 'cancelled':
      return 0;
    default:
      return 25;
  }
}
