const scenarios = {
    scenario1: {
        title: "Financing Choice",
        rounds: [
            {
                round: 1,
                marketPerformance: {
                    stocks: 0.3,
                    bonds: 0.05,
                    realEstate: 0.08
                },
                aiRecommendations: {
                    allocate: {
                        stocks: 70,
                        bonds: 10,
                        realEstate: 20
                    }
                }
            },
            {
                round: 2,
                marketPerformance: {
                    stocks: 0.04,
                    bonds: 0.02,
                    realEstate: 0.1
                },
                aiRecommendations: {
                    allocate: {
                        stocks: 60,
                        bonds: 30,
                        realEstate: 10
                    }
                }
            }
        ]
    },
    scenario2: {
        title: "Portfolio Allocation",
        rounds: [
            {
                round: 1,
                marketPerformance: {
                    stocks: 0.5,
                    bonds: 0.07,
                    realEstate: 0.12
                },
                aiRecommendations: {
                    allocate: {
                        stocks: 50,
                        bonds: 30,
                        realEstate: 20
                    }
                }
            },
            {
                round: 2,
                marketPerformance: {
                    stocks: 0.2,
                    bonds: 0.04,
                    realEstate: 0.09
                },
                aiRecommendations: {
                    allocate: {
                        stocks: 40,
                        bonds: 40,
                        realEstate: 20
                    }
                }
            }
        ]
    }
};

// Export the scenarios data for use in other modules
module.exports = scenarios;