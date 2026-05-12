from django.urls import path
from . import views

urlpatterns = [
    # Customer Orders
    path('create/', views.CreateOrderView.as_view(), name='create-order'),
    path('', views.OrderListView.as_view(), name='order-list'),
    path('<int:pk>/', views.OrderDetailView.as_view(), name='order-detail'),
    
    # Notifications
    path('notifications/', views.NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/read/', views.MarkNotificationReadView.as_view(), name='notification-read'),

    # Admin Orders
    path('admin/', views.AdminOrderListView.as_view(), name='admin-order-list'),
    path('admin/<int:pk>/', views.AdminOrderDetailView.as_view(), name='admin-order-detail'),
    path('admin/<int:pk>/processing/', views.AdminProcessOrderView.as_view(), name='admin-order-processing'),
    path('admin/<int:pk>/delivered/', views.AdminDeliverOrderView.as_view(), name='admin-order-delivered'),
    path('admin/dashboard/', views.AdminDashboardView.as_view(), name='admin-dashboard'),
]
