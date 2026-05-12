from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.shortcuts import get_object_or_404
from .models import Order, OrderItem, Notification
from apps.cart.models import Cart
from apps.suppliers.models import Supplier
from .serializers import (
    OrderSerializer, OrderCreateSerializer, AdminOrderDetailSerializer,
    OrderProcessSerializer, NotificationSerializer
)
from .services import OrderStateMachine


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
    queryset = Order.objects.prefetch_related('supplier_request').all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ['order_status', 'payment_status']
    search_fields = ['user__username', 'user__email', 'id']


class AdminOrderDetailView(generics.RetrieveAPIView):
    """Admin: Get detailed order with activity logs and supplier request."""
    queryset = Order.objects.all()
    serializer_class = AdminOrderDetailSerializer
    permission_classes = [permissions.IsAdminUser]


class AdminProcessOrderView(APIView):
    """Admin: Move order to PROCESSING and assign to a supplier."""
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        serializer = OrderProcessSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        supplier_id = serializer.validated_data['supplier_id']
        supplier = get_object_or_404(Supplier, pk=supplier_id)

        try:
            with transaction.atomic():
                order, req = OrderStateMachine.process_order(order, request.user, supplier)
                if serializer.validated_data.get('notes'):
                    req.notes = serializer.validated_data['notes']
                    req.save(update_fields=['notes'])
            return Response(AdminOrderDetailSerializer(order).data)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class AdminDeliverOrderView(APIView):
    """Admin: Mark order as DELIVERED after supplier ships."""
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        try:
            with transaction.atomic():
                order = OrderStateMachine.mark_delivered(order, request.user)
            return Response(AdminOrderDetailSerializer(order).data)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class AdminDashboardView(APIView):
    """Admin: Dashboard statistics."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from apps.products.models import Product
        from apps.users.models import User
        from django.db.models import Sum
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


# ─── Notifications ────────────────────────────────────────────

class NotificationListView(generics.ListAPIView):
    """List notifications for current user."""
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class MarkNotificationReadView(APIView):
    """Mark a notification as read."""
    def patch(self, request, pk):
        notif = get_object_or_404(Notification, pk=pk, user=request.user)
        notif.is_read = True
        notif.save(update_fields=['is_read'])
        return Response({'status': 'ok'})
