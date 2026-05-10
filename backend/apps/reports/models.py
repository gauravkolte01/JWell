from django.db import models


class Report(models.Model):
    """Generated report record."""
    REPORT_TYPES = (
        ('sales', 'Sales Report'),
        ('products', 'Product Report'),
        ('customers', 'Customer Report'),
    )

    report_type = models.CharField(max_length=20, choices=REPORT_TYPES)
    generated_date = models.DateTimeField(auto_now_add=True)
    data = models.JSONField(default=dict)
    generated_by = models.ForeignKey(
        'users.User', on_delete=models.SET_NULL, null=True
    )

    class Meta:
        db_table = 'reports'
        ordering = ['-generated_date']

    def __str__(self):
        return f"{self.get_report_type_display()} - {self.generated_date}"
