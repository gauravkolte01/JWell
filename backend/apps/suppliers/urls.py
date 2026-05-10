from django.urls import path
from . import views

urlpatterns = [
    # Admin
    path('', views.SupplierListCreateView.as_view(), name='supplier-list'),
    path('<int:pk>/', views.SupplierDetailView.as_view(), name='supplier-detail'),
    path('purchases/', views.PurchaseListCreateView.as_view(), name='purchase-list'),
    path('purchases/<int:pk>/', views.PurchaseDetailView.as_view(), name='purchase-detail'),
    # Supplier
    path('dashboard/', views.SupplierDashboardView.as_view(), name='supplier-dashboard'),
    path('orders/', views.SupplierOrderListView.as_view(), name='supplier-orders'),
    path('orders/<int:pk>/', views.SupplierOrderUpdateView.as_view(), name='supplier-order-update'),
]
