export const landingData = {
  hero: {
    headline: 'AI-Powered Blood Supply Intelligence',
    subheadline: 'Predicting shortages. Reducing waste. Saving lives.',
    description: 'BloodBridge connects hospitals, blood banks, and donors through intelligent AI that predicts blood demand, prevents wastage, and coordinates real-time blood availability.',
    cta: 'Get Started',
    secondaryCta: 'Watch Demo',
  },

  problems: [
    {
      title: 'Blood Wastage',
      description: 'Thousands of units expire unused every year, despite critical shortages elsewhere.',
    },
    {
      title: 'Manual Coordination',
      description: 'Hospitals manually call nearby hospitals for blood, wasting precious time during emergencies.',
    },
    {
      title: 'Unpredictable Demand',
      description: 'No visibility into future blood requirements, leading to stockouts and inadequate planning.',
    },
    {
      title: 'Donor Fatigue',
      description: 'Donors receive donation requests even when there is no actual demand for their blood group.',
    },
  ],

  solutions: [
    {
      icon: '🔮',
      title: 'Demand Prediction',
      description: 'AI predicts blood demand using historical data, disease trends, and real-time factors.',
    },
    {
      icon: '🚀',
      title: 'Smart Distribution',
      description: 'Automatic redistribution recommendations based on distance, demand, and expiry dates.',
    },
    {
      icon: '⚡',
      title: 'Real-Time Coordination',
      description: 'Instant matching between blood requests, available inventory, and eligible donors.',
    },
    {
      icon: '📊',
      title: 'Predictive Analytics',
      description: 'Shortage and expiry risk predictions enable proactive planning and intervention.',
    },
  ],

  aiFeatures: [
    {
      title: 'Blood Shortage Prediction',
      description: 'AI learns from historical patterns to predict O-negative blood will be exhausted within 18 hours.',
      metric: '95%+ Accuracy',
    },
    {
      title: 'Intelligent Donor Matching',
      description: 'Notifies only eligible, available donors nearby when their blood type is actually needed.',
      metric: '3x Better Engagement',
    },
    {
      title: 'Optimal Route Planning',
      description: 'Calculates fastest redistribution routes considering distance, traffic, and inventory levels.',
      metric: 'Real-Time',
    },
    {
      title: 'Expiry Risk Management',
      description: 'Identifies blood units at risk of expiry and recommends proactive redistribution.',
      metric: '40% Waste Reduction',
    },
  ],

  howItWorks: [
    {
      number: 1,
      title: 'Data Aggregation',
      description: 'Hospitals and blood banks report real-time blood inventory and demand.',
      icon: '📊',
    },
    {
      number: 2,
      title: 'AI Analysis',
      description: 'Machine learning algorithms analyze patterns and predict future shortages.',
      icon: '🤖',
    },
    {
      number: 3,
      title: 'Smart Recommendations',
      description: 'System recommends optimal blood transfers and donor notifications.',
      icon: '💡',
    },
    {
      number: 4,
      title: 'Instant Execution',
      description: 'Hospitals and donors receive actionable recommendations in real-time.',
      icon: '⚡',
    },
  ],

  roles: [
    {
      icon: '🩸',
      title: 'Blood Donors',
      description: 'Register once, donate with impact',
      features: [
        'Only receive requests when your blood is needed',
        'Track donation history and impact',
        'Find nearby donation centers',
        'Manage availability status',
      ],
      color: 'blood' as const,
    },
    {
      icon: '🏥',
      title: 'Hospitals',
      description: 'Manage blood inventory intelligently',
      features: [
        'Real-time blood inventory tracking',
        'AI-powered request recommendations',
        'Automatic redistribution suggestions',
        'Emergency coordination',
      ],
      color: 'blue' as const,
    },
    {
      icon: '🩹',
      title: 'Blood Banks',
      description: 'Optimize collection and distribution',
      features: [
        'Inventory management and tracking',
        'Expiry monitoring and alerts',
        'Distribution optimization',
        'Donation forecasting',
      ],
      color: 'amber' as const,
    },
    {
      icon: '👨‍💼',
      title: 'Administrators',
      description: 'Monitor ecosystem-wide intelligence',
      features: [
        'City-wide blood availability heatmap',
        'Emergency request coordination',
        'System analytics and insights',
        'User and organization management',
      ],
      color: 'purple' as const,
    },
  ],

  stats: [
    { number: '2,850+', label: 'Active Donors' },
    { number: '42', label: 'Connected Hospitals' },
    { number: '18', label: 'Blood Banks' },
    { number: '95%', label: 'Prediction Accuracy' },
  ],

  footer: {
    tagline: 'Connecting Blood. Predicting Demand. Saving Lives.',
    company: 'BloodBridge',
    year: new Date().getFullYear(),
  },
}
