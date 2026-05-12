from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Supplier, Purchase
from apps.orders.models import SupplierRequest
from apps.orders.services import OrderStateMachine
from .serializers import (
    SupplierSerializer, PurchaseSerializer, PurchaseCreateSerializer,
    SupplierRequestDetailSerializer
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
    """Admin: List/Create internal purchase orders (inventory)."""
    queryset = Purchase.objects.all()
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ['status', 'supplier']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PurchaseCreateSerializer
        return PurchaseSerializer


class PurchaseDetailView(generics.RetrieveUpdateAPIView):
    """Admin: Manage internal purchase order."""
    queryset = Purchase.objects.all()
    serializer_class = PurchaseSerializer
    permission_classes = [permissions.IsAdminUser]


# ─── Supplier Order Fulfillment Views ───────────────────────────

class SupplierDashboardView(APIView):
    """Supplier: Dashboard stats based on SupplierRequests."""
    permission_classes = [IsSupplierUser]

    def get(self, request):
        try:
            supplier = request.user.supplier_profile
        except Supplier.DoesNotExist:
            return Response({'error': 'Supplier profile not found.'}, status=404)

        requests = SupplierRequest.objects.filter(supplier=supplier)
        return Response({
            'total_requests': requests.count(),
            'pending': requests.filter(status='pending').count(),
            'accepted': requests.filter(status='accepted').count(),
            'shipped': requests.filter(status='shipped').count(),
            'rejected': requests.filter(status='rejected').count(),
        })


class SupplierOrderListView(generics.ListAPIView):
    """Supplier: List incoming order requests for fulfillment."""
    serializer_class = SupplierRequestDetailSerializer
    permission_classes = [IsSupplierUser]
    filterset_fields = ['status']

    def get_queryset(self):
        return SupplierRequest.objects.filter(supplier=self.request.user.supplier_profile)


class SupplierAcceptOrderView(APIView):
    """Supplier: Accept an order request."""
    permission_classes = [IsSupplierUser]

    def patch(self, request, pk):
        req = get_object_or_404(SupplierRequest, pk=pk, supplier=request.user.supplier_profile)
        if req.status != 'pending':
            return Response({'error': 'Only pending requests can be accepted.'}, status=400)
            
        req.status = 'accepted'
        req.accepted_at = timezone.now()
        req.save()
        
        OrderStateMachine._log_activity(
            req.order, 'Supplier Accepted', request.user, 'pending', 'accepted',
            f"Supplier {req.supplier.name} accepted the request."
        )
        
        # Notify admin
        OrderStateMachine._notify(
            req.order.user, req.order, 
            f"Supplier {req.supplier.name} has accepted order #{req.order.id}.",
            'supplier_accepted'
        )
        
        return Response(SupplierRequestDetailSerializer(req).data)


class SupplierRejectOrderView(APIView):
    """Supplier: Reject an order request."""
    permission_classes = [IsSupplierUser]

    def patch(self, request, pk):
        req = get_object_or_404(SupplierRequest, pk=pk, supplier=request.user.supplier_profile)
        if req.status != 'pending':
            return Response({'error': 'Only pending requests can be rejected.'}, status=400)
            
        req.status = 'rejected'
        req.rejected_at = timezone.now()
        req.save()

        OrderStateMachine._log_activity(
            req.order, 'Supplier Rejected', request.user, 'pending', 'rejected',
            f"Supplier {req.supplier.name} rejected the request."
        )

        return Response(SupplierRequestDetailSerializer(req).data)


class SupplierShipOrderView(APIView):
    """Supplier: Mark an accepted request as shipped."""
    permission_classes = [IsSupplierUser]

    def patch(self, request, pk):
        req = get_object_or_404(SupplierRequest, pk=pk, supplier=request.user.supplier_profile)
        if req.status != 'accepted':
            return Response({'error': 'Only accepted requests can be shipped.'}, status=400)
            
        tracking_number = request.data.get('tracking_number')
        
        try:
            order = OrderStateMachine.mark_shipped(req.order, request.user, tracking_number)
            req.refresh_from_db()
            return Response(SupplierRequestDetailSerializer(req).data)
        except ValueError as e:
            return Response({'error': str(e)}, status=400)
