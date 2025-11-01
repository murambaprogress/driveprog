export const supportTickets = [
  {
    id: "TCK-2025-143",
    subject: "AutoPay not processing - payment overdue",
    status: "Open",
    priority: "High",
    category: "Payment Issues",
    createdAt: "2025-08-23",
    lastUpdated: "2025-08-24",
    assignedAgent: "Sarah M.",
    messages: [
      {
        from: "user",
        name: "Michael Rodriguez",
        text: "My AutoPay was supposed to process on 8/20 but my payment is now overdue. My bank account has sufficient funds. Can you help?",
        date: "2025-08-23 14:30",
        attachments: ["bank_statement.pdf"]
      },
      {
        from: "support",
  name: "Sarah M. - DriveCash Support",
        text: "Hi Michael, I see the issue. There was a temporary hold on your account due to updated banking information. I've released the hold and your AutoPay will process tonight. No late fees will be charged.",
        date: "2025-08-24 09:15"
      },
      {
        from: "user",
        name: "Michael Rodriguez", 
        text: "Thank you! Should I expect this to happen again?",
        date: "2025-08-24 10:22"
      },
      {
        from: "support",
  name: "Sarah M. - DriveCash Support",
        text: "Not at all! This was a one-time verification. Your AutoPay is now fully active and you'll continue receiving your 0.25% rate discount.",
        date: "2025-08-24 10:45"
  }
    ]
  },
  {
    id: "TCK-2025-135",
    subject: "Pre-approval application stuck in processing",
    status: "Closed",
    priority: "Medium", 
    category: "Loan Application",
    createdAt: "2025-08-15",
    lastUpdated: "2025-08-16",
    assignedAgent: "Lisa T.",
    messages: [
      {
        from: "user",
        name: "James Chen",
        text: "I submitted my pre-approval application 3 days ago and it's still showing 'under review'. The website said 30 minutes for most applications.",
        date: "2025-08-15 16:20"
      },
      {
        from: "support",
  name: "Lisa T. - DriveCash Support", 
        text: "Hi James, I apologize for the delay. I see your application required additional income verification due to self-employment status. I've expedited your review and you should have a decision within 2 hours.",
        date: "2025-08-16 09:00"
      },
      {
        from: "support",
  name: "Lisa T. - DriveCash Support",
        text: "Great news! Your pre-approval for up to $35,000 at 7.9% APR has been approved. The certificate is valid for 30 days and gives you negotiating power at any dealership.",
        date: "2025-08-16 10:45"
      },
      {
        from: "user", 
        name: "James Chen",
        text: "Excellent! Thank you for the quick resolution. Very impressed with the service.",
        date: "2025-08-16 11:30"
      }
    ]
  },
  {
    id: "TCK-2025-129",
    subject: "Gap insurance claim process question",
    status: "Closed",
    priority: "High",
    category: "Insurance",
    createdAt: "2025-08-10", 
    lastUpdated: "2025-08-12",
    assignedAgent: "Robert F.",
    messages: [
      {
        from: "user",
        name: "Amanda Foster",
  text: "My 2021 Jeep Wrangler was totaled in an accident. Insurance paid $28,000 but I still owe $31,500 on my DriveCash loan. How does gap insurance work?",
        date: "2025-08-10 19:45"
      },
      {
        from: "support",
  name: "Robert F. - DriveCash Support",
  text: "I'm sorry about your accident, Amanda. Good news - you have DriveCash Gap Coverage! I'll handle the entire claim process. You'll owe $0 after gap coverage pays the $3,500 difference. I'll need the insurance settlement letter and police report.",
        date: "2025-08-11 08:00" 
      },
      {
        from: "user",
        name: "Amanda Foster",
        text: "That's such a relief! I'll upload the documents now. How long does gap processing take?",
        date: "2025-08-11 09:30",
        attachments: ["insurance_settlement.pdf", "police_report.pdf"]
      },
      {
  from: "support", 
  name: "Robert F. - DriveCash Support",
  text: "Documents received! Gap claims typically process within 5-7 business days. I've already submitted your claim and you'll receive email updates. Your loan will show a $0 balance once processed.",
        date: "2025-08-11 14:20"
      },
      {
  from: "support",
  name: "Robert F. - DriveCash Support",
  text: "Update: Gap coverage has been processed! Your loan is now paid in full with no amount owed. You should receive final confirmation via email within 24 hours.",
        date: "2025-08-12 16:00"
      }
    ]
  },
  {
    id: "TCK-2025-122",
    subject: "Refinance application - current rates?", 
    status: "Closed",
    priority: "Low",
    category: "Refinancing",
    createdAt: "2025-08-05",
    lastUpdated: "2025-08-06",
    assignedAgent: "Maria S.",
    messages: [
      {
  from: "user",
  name: "Robert Kim",
  text: "I have an auto loan with another lender at 12.5% APR. What rates does DriveCash offer for refinancing a 2019 Toyota Camry with 45k miles?",
        date: "2025-08-05 13:15"
      },
      {
  from: "support",
  name: "Maria S. - DriveCash Support",
  text: "Hi Robert! Based on current rates, qualified applicants with good credit can get rates as low as 5.9% APR for 2019 vehicles. That could save you significant money! Would you like me to start a quick pre-qualification?",
        date: "2025-08-05 15:30"
      },
      {
        from: "user", 
        name: "Robert Kim",
        text: "Yes please! My credit score is around 720.",
        date: "2025-08-05 16:00"
      },
      {
        from: "support",
  name: "Maria S. - DriveCash Support", 
        text: "Perfect! With a 720 credit score, you'd likely qualify for our best rates. I've sent you a secure pre-qualification link. It takes 2 minutes and won't affect your credit score. You could potentially save $150+ per month!",
        date: "2025-08-06 09:00"
      },
      {
        from: "user",
        name: "Robert Kim",
        text: "Just completed it - approved for 6.2% APR! This will save me over $3,000 in interest. Starting the full application now.",
        date: "2025-08-06 10:45"
      }
    ]
  },
  {
    id: "TCK-2025-115", 
    subject: "Mobile app login issues after password reset",
    status: "Closed",
    priority: "Medium",
    category: "Technical Support", 
    createdAt: "2025-07-28",
    lastUpdated: "2025-07-29", 
    assignedAgent: "Kevin L.",
    messages: [
      {
        from: "user",
        name: "Sarah Johnson",
        text: "I reset my password yesterday but the mobile app keeps saying 'invalid credentials'. The website works fine with the new password.",
        date: "2025-07-28 20:30"
      },
      {
  from: "support",
  name: "Kevin L. - DriveCash Support",
  text: "Hi Sarah, this is a known issue with the mobile app after password changes. Please try logging out completely and clearing the app cache, then log back in. If that doesn't work, I can reset your mobile session remotely.",
        date: "2025-07-29 08:15"
      },
      {
        from: "user", 
        name: "Sarah Johnson",
        text: "I tried logging out but how do I clear the app cache on iPhone?",
        date: "2025-07-29 08:45" 
      },
      {
  from: "support",
  name: "Kevin L. - DriveCash Support",
  text: "For iPhone: Delete the DriveCash app completely, restart your phone, then reinstall from the App Store. Your account data is stored securely on our servers. I've also reset your mobile session to ensure smooth login.",
        date: "2025-07-29 09:00"
      },
      {
        from: "user",
        name: "Sarah Johnson", 
        text: "That worked perfectly! I'm logged in and can see all my account info. Thank you!",
        date: "2025-07-29 09:30"
      }
    ]
  },
  {
    id: "TCK-2025-108",
    subject: "Change payment due date request",
    status: "Closed", 
    priority: "Low",
    category: "Account Management",
    createdAt: "2025-07-20",
    lastUpdated: "2025-07-21",
    assignedAgent: "Nicole P.",
    messages: [
      {
        from: "user",
        name: "Carlos Martinez", 
        text: "Can I change my payment due date from the 15th to the 1st of each month? I get paid on the last day of the month and this would be much better for my budget.",
        date: "2025-07-20 14:20"
      },
      {
  from: "support",
  name: "Nicole P. - DriveCash Support",
  text: "Absolutely, Carlos! I can change your due date to the 1st of each month. This change will take effect with your next payment cycle (September 1st). Your August payment remains due on August 15th as scheduled.",
        date: "2025-07-21 10:00"
      },
      {
        from: "user",
        name: "Carlos Martinez",
        text: "Perfect timing! Will this affect my AutoPay setup?", 
        date: "2025-07-21 11:15"
      },
      {
        from: "support",
  name: "Nicole P. - DriveCash Support",
        text: "Your AutoPay has been automatically updated to process on the 1st of each month. You'll receive a confirmation email with the updated schedule. No action needed on your part!",
        date: "2025-07-21 11:45"
      }
    ]
  },
  {
    id: "TCK-2025-098",
    subject: "Loan modification due to temporary hardship",
    status: "In Progress",
    priority: "High", 
    category: "Loan Modification",
    createdAt: "2025-07-10",
    lastUpdated: "2025-08-20",
    assignedAgent: "Patricia R.",
    messages: [
      {
        from: "user",
        name: "Linda Thompson",
  text: "I was recently laid off and am struggling with my $425 monthly extension. Do you have any temporary assistance programs while I look for new employment?",
        date: "2025-07-10 16:00"
      },
      {
  from: "support", 
  name: "Patricia R. - DriveCash Support",
  text: "I'm sorry to hear about your job situation, Linda. DriveCash offers several hardship assistance options. I can offer a 90-day payment deferral or reduce your payment to $275/month for 6 months. Which option would help most?",
        date: "2025-07-11 09:30"
      },
      {
        from: "user",
        name: "Linda Thompson",
        text: "The reduced payment would be perfect! I have some savings to continue making payments, just need them to be lower temporarily.",
        date: "2025-07-11 12:45",
        attachments: ["unemployment_benefits.pdf"]
      },
      {
  from: "support",
  name: "Patricia R. - DriveCash Support", 
  text: "Excellent! I've processed your temporary modification. Your payment is now $275/month for 6 months (August - January). The deferred amount will be added to the end of your loan term. No late fees or credit impact.",
        date: "2025-07-12 14:00"
      },
      {
        from: "user",
        name: "Linda Thompson",
        text: "Update: I found a new job! Can I return to regular payments early?",
        date: "2025-08-20 10:15"
      },
      {
        from: "support", 
  name: "Patricia R. - DriveCash Support",
        text: "Congratulations on the new job! Yes, you can resume regular payments anytime. Would you like to return to $425/month starting with your September payment?",
        date: "2025-08-20 13:30"
      }
    ]
  }
];
