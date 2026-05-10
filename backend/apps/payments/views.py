import stripe
from django.conf import settings
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Payment
from apps.orders.models import Order
from .serializers import PaymentSerializer, CreateCheckoutSerializer

stripe.api_key = settings.STRIPE_SECRET_KEY


class CreateCheckoutSessionView(APIView):
    """Create a Stripe checkout session for an order."""
    def post(self, request):
        serializer = CreateCheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            order = Order.objects.get(
                id=serializer.validated_data['order_id'],
                user=request.user
            )
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=404)

        # Check if payment already exists
        existing = Payment.objects.filter(order=order, payment_status='completed').first()
        if existing:
            return Response({'error': 'Order already paid.'}, status=400)

        try:
            # Create line items from order items
            line_items = []
            for item in order.items.all():
                line_items.append({
                    'price_data': {
                        'currency': 'inr',
                        'product_data': {
                            'name': item.product_name,
                        },
                        'unit_amount': int(item.product_price * 100),  # Stripe uses paise
                    },
                    'quantity': item.quantity,
                })

            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=line_items,
                mode='payment',
                success_url=f"{settings.FRONTEND_URL}/payment/success?session_id={{CHECKOUT_SESSION_ID}}&order_id={order.id}",
                cancel_url=f"{settings.FRONTEND_URL}/payment/cancel?order_id={order.id}",
                metadata={
                    'order_id': order.id,
                    'user_id': request.user.id,
                },
            )

            # Create payment record
            Payment.objects.create(
                order=order,
                amount=order.total_amount,
                payment_method='stripe',
                stripe_session_id=session.id,
            )

            return Response({
                'session_id': session.id,
                'checkout_url': session.url,
            })

        except stripe.error.StripeError as e:
            return Response({'error': str(e)}, status=400)


@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(APIView):
    """Handle Stripe webhook events."""
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except (ValueError, stripe.error.SignatureVerificationError):
            return Response(status=400)

        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            order_id = session['metadata']['order_id']

            try:
                payment = Payment.objects.get(stripe_session_id=session['id'])
                payment.payment_status = 'completed'
                payment.stripe_payment_intent = session.get('payment_intent', '')
                payment.save()

                order = Order.objects.get(id=order_id)
                order.order_status = 'confirmed'
                order.save()
            except (Payment.DoesNotExist, Order.DoesNotExist):
                pass

        elif event['type'] == 'checkout.session.expired':
            session = event['data']['object']
            try:
                payment = Payment.objects.get(stripe_session_id=session['id'])
                payment.payment_status = 'failed'
                payment.save()
            except Payment.DoesNotExist:
                pass

        return Response({'status': 'ok'})


class PaymentStatusView(APIView):
    """Check payment status for an order."""
    def get(self, request, order_id):
        try:
            payment = Payment.objects.filter(order_id=order_id).latest('created_at')
            return Response(PaymentSerializer(payment).data)
        except Payment.DoesNotExist:
            return Response({'error': 'Payment not found.'}, status=404)


class VerifyPaymentView(APIView):
    """Verify payment after Stripe redirect."""
    def post(self, request):
        session_id = request.data.get('session_id')
        if not session_id:
            return Response({'error': 'Session ID required.'}, status=400)

        try:
            session = stripe.checkout.Session.retrieve(session_id)
            payment = Payment.objects.get(stripe_session_id=session_id)

            if session.payment_status == 'paid':
                payment.payment_status = 'completed'
                payment.stripe_payment_intent = session.payment_intent
                payment.save()

                order = payment.order
                if order.order_status == 'pending':
                    order.order_status = 'confirmed'
                    order.save()

                return Response({
                    'status': 'success',
                    'payment': PaymentSerializer(payment).data
                })
            else:
                return Response({
                    'status': 'pending',
                    'payment': PaymentSerializer(payment).data
                })

        except stripe.error.StripeError as e:
            return Response({'error': str(e)}, status=400)
        except Payment.DoesNotExist:
            return Response({'error': 'Payment not found.'}, status=404)


class RefundView(APIView):
    """Admin: Process refund for a payment."""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, payment_id):
        try:
            payment = Payment.objects.get(id=payment_id, payment_status='completed')
        except Payment.DoesNotExist:
            return Response({'error': 'Payment not found or not refundable.'}, status=404)

        try:
            stripe.Refund.create(payment_intent=payment.stripe_payment_intent)
            payment.payment_status = 'refunded'
            payment.save()

            payment.order.order_status = 'returned'
            payment.order.save()

            return Response({'message': 'Refund processed successfully.'})
        except stripe.error.StripeError as e:
            return Response({'error': str(e)}, status=400)
