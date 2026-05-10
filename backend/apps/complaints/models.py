from django.db import models
from django.conf import settings


class Complaint(models.Model):
    """Customer complaint or return request."""
    STATUS_CHOICES = (
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    )
    TYPE_CHOICES = (
        ('complaint', 'Complaint'),
        ('return', 'Return Request'),
        ('refund', 'Refund Request'),
        ('other', 'Other'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='complaints')
    order = models.ForeignKey('orders.Order', on_delete=models.CASCADE, related_name='complaints')
    complaint_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='complaint')
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    admin_response = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'complaints'
        ordering = ['-created_at']

    def __str__(self):
        return f"Complaint #{self.id} - {self.complaint_type}"
