from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from .models import Order, OrderItem
from apps.cart.models import Cart
from .serializers import (
    OrderSerializer, OrderCreateSerializer, OrderStatusUpdateSerializer
)


class CreateOrderView(APIView):
    """Create order from cart items."""
    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response({'error': 'Cart is empty.'}, status=400)

        cart_items = cart.items.select_related('product').all()
        if not cart_items.exists():
            return Response({'error': 'Cart is empty.'}, status=400)

        # Validate stock
        for item in cart_items:
            if item.quantity > item.product.stock_quantity:
                return Response(
                    {'error': f'Insufficient stock for {item.product.name}.'},
                    status=400
                )

        with transaction.atomic():
            # Create order
            total = sum(item.subtotal for item in cart_items)
            order = Order.objects.create(
                user=request.user,
                total_amount=total,
                **serializer.validated_data
            )

            # Create order items and reduce stock
            for item in cart_items:
                OrderItem.objects.create(
                    order=order,
                    product=item.product,
                    product_name=item.product.name,
                    product_price=item.product.discounted_price,
                    quantity=item.quantity,
                    subtotal=item.subtotal,
                )
                item.product.stock_quantity -= item.quantity
                item.product.save(update_fields=['stock_quantity'])

            # Clear cart
            cart.items.all().delete()

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderListView(generics.ListAPIView):
    """Customer: List own orders."""
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


class OrderDetailView(generics.RetrieveAPIView):
    """Customer: View order details."""
    serializer_class = OrderSerializer

    def get_queryset(self):
        if self.request.user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(user=self.request.user)


# ─── Admin Views ──────────────────────────────────────────────

class AdminOrderListView(generics.ListAPIView):
    """Admin: List all orders."""
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ['order_status']
    search_fields = ['user__username', 'user__email', 'id']


class AdminOrderStatusView(APIView):
    """Admin: Update order status."""
    permission_classes = [permissions.IsAdminUser]

    def put(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=404)

        serializer = OrderStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order.order_status = serializer.validated_data['order_status']
        if serializer.validated_data.get('tracking_number'):
            order.tracking_number = serializer.validated_data['tracking_number']
        order.save()

        return Response(OrderSerializer(order).data)


class AdminDashboardView(APIView):
    """Admin: Dashboard statistics."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from apps.products.models import Product
        from apps.users.models import User
        from django.db.models import Sum, Count
        from django.utils import timezone
        from datetime import timedelta

        now = timezone.now()
        month_ago = now - timedelta(days=30)

        total_orders = Order.objects.count()
        total_revenue = Order.objects.filter(
            order_status__in=['confirmed', 'processing', 'shipped', 'delivered']
        ).aggregate(total=Sum('total_amount'))['total'] or 0

        monthly_revenue = Order.objects.filter(
            order_date__gte=month_ago,
            order_status__in=['confirmed', 'processing', 'shipped', 'delivered']
        ).aggregate(total=Sum('total_amount'))['total'] or 0

        return Response({
            'total_orders': total_orders,
            'pending_orders': Order.objects.filter(order_status='pending').count(),
            'total_revenue': float(total_revenue),
            'monthly_revenue': float(monthly_revenue),
            'total_products': Product.objects.filter(is_active=True).count(),
            'low_stock_products': Product.objects.filter(stock_quantity__lte=5, is_active=True).count(),
            'total_customers': User.objects.filter(role='customer').count(),
            'recent_orders': OrderSerializer(
                Order.objects.all()[:5], many=True
            ).data,
        })
