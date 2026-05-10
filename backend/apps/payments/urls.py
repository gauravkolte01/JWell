from django.urls import path
from . import views

urlpatterns = [
    path('create-checkout-session/', views.CreateCheckoutSessionView.as_view(), name='create-checkout'),
    path('webhook/', views.StripeWebhookView.as_view(), name='stripe-webhook'),
    path('verify/', views.VerifyPaymentView.as_view(), name='verify-payment'),
    path('status/<int:order_id>/', views.PaymentStatusView.as_view(), name='payment-status'),
    path('refund/<int:payment_id>/', views.RefundView.as_view(), name='refund'),
]
