from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import models
from django.db.models import Sum, Count, Avg, Q
from django.utils import timezone
from datetime import timedelta
from apps.orders.models import Order, OrderItem
from apps.products.models import Product, Category
from apps.users.models import User


class SalesReportView(APIView):
    """Admin: Generate sales report."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)

        orders = Order.objects.filter(
            order_date__gte=start_date,
            order_status__in=['confirmed', 'processing', 'shipped', 'delivered']
        )

        total_revenue = orders.aggregate(total=Sum('total_amount'))['total'] or 0
        total_orders = orders.count()
        avg_order_value = orders.aggregate(avg=Avg('total_amount'))['avg'] or 0

        # Daily breakdown
        daily_sales = []
        for i in range(days):
            day = timezone.now() - timedelta(days=i)
            day_orders = orders.filter(order_date__date=day.date())
            daily_sales.append({
                'date': day.date().isoformat(),
                'orders': day_orders.count(),
                'revenue': float(day_orders.aggregate(t=Sum('total_amount'))['t'] or 0),
            })

        # Top selling products
        top_products = (
            OrderItem.objects.filter(order__in=orders)
            .values('product_name')
            .annotate(
                total_sold=Sum('quantity'),
                total_revenue=Sum('subtotal')
            )
            .order_by('-total_sold')[:10]
        )

        return Response({
            'period_days': days,
            'total_revenue': float(total_revenue),
            'total_orders': total_orders,
            'avg_order_value': round(float(avg_order_value), 2),
            'daily_sales': daily_sales,
            'top_products': list(top_products),
        })


class ProductReportView(APIView):
    """Admin: Generate product report."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        products = Product.objects.filter(is_active=True)

        # Category-wise breakdown
        categories = Category.objects.annotate(
            product_count=Count('products', filter=models.Q(products__is_active=True)),
            total_stock=Sum('products__stock_quantity', filter=models.Q(products__is_active=True)),
        ).values('name', 'product_count', 'total_stock')

        low_stock = products.filter(stock_quantity__lte=5).values(
            'name', 'stock_quantity', 'price'
        )

        out_of_stock = products.filter(stock_quantity=0).count()

        return Response({
            'total_products': products.count(),
            'out_of_stock': out_of_stock,
            'low_stock_count': low_stock.count(),
            'low_stock_items': list(low_stock),
            'categories': list(categories),
        })


class CustomerReportView(APIView):
    """Admin: Generate customer report."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        customers = User.objects.filter(role='customer')

        # Top customers by order value
        top_customers = (
            Order.objects.filter(
                order_status__in=['confirmed', 'processing', 'shipped', 'delivered']
            )
            .values('user__username', 'user__email', 'user__first_name', 'user__last_name')
            .annotate(
                total_orders=Count('id'),
                total_spent=Sum('total_amount')
            )
            .order_by('-total_spent')[:10]
        )

        return Response({
            'total_customers': customers.count(),
            'active_customers': customers.filter(is_active=True).count(),
            'new_this_month': customers.filter(
                date_joined__gte=timezone.now() - timedelta(days=30)
            ).count(),
            'top_customers': list(top_customers),
        })
