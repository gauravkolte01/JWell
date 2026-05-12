from rest_framework import serializers
from .models import Supplier, Purchase
from apps.orders.models import SupplierRequest, OrderItem

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'

class PurchaseSerializer(serializers.ModelSerializer):
    """Admin-only view of internal purchases."""
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = Purchase
        fields = '__all__'
        read_only_fields = ('total_cost',)

class PurchaseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Purchase
        fields = ('supplier', 'product', 'quantity', 'unit_cost', 'notes')

    def create(self, validated_data):
        validated_data['total_cost'] = validated_data['quantity'] * validated_data['unit_cost']
        return super().create(validated_data)

# --- Supplier Order Workflow Serializers ---

class SupplierRequestItemSerializer(serializers.ModelSerializer):
    """Items for a specific supplier request."""
    product_image = serializers.ImageField(source='product.image', read_only=True)

    class Meta:
        model = OrderItem
        fields = ('id', 'product_name', 'product_price', 'quantity', 'product_image')

class SupplierRequestDetailSerializer(serializers.ModelSerializer):
    """Detailed view of an order request for a supplier."""
    order_id = serializers.IntegerField(source='order.id', read_only=True)
    order_date = serializers.DateTimeField(source='order.order_date', read_only=True)
    shipping_address = serializers.CharField(source='order.shipping_address', read_only=True)
    shipping_city = serializers.CharField(source='order.shipping_city', read_only=True)
    shipping_state = serializers.CharField(source='order.shipping_state', read_only=True)
    shipping_zip = serializers.CharField(source='order.shipping_zip', read_only=True)
    items = SupplierRequestItemSerializer(source='order.items', many=True, read_only=True)

    class Meta:
        model = SupplierRequest
        fields = ('id', 'order_id', 'order_date', 'shipping_address', 'shipping_city',
                  'shipping_state', 'shipping_zip', 'status', 'notes', 'items',
                  'assigned_at', 'accepted_at', 'shipped_at')
        read_only_fields = ('assigned_at', 'accepted_at', 'shipped_at')
