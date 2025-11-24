import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import LoanCalculator from '../src/features/loan/components/LoanCalculator';

describe('LoanCalculator', () => {
  it('renders the calculator with default values', () => {
    render(<LoanCalculator />);
    
    // Check that the calculator title is displayed
    expect(screen.getByText('Loan Calculator')).toBeInTheDocument();
    
    // Check that the form inputs are displayed with default values
    const amountInput = screen.getByLabelText(/Loan Amount/i) as HTMLInputElement;
    expect(amountInput).toBeInTheDocument();
    expect(amountInput.value).toBe('10000');
    
    const termSelect = screen.getByLabelText(/Loan Term/i) as HTMLSelectElement;
    expect(termSelect).toBeInTheDocument();
    expect(termSelect.value).toBe('36');
    
    const rateInput = screen.getByLabelText(/Interest Rate/i) as HTMLInputElement;
    expect(rateInput).toBeInTheDocument();
    expect(rateInput.value).toBe('5.5');
    
    // Check that the loan summary is displayed
    expect(screen.getByText('Monthly Payment')).toBeInTheDocument();
    expect(screen.getByText('Total Payment')).toBeInTheDocument();
    expect(screen.getByText('Total Interest')).toBeInTheDocument();
  });
  
  it('updates calculations when input values change', async () => {
    const user = userEvent.setup();
    render(<LoanCalculator />);
    
    // Get the initial calculated values
    const initialMonthlyPayment = screen.getByText('Monthly Payment').nextSibling?.textContent;
    
    // Change the loan amount
    const amountInput = screen.getByLabelText(/Loan Amount/i) as HTMLInputElement;
    await user.clear(amountInput);
    await user.type(amountInput, '20000');
    
    // Verify that the calculated values changed
    const updatedMonthlyPayment = screen.getByText('Monthly Payment').nextSibling?.textContent;
    expect(updatedMonthlyPayment).not.toBe(initialMonthlyPayment);
    
    // Change the interest rate
    const rateInput = screen.getByLabelText(/Interest Rate/i) as HTMLInputElement;
    await user.clear(rateInput);
    await user.type(rateInput, '10');
    
    // Verify that the calculated values changed again
    const finalMonthlyPayment = screen.getByText('Monthly Payment').nextSibling?.textContent;
    expect(finalMonthlyPayment).not.toBe(updatedMonthlyPayment);
  });
});
