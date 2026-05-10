from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.CreateOrderView.as_view(), name='create-order'),
    path('', views.OrderListView.as_view(), name='order-list'),
    path('<int:pk>/', views.OrderDetailView.as_view(), name='order-detail'),
    # Admin
    path('admin/', views.AdminOrderListView.as_view(), name='admin-order-list'),
    path('admin/<int:pk>/status/', views.AdminOrderStatusView.as_view(), name='admin-order-status'),
    path('admin/dashboard/', views.AdminDashboardView.as_view(), name='admin-dashboard'),
]
