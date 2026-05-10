from django.urls import path
from . import views

urlpatterns = [
    path('', views.CartView.as_view(), name='cart-view'),
    path('add/', views.AddToCartView.as_view(), name='cart-add'),
    path('update/<int:pk>/', views.UpdateCartItemView.as_view(), name='cart-update'),
    path('remove/<int:pk>/', views.RemoveCartItemView.as_view(), name='cart-remove'),
    path('clear/', views.ClearCartView.as_view(), name='cart-clear'),
]
