module.exports = {
    // Probabilidad de cada item en cada zona de loot
    LootPercentChance: {
        Militar: {
            "Carbine Rifle Mk II": 40,
            "Heavy Rifle": 20,
            "Combat MG": 15,
            "Sniper Rifle": 10,
            "Pistol": 25,
            "Heavy Sniper": 30,
            "Heavy Sniper Mk II": 20,
            "Casco": 60,
            "Grenade": 40,
        }
    },

    // Posiciones de cada zona de loot según el tipo
    LootPoints: {
        Militar: [
            [1690.12, 2591.44, 45.91],
            [-2345.67, 3267.89, 32.45],
            [-215.45, 6168.78, 31.87],
            [849.34, 2146.56, 52.38],
            [-1110.56, -850.23, 13.89],
            [385.6615, -2134.6813, 16.7],
            [371.2879, -2127.4284, 16.2886],
            [375.2879, -2127.4284, 16.2886],
            [375.2879, -2121.4284, 16.2886],
        ],

        Residencial: [
            [346.12, -1005.23, 29.42],
            [-909.58, 196.34, 69.50],
            [1250.78, -620.43, 68.23],
            [-40.92, -1446.38, 31.02],
            [758.21, -810.34, 26.35],
            [-1515.33, -451.78, 35.23]
        ]
    }
};
