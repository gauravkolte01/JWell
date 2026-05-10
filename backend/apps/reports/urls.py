from django.urls import path
from . import views

urlpatterns = [
    path('sales/', views.SalesReportView.as_view(), name='sales-report'),
    path('products/', views.ProductReportView.as_view(), name='product-report'),
    path('customers/', views.CustomerReportView.as_view(), name='customer-report'),
]
