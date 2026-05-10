from rest_framework import serializers
from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ('id', 'name', 'description', 'image', 'is_active', 'product_count', 'created_at')

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for product listing."""
    category_name = serializers.CharField(source='category.name', read_only=True)
    discounted_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = ('id', 'name', 'price', 'discount', 'discounted_price',
                  'image', 'category', 'category_name', 'is_in_stock',
                  'is_featured', 'material', 'created_at')


class ProductDetailSerializer(serializers.ModelSerializer):
    """Full serializer for product detail view."""
    category_name = serializers.CharField(source='category.name', read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True, default=None)
    discounted_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = '__all__'


class ProductAdminSerializer(serializers.ModelSerializer):
    """Serializer for admin product CRUD."""
    class Meta:
        model = Product
        fields = '__all__'
