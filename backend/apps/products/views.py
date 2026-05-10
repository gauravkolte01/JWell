from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Product
from .serializers import (
    CategorySerializer, ProductListSerializer,
    ProductDetailSerializer, ProductAdminSerializer
)


# ─── Public Views ─────────────────────────────────────────────

class ProductListView(generics.ListAPIView):
    """Public: List all active products with search/filter/sort."""
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_featured']
    search_fields = ['name', 'description', 'material']
    ordering_fields = ['price', 'created_at', 'name', 'view_count']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True)
        # Price range filter
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        return queryset


class ProductDetailView(generics.RetrieveAPIView):
    """Public: Get product details (increments view count)."""
    serializer_class = ProductDetailSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Product.objects.filter(is_active=True)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.view_count += 1
        instance.save(update_fields=['view_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class CategoryListView(generics.ListAPIView):
    """Public: List all active categories."""
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class CategoryProductsView(generics.ListAPIView):
    """Public: List products by category."""
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Product.objects.filter(
            category_id=self.kwargs['category_id'],
            is_active=True
        )


class FeaturedProductsView(generics.ListAPIView):
    """Public: List featured products."""
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        return Product.objects.filter(is_active=True, is_featured=True)[:8]


# ─── Admin Views ──────────────────────────────────────────────

class AdminProductListCreateView(generics.ListCreateAPIView):
    """Admin: List/Create products."""
    queryset = Product.objects.all()
    serializer_class = ProductAdminSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category', 'is_active', 'is_featured']
    search_fields = ['name', 'description']


class AdminProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin: Update/Delete product."""
    queryset = Product.objects.all()
    serializer_class = ProductAdminSerializer
    permission_classes = [permissions.IsAdminUser]


class AdminCategoryListCreateView(generics.ListCreateAPIView):
    """Admin: List/Create categories."""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None


class AdminCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin: Update/Delete category."""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAdminUser]


class LowStockProductsView(generics.ListAPIView):
    """Admin: List products with low stock (<=5)."""
    serializer_class = ProductAdminSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None

    def get_queryset(self):
        return Product.objects.filter(
            stock_quantity__lte=5, is_active=True
        ).order_by('stock_quantity')
