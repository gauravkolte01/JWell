from django.db import models


class Payment(models.Model):
    """Payment record linked to an order."""
    METHOD_CHOICES = (
        ('stripe', 'Stripe'),
        ('cod', 'Cash on Delivery'),
    )
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )

    order = models.ForeignKey('orders.Order', on_delete=models.CASCADE, related_name='payment')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=METHOD_CHOICES, default='stripe')
    payment_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    stripe_payment_intent = models.CharField(max_length=255, blank=True, null=True)
    stripe_session_id = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'payments'
        ordering = ['-created_at']

    def __str__(self):
        return f"Payment #{self.id} - Order #{self.order.id} - {self.payment_status}"
