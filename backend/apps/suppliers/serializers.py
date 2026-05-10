from rest_framework import serializers
from .models import Supplier, Purchase
from apps.products.serializers import ProductListSerializer


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'


class PurchaseSerializer(serializers.ModelSerializer):
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


class SupplierOrderSerializer(serializers.ModelSerializer):
    """Serializer for supplier's view of purchase orders."""
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.ImageField(source='product.image', read_only=True)

    class Meta:
        model = Purchase
        fields = ('id', 'product', 'product_name', 'product_image',
                  'quantity', 'unit_cost', 'total_cost', 'status',
                  'notes', 'purchase_date', 'updated_at')
        read_only_fields = ('product', 'quantity', 'unit_cost', 'total_cost', 'purchase_date')
