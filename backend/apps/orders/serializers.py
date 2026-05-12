from rest_framework import serializers
from .models import Order, OrderItem, SupplierRequest, ActivityLog, Notification


class OrderItemSerializer(serializers.ModelSerializer):
    product_image = serializers.ImageField(source='product.image', read_only=True)

    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_name', 'product_price',
                  'quantity', 'subtotal', 'product_image')


class SupplierRequestSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    
    class Meta:
        model = SupplierRequest
        fields = ('id', 'supplier', 'supplier_name', 'status', 'notes', 
                  'assigned_at', 'accepted_at', 'rejected_at', 'shipped_at')
        read_only_fields = ('assigned_at', 'accepted_at', 'rejected_at', 'shipped_at')


class ActivityLogSerializer(serializers.ModelSerializer):
    performed_by_name = serializers.CharField(source='performed_by.get_full_name', read_only=True)
    
    class Meta:
        model = ActivityLog
        fields = ('id', 'action', 'performed_by_name', 'old_value', 'new_value', 'details', 'timestamp')


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ('id', 'message', 'notification_type', 'is_read', 'created_at', 'order')


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='user.get_full_name', read_only=True)
    customer_email = serializers.CharField(source='user.email', read_only=True)
    supplier_request = SupplierRequestSerializer(read_only=True)

    class Meta:
        model = Order
        fields = ('id', 'user', 'customer_name', 'customer_email', 'order_date',
                  'total_amount', 'order_status', 'payment_status', 'shipping_address',
                  'shipping_city', 'shipping_state', 'shipping_zip',
                  'notes', 'tracking_number', 'items', 'supplier_request', 
                  'shipped_at', 'delivered_at', 'updated_at')
        read_only_fields = ('user', 'order_date', 'total_amount', 'payment_status', 'shipped_at', 'delivered_at')


class AdminOrderDetailSerializer(OrderSerializer):
    """Detailed serializer for Admin including audit logs."""
    activity_logs = ActivityLogSerializer(many=True, read_only=True)
    
    class Meta(OrderSerializer.Meta):
        fields = OrderSerializer.Meta.fields + ('activity_logs',)


class OrderCreateSerializer(serializers.Serializer):
    shipping_address = serializers.CharField()
    shipping_city = serializers.CharField(required=False, allow_blank=True, default='')
    shipping_state = serializers.CharField(required=False, allow_blank=True, default='')
    shipping_zip = serializers.CharField(required=False, allow_blank=True, default='')
    notes = serializers.CharField(required=False, allow_blank=True, default='')


class OrderProcessSerializer(serializers.Serializer):
    """Admin endpoint to assign a supplier and process order."""
    supplier_id = serializers.IntegerField(required=True)
    notes = serializers.CharField(required=False, allow_blank=True)
