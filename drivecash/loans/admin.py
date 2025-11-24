from django.contrib import admin
from django.utils.html import format_html
from .models import LoanApplication, LoanApplicationNote, LoanApplicationDocument, VehicleValuation


@admin.register(LoanApplication)
class LoanApplicationAdmin(admin.ModelAdmin):
    list_display = ['application_id', 'get_full_name', 'get_email', 'status', 'amount', 'ai_approval_suggestion', 'ai_risk_assessment', 'is_draft', 'created_at']
    list_filter = ['status', 'is_draft', 'ai_approval_suggestion', 'ai_risk_assessment', 'financial_profile__employment_status', 'created_at']
    search_fields = ['personal_info__first_name', 'personal_info__last_name', 'personal_info__email', 'personal_info__phone', 'application_id']
    readonly_fields = [
        'application_id', 'created_at', 'updated_at', 'submitted_at',
        'personal_info_display', 'identification_info_display',
        'financial_profile_display', 'address_display', 'vehicle_info_display',
        'ai_recommendation_display', 'ai_analysis_timestamp'
    ]
    
    fieldsets = (
        ('Application Info', {
            'fields': ('application_id', 'user', 'status', 'is_draft', 'accept_terms')
        }),
        ('Loan Details', {
            'fields': ('amount', 'term', 'purpose', 'credit_score', 'applicant_estimated_value')
        }),
        ('AI Analysis & Recommendations', {
            'fields': ('ai_recommendation_display', 'ai_analysis_timestamp'),
            'classes': ('wide',)
        }),
        ('Personal Information', {
            'fields': ('personal_info_display',)
        }),
        ('Identification', {
            'fields': ('identification_info_display',)
        }),
        ('Financial Profile', {
            'fields': ('financial_profile_display',)
        }),
        ('Address', {
            'fields': ('address_display',)
        }),
        ('Vehicle Information', {
            'fields': ('vehicle_info_display',)
        }),
        ('Uploaded Documents', {
            'fields': (
                'photo_vin_sticker', 'photo_odometer', 'photo_borrower', 'photo_front_car',
                'photo_vin', 'photo_license', 'photo_insurance'
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'submitted_at')
        }),
    )
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    get_full_name.short_description = 'Full Name'

    def get_email(self, obj):
        return obj.personal_info.email if obj.personal_info else ''
    get_email.short_description = 'Email'
    
    def ai_recommendation_display(self, obj):
        """Display AI analysis and recommendations in a formatted way"""
        if not obj.ai_recommendation:
            return format_html('<em style="color: gray;">No AI analysis available yet</em>')
        
        # Determine colors based on risk and suggestion
        risk_colors = {
            'low': '#28a745',
            'medium': '#ffc107',
            'high': '#fd7e14',
            'very_high': '#dc3545'
        }
        suggestion_colors = {
            'approve': '#28a745',
            'conditional': '#17a2b8',
            'review': '#ffc107',
            'reject': '#dc3545'
        }
        
        risk_color = risk_colors.get(obj.ai_risk_assessment, '#6c757d')
        suggestion_color = suggestion_colors.get(obj.ai_approval_suggestion, '#6c757d')
        
        # Get additional analysis data
        ai_data = obj.ai_analysis_data or {}
        strengths = ai_data.get('key_strengths', [])
        concerns = ai_data.get('key_concerns', [])
        conditions = ai_data.get('conditions_for_approval', [])
        suggested_amount = ai_data.get('suggested_loan_amount', 0)
        confidence = ai_data.get('confidence_score', 0)
        
        html = f'''
        <div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px; background: #f8f9fa;">
            <div style="margin-bottom: 15px;">
                <strong style="font-size: 14px;">AI Recommendation:</strong>
                <div style="margin-top: 8px;">
                    <span style="background-color: {suggestion_color}; color: white; padding: 4px 12px; border-radius: 3px; font-weight: bold; text-transform: uppercase;">
                        {obj.ai_approval_suggestion or 'N/A'}
                    </span>
                    <span style="background-color: {risk_color}; color: white; padding: 4px 12px; border-radius: 3px; font-weight: bold; margin-left: 10px;">
                        Risk: {obj.ai_risk_assessment or 'N/A'}
                    </span>
                    <span style="background-color: #6c757d; color: white; padding: 4px 12px; border-radius: 3px; margin-left: 10px;">
                        Confidence: {confidence}%
                    </span>
                </div>
            </div>
            
            {f'<div style="margin-bottom: 10px;"><strong>Suggested Loan Amount:</strong> ${suggested_amount:,.2f}</div>' if suggested_amount else ''}
            
            <div style="margin-bottom: 10px;">
                <strong>Analysis:</strong>
                <div style="margin-top: 5px; white-space: pre-wrap;">{obj.ai_recommendation}</div>
            </div>
        '''
        
        if strengths:
            html += '<div style="margin-top: 10px;"><strong style="color: green;">✓ Key Strengths:</strong><ul style="margin: 5px 0;">'
            for strength in strengths[:5]:
                html += f'<li>{strength}</li>'
            html += '</ul></div>'
        
        if concerns:
            html += '<div style="margin-top: 10px;"><strong style="color: red;">⚠ Key Concerns:</strong><ul style="margin: 5px 0;">'
            for concern in concerns[:5]:
                html += f'<li>{concern}</li>'
            html += '</ul></div>'
        
        if conditions:
            html += '<div style="margin-top: 10px;"><strong style="color: blue;">📋 Conditions for Approval:</strong><ul style="margin: 5px 0;">'
            for condition in conditions[:5]:
                html += f'<li>{condition}</li>'
            html += '</ul></div>'
        
        html += '</div>'
        
        return format_html(html)
    ai_recommendation_display.short_description = 'AI Analysis & Recommendations'

    def personal_info_display(self, obj):
        info = obj.personal_info
        if not info:
            return '—'
        return format_html(
            '<strong>{} {}</strong><br>Email: {}<br>Phone: {}<br>DOB: {}',
            info.first_name,
            info.last_name,
            info.email,
            info.phone,
            info.dob
        )
    personal_info_display.short_description = 'Personal Details'

    def identification_info_display(self, obj):
        ident = obj.identification_info
        if not ident:
            return '—'
        return format_html(
            'Type: {}<br>Agency: {}<br>ID No: {}',
            ident.identification_type or '—',
            ident.id_issuing_agency or '—',
            ident.identification_no or '—'
        )
    identification_info_display.short_description = 'Identification'

    def financial_profile_display(self, obj):
        profile = obj.financial_profile
        if not profile:
            return '—'
        return format_html(
            'Employment: {}<br>Length: {} years<br>Income: ${:,.2f}<br>Gross Monthly: ${:,.2f}<br>Pay Frequency: {}<br>Next Pay: {}<br>Last Pay: {}<br>Direct Deposit: {}<br>Bankruptcy: {}<br>Military: {}',
            profile.employment_status or '—',
            profile.employment_length or '—',
            profile.income or 0,
            profile.gross_monthly_income or 0,
            profile.pay_frequency or '—',
            profile.next_pay_date or '—',
            profile.last_pay_date or '—',
            profile.direct_deposit or '—',
            profile.active_bankruptcy or '—',
            profile.military_status or '—'
        )
    financial_profile_display.short_description = 'Financial Profile'

    def address_display(self, obj):
        address = obj.address
        if not address:
            return '—'
        return format_html(
            '{}<br>{}, {} {}',
            address.street,
            address.city,
            address.state,
            address.zip_code
        )
    address_display.short_description = 'Address'

    def vehicle_info_display(self, obj):
        vehicle = obj.vehicle_info
        if not vehicle:
            return '—'
        return format_html(
            '{} {}<br>Year: {}<br>VIN: {}<br>Mileage: {}<br>Color: {}<br>Plate: {} ({})',
            vehicle.make or '—',
            vehicle.model or '—',
            vehicle.year or '—',
            vehicle.vin or '—',
            vehicle.mileage or '—',
            vehicle.color or '—',
            vehicle.license_plate or '—',
            vehicle.registration_state or '—'
        )
    vehicle_info_display.short_description = 'Vehicle'


@admin.register(LoanApplicationNote)
class LoanApplicationNoteAdmin(admin.ModelAdmin):
    list_display = ['application', 'author', 'created_at']
    list_filter = ['created_at']
    search_fields = ['application__personal_info__first_name', 'application__personal_info__last_name', 'note']
    readonly_fields = ['created_at']


@admin.register(LoanApplicationDocument)
class LoanApplicationDocumentAdmin(admin.ModelAdmin):
    list_display = ['title', 'application', 'document_type', 'is_analyzed', 'uploaded_at']
    list_filter = ['document_type', 'is_analyzed', 'uploaded_at']
    search_fields = ['title', 'application__personal_info__first_name', 'application__personal_info__last_name']
    readonly_fields = ['uploaded_at', 'ai_analysis_result']


@admin.register(VehicleValuation)
class VehicleValuationAdmin(admin.ModelAdmin):
    list_display = [
        'application', 'vehicle_display', 'condition', 'estimated_value_avg',
        'ltv_ratio', 'is_approved_for_loan', 'risk_level', 'analyzed_at'
    ]
    list_filter = ['condition', 'is_approved_for_loan', 'risk_level', 'confidence_level', 'analyzed_at']
    search_fields = ['application__personal_info__first_name', 'application__personal_info__last_name', 'make', 'model', 'year']
    readonly_fields = [
        'analyzed_at', 'updated_at', 'full_analysis_data',
        'estimated_value_display', 'loan_assessment_display', 'vehicle_display'
    ]
    
    fieldsets = (
        ('Application', {
            'fields': ('application',)
        }),
        ('Vehicle Details', {
            'fields': ('make', 'model', 'year', 'body_type', 'color')
        }),
        ('Condition Assessment', {
            'fields': ('condition', 'visible_damage', 'features')
        }),
        ('Valuation', {
            'fields': (
                'estimated_value_low', 'estimated_value_high', 'estimated_value_avg',
                'estimated_value_display'
            )
        }),
        ('Loan Assessment', {
            'fields': (
                'ltv_ratio', 'max_loan_amount', 'recommended_loan_amount',
                'loan_assessment_display'
            )
        }),
        ('Risk Assessment', {
            'fields': ('risk_level', 'risk_factors', 'is_approved_for_loan', 'approval_notes')
        }),
        ('Analysis Metadata', {
            'fields': (
                'confidence_level', 'images_analyzed', 'analysis_notes',
                'analyzed_at', 'updated_at'
            )
        }),
        ('Raw Data', {
            'fields': ('full_analysis_data',),
            'classes': ('collapse',)
        })
    )
    
    def vehicle_display(self, obj):
        """Display vehicle make, model, year"""
        return f"{obj.make} {obj.model} ({obj.year})"
    vehicle_display.short_description = 'Vehicle'
    
    def estimated_value_display(self, obj):
        """Display estimated value range with color coding"""
        avg = obj.estimated_value_avg
        color = 'green' if avg > 15000 else 'orange' if avg > 7500 else 'red'
        return format_html(
            '<span style="color: {};">${:,.2f}</span><br>'
            '<small>Range: ${:,.2f} - ${:,.2f}</small>',
            color, avg, obj.estimated_value_low, obj.estimated_value_high
        )
    estimated_value_display.short_description = 'Estimated Value'
    
    def loan_assessment_display(self, obj):
        """Display loan assessment with approval status"""
        status_color = 'green' if obj.is_approved_for_loan else 'red'
        status_text = 'APPROVED' if obj.is_approved_for_loan else 'DENIED'
        return format_html(
            '<strong style="color: {};">{}</strong><br>'
            'LTV: {}%<br>'
            'Max Loan: ${:,.2f}<br>'
            'Recommended: ${:,.2f}',
            status_color, status_text,
            obj.ltv_ratio, obj.max_loan_amount, obj.recommended_loan_amount
        )
    loan_assessment_display.short_description = 'Loan Assessment'
