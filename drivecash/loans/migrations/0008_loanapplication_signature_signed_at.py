from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("loans", "0007_applicantaddress_applicantfinancialprofile_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="loanapplication",
            name="signature",
            field=models.TextField(blank=True, null=True, help_text="Customer signature captured at submission"),
        ),
        migrations.AddField(
            model_name="loanapplication",
            name="signed_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
