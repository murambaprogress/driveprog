from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('loans', '0009_loanapplication_ai_analysis_data_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='loanapplication',
            name='approved_amount',
            field=models.DecimalField(blank=True, decimal_places=2, help_text='Final approved loan amount after underwriting', max_digits=12, null=True),
        ),
        migrations.AddField(
            model_name='loanapplication',
            name='approved_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='loanapplication',
            name='approved_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='approved_loans', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='loanapplication',
            name='approval_notes',
            field=models.TextField(blank=True, default=''),
        ),
    ]
