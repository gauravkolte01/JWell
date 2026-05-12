from django.urls import path
from . import views

urlpatterns = [
    # Admin — Supplier Management
    path('', views.SupplierListCreateView.as_view(), name='supplier-list'),
    path('<int:pk>/', views.SupplierDetailView.as_view(), name='supplier-detail'),
    
    # Admin — Internal Purchases (Inventory)
    path('purchases/', views.PurchaseListCreateView.as_view(), name='purchase-list'),
    path('purchases/<int:pk>/', views.PurchaseDetailView.as_view(), name='purchase-detail'),
    
    # Supplier — Order Fulfillment Workflow
    path('dashboard/', views.SupplierDashboardView.as_view(), name='supplier-dashboard'),
    path('orders/', views.SupplierOrderListView.as_view(), name='supplier-orders'),
    path('orders/<int:pk>/accept/', views.SupplierAcceptOrderView.as_view(), name='supplier-order-accept'),
    path('orders/<int:pk>/reject/', views.SupplierRejectOrderView.as_view(), name='supplier-order-reject'),
    path('orders/<int:pk>/shipped/', views.SupplierShipOrderView.as_view(), name='supplier-order-shipped'),
]
