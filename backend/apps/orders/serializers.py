from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    product_image = serializers.ImageField(source='product.image', read_only=True)

    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_name', 'product_price',
                  'quantity', 'subtotal', 'product_image')


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='user.get_full_name', read_only=True)
    customer_email = serializers.CharField(source='user.email', read_only=True)
    payment_status = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ('id', 'user', 'customer_name', 'customer_email', 'order_date',
                  'total_amount', 'order_status', 'shipping_address',
                  'shipping_city', 'shipping_state', 'shipping_zip',
                  'notes', 'tracking_number', 'items', 'payment_status', 'updated_at')
        read_only_fields = ('user', 'order_date', 'total_amount')

    def get_payment_status(self, obj):
        payment = obj.payment.first() if hasattr(obj, 'payment') else None
        return payment.payment_status if payment else 'unpaid'


class OrderCreateSerializer(serializers.Serializer):
    shipping_address = serializers.CharField()
    shipping_city = serializers.CharField(required=False, allow_blank=True, default='')
    shipping_state = serializers.CharField(required=False, allow_blank=True, default='')
    shipping_zip = serializers.CharField(required=False, allow_blank=True, default='')
    notes = serializers.CharField(required=False, allow_blank=True, default='')


class OrderStatusUpdateSerializer(serializers.Serializer):
    order_status = serializers.ChoiceField(choices=Order.STATUS_CHOICES)
    tracking_number = serializers.CharField(required=False, allow_blank=True)
