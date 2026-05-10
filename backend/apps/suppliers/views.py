from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Supplier, Purchase
from .serializers import (
    SupplierSerializer, PurchaseSerializer,
    PurchaseCreateSerializer, SupplierOrderSerializer
)


class IsSupplierUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'supplier'


# ─── Admin Views ──────────────────────────────────────────────

class SupplierListCreateView(generics.ListCreateAPIView):
    """Admin: List/Create suppliers."""
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [permissions.IsAdminUser]
    search_fields = ['name', 'contact', 'email']


class SupplierDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin: Manage individual supplier."""
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [permissions.IsAdminUser]


class PurchaseListCreateView(generics.ListCreateAPIView):
    """Admin: List/Create purchase orders."""
    queryset = Purchase.objects.all()
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ['status', 'supplier']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PurchaseCreateSerializer
        return PurchaseSerializer


class PurchaseDetailView(generics.RetrieveUpdateAPIView):
    """Admin: Manage purchase order."""
    queryset = Purchase.objects.all()
    serializer_class = PurchaseSerializer
    permission_classes = [permissions.IsAdminUser]


# ─── Supplier Views ──────────────────────────────────────────

class SupplierDashboardView(APIView):
    """Supplier: Dashboard stats."""
    permission_classes = [IsSupplierUser]

    def get(self, request):
        try:
            supplier = request.user.supplier_profile
        except Supplier.DoesNotExist:
            return Response({'error': 'Supplier profile not found.'}, status=404)

        purchases = Purchase.objects.filter(supplier=supplier)
        return Response({
            'total_orders': purchases.count(),
            'pending': purchases.filter(status='pending').count(),
            'accepted': purchases.filter(status='accepted').count(),
            'preparing': purchases.filter(status='preparing').count(),
            'dispatched': purchases.filter(status='dispatched').count(),
            'received': purchases.filter(status='received').count(),
        })


class SupplierOrderListView(generics.ListAPIView):
    """Supplier: List incoming purchase orders."""
    serializer_class = SupplierOrderSerializer
    permission_classes = [IsSupplierUser]
    filterset_fields = ['status']

    def get_queryset(self):
        return Purchase.objects.filter(supplier=self.request.user.supplier_profile)


class SupplierOrderUpdateView(APIView):
    """Supplier: Accept/Reject/Update order status."""
    permission_classes = [IsSupplierUser]

    def put(self, request, pk):
        try:
            purchase = Purchase.objects.get(
                pk=pk, supplier=request.user.supplier_profile
            )
        except Purchase.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=404)

        new_status = request.data.get('status')
        valid_transitions = {
            'pending': ['accepted', 'rejected'],
            'accepted': ['preparing'],
            'preparing': ['dispatched'],
        }

        allowed = valid_transitions.get(purchase.status, [])
        if new_status not in allowed:
            return Response(
                {'error': f'Cannot change from {purchase.status} to {new_status}.'},
                status=400
            )

        purchase.status = new_status
        purchase.save()

        # If dispatched, update product stock
        if new_status == 'dispatched':
            product = purchase.product
            product.stock_quantity += purchase.quantity
            product.save(update_fields=['stock_quantity'])

        return Response(SupplierOrderSerializer(purchase).data)
