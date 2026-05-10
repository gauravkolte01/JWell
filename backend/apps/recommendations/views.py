from decimal import Decimal
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count, Q, F
from django.utils import timezone
from datetime import timedelta
from apps.products.models import Product
from apps.products.serializers import ProductListSerializer
from apps.orders.models import OrderItem


class RelatedProductsView(APIView):
    """Get related products based on category and price range."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, product_id):
        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=404)

        # Same category products
        category_products = Product.objects.filter(
            category=product.category,
            is_active=True
        ).exclude(id=product.id)

        # Similar price range (±30%)
        min_price = product.price * Decimal('0.7')
        max_price = product.price * Decimal('1.3')
        price_products = Product.objects.filter(
            price__gte=min_price,
            price__lte=max_price,
            is_active=True
        ).exclude(id=product.id)

        # Combine and deduplicate, prioritize category matches
        combined_ids = list(category_products.values_list('id', flat=True)[:6])
        for pid in price_products.values_list('id', flat=True)[:4]:
            if pid not in combined_ids:
                combined_ids.append(pid)
            if len(combined_ids) >= 8:
                break

        related = Product.objects.filter(id__in=combined_ids)
        serializer = ProductListSerializer(related, many=True)
        return Response(serializer.data)


class TrendingProductsView(APIView):
    """Get trending products based on recent orders and views."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        month_ago = timezone.now() - timedelta(days=30)

        # Most ordered in last 30 days
        trending_ids = (
            OrderItem.objects.filter(order__order_date__gte=month_ago)
            .values('product_id')
            .annotate(order_count=Count('id'))
            .order_by('-order_count')
            .values_list('product_id', flat=True)[:8]
        )

        if len(trending_ids) < 8:
            # Fallback to most viewed
            extra = Product.objects.filter(
                is_active=True
            ).exclude(
                id__in=trending_ids
            ).order_by('-view_count').values_list('id', flat=True)[:8 - len(trending_ids)]
            trending_ids = list(trending_ids) + list(extra)

        products = Product.objects.filter(id__in=trending_ids, is_active=True)
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)


class RecommendedForUserView(APIView):
    """Get personalized recommendations based on user's order history."""

    def get(self, request):
        # Get categories the user has ordered from
        ordered_categories = (
            OrderItem.objects.filter(order__user=request.user)
            .values_list('product__category_id', flat=True)
            .distinct()
        )

        if ordered_categories:
            products = Product.objects.filter(
                category_id__in=ordered_categories,
                is_active=True
            ).exclude(
                id__in=OrderItem.objects.filter(
                    order__user=request.user
                ).values_list('product_id', flat=True)
            ).order_by('-view_count', '-created_at')[:8]
        else:
            # Fallback: featured or popular products
            products = Product.objects.filter(
                is_active=True
            ).order_by('-view_count', '-is_featured')[:8]

        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)
