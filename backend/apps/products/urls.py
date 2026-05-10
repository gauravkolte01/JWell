from django.urls import path
from . import views

urlpatterns = [
    # Public
    path('', views.ProductListView.as_view(), name='product-list'),
    path('<int:pk>/', views.ProductDetailView.as_view(), name='product-detail'),
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    path('categories/<int:category_id>/', views.CategoryProductsView.as_view(), name='category-products'),
    path('featured/', views.FeaturedProductsView.as_view(), name='featured-products'),
    # Admin
    path('admin/', views.AdminProductListCreateView.as_view(), name='admin-product-list'),
    path('admin/<int:pk>/', views.AdminProductDetailView.as_view(), name='admin-product-detail'),
    path('admin/categories/', views.AdminCategoryListCreateView.as_view(), name='admin-category-list'),
    path('admin/categories/<int:pk>/', views.AdminCategoryDetailView.as_view(), name='admin-category-detail'),
    path('admin/low-stock/', views.LowStockProductsView.as_view(), name='low-stock-products'),
]
