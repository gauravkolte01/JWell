from django.urls import path
from . import views

urlpatterns = [
    path('related/<int:product_id>/', views.RelatedProductsView.as_view(), name='related-products'),
    path('trending/', views.TrendingProductsView.as_view(), name='trending-products'),
    path('for-you/', views.RecommendedForUserView.as_view(), name='recommended-for-user'),
]
