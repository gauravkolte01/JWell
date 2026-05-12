from django.utils import timezone
from .models import Order, SupplierRequest, ActivityLog, Notification

class OrderStateMachine:
    """Service layer enforcing order state transitions and generating audit trails."""

    VALID_TRANSITIONS = {
        'pending': ['confirmed', 'cancelled'],
        'confirmed': ['processing', 'cancelled'],
        'processing': ['shipped', 'cancelled'],
        'shipped': ['delivered', 'returned'],
        'delivered': ['returned'],
        'cancelled': [],
        'returned': [],
    }

    @staticmethod
    def validate_transition(order, new_status, actor_role):
        """Validate if a transition is allowed for the given order and role."""
        if new_status not in OrderStateMachine.VALID_TRANSITIONS.get(order.order_status, []):
            return False, f"Invalid transition from {order.order_status} to {new_status}"

        # Role-based enforcement
        if actor_role == 'admin':
            if new_status == 'processing' and order.order_status != 'confirmed':
                return False, "Admin can only process confirmed orders."
            if new_status == 'delivered':
                # Admin can only mark delivered if supplier has shipped
                if not hasattr(order, 'supplier_request') or order.supplier_request.status != 'shipped':
                    return False, "Order must be shipped by the supplier before marking as delivered."
        
        elif actor_role == 'supplier':
            if new_status != 'shipped':
                return False, "Suppliers can only mark orders as shipped."
            if order.order_status != 'processing':
                return False, "Order must be processing before supplier can ship."

        return True, ""

    @staticmethod
    def _log_activity(order, action, user=None, old_val='', new_val='', details=''):
        ActivityLog.objects.create(
            order=order,
            action=action,
            performed_by=user,
            old_value=old_val,
            new_value=new_val,
            details=details
        )

    @staticmethod
    def _notify(user, order, message, notif_type):
        Notification.objects.create(
            user=user,
            order=order,
            message=message,
            notification_type=notif_type
        )

    @staticmethod
    def process_order(order, admin_user, supplier):
        """Admin action: Confirmed -> Processing + Assign Supplier"""
        is_valid, err = OrderStateMachine.validate_transition(order, 'processing', 'admin')
        if not is_valid:
            raise ValueError(err)

        old_status = order.order_status
        order.order_status = 'processing'
        order.save()

        # Create Supplier Request
        supplier_req = SupplierRequest.objects.create(
            order=order,
            supplier=supplier,
            status='pending'
        )

        OrderStateMachine._log_activity(
            order, 'Status Changed', admin_user, old_status, 'processing',
            f"Order assigned to supplier: {supplier.name}"
        )
        
        if supplier.user:
            OrderStateMachine._notify(
                supplier.user, order,
                f"New order request #{order.id} requires fulfillment.",
                'supplier_assigned'
            )

        return order, supplier_req

    @staticmethod
    def mark_shipped(order, supplier_user, tracking_number=None):
        """Supplier action: Processing -> Shipped"""
        is_valid, err = OrderStateMachine.validate_transition(order, 'shipped', 'supplier')
        if not is_valid:
            raise ValueError(err)

        old_status = order.order_status
        now = timezone.now()
        
        order.order_status = 'shipped'
        order.shipped_at = now
        if tracking_number:
            order.tracking_number = tracking_number
        order.save()

        # Update Supplier Request
        req = order.supplier_request
        req.status = 'shipped'
        req.shipped_at = now
        req.save()

        OrderStateMachine._log_activity(
            order, 'Status Changed', supplier_user, old_status, 'shipped',
            f"Order shipped by supplier. Tracking: {tracking_number or 'N/A'}"
        )

        # Notify Customer
        OrderStateMachine._notify(
            order.user, order,
            f"Your order #{order.id} has been shipped!",
            'order_shipped'
        )

        return order

    @staticmethod
    def mark_delivered(order, admin_user):
        """Admin action: Shipped -> Delivered"""
        is_valid, err = OrderStateMachine.validate_transition(order, 'delivered', 'admin')
        if not is_valid:
            raise ValueError(err)

        old_status = order.order_status
        order.order_status = 'delivered'
        order.delivered_at = timezone.now()
        order.save()

        OrderStateMachine._log_activity(
            order, 'Status Changed', admin_user, old_status, 'delivered',
            "Order marked as delivered by admin."
        )

        # Notify Customer
        OrderStateMachine._notify(
            order.user, order,
            f"Your order #{order.id} has been delivered. Thank you for shopping with us!",
            'order_delivered'
        )

        return order
