module.exports = { 
  scenario1: { 
    financingChoiceOptions: [
      { option: 'Option 1', text: 'Details for option 1' },
      { option: 'Option 2', text: 'Details for option 2' }
    ],
    assistantRecommendationText: {
      lowAnthropomorphism: 'Recommendation for low anthropomorphism condition',
      highAnthropomorphism: 'Recommendation for high anthropomorphism condition'
    }
  },
  scenario2: { 
    investmentRounds: [
      { 
        round: 1,
        marketPerformance: 'Performance data for round 1',
        aiRecommendationAllocation: 'AI recommendation for allocation in round 1',
        aiMessage: 'AI message for round 1'
      },
      { 
        round: 2,
        marketPerformance: 'Performance data for round 2',
        aiRecommendationAllocation: 'AI recommendation for allocation in round 2',
        aiMessage: 'AI message for round 2'
      },
      { 
        round: 3,
        marketPerformance: 'Performance data for round 3',
        aiRecommendationAllocation: 'AI recommendation for allocation in round 3',
        aiMessage: 'AI message for round 3'
      },
      { 
        round: 4,
        marketPerformance: 'Performance data for round 4',
        aiRecommendationAllocation: 'AI recommendation for allocation in round 4',
        aiMessage: 'AI message for round 4'
      }
    ]
  }
}