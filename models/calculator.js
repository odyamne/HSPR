class Calculator {
    constructor(gender, event, bestResult) {
        this.gender = gender;
        this.event = event;
        this.bestResult = bestResult;
        this.pointShift = 20000;

        this.formulas = {
            mees: {
                kuul: { resultShift: 687.7, conversionFactor: 0.042172 },
                ketas: { resultShift: 2232.6, conversionFactor: 0.004007 },
                vasar: { resultShift: 2649.4, conversionFactor: 0.0028462 },
                oda: { resultShift: 2886.8, conversionFactor: 0.0023974 }
            },
            naine: {
                kuul: { resultShift: 657.53, conversionFactor: 0.0462 },
                ketas: { resultShift: 2227.3, conversionFactor: 0.0040277 },
                vasar: { resultShift: 2540, conversionFactor: 0.0030965 },
                oda: { resultShift: 2214.9, conversionFactor: 0.004073 }
            }
        };
    }

    calculatePoints() {
        if (this.event === 'hüpe') {
            return this.bestResult * 200; // hyppe punktid
        }

        const valem = this.formulas[this.gender][this.event]; // valib õige valemi soo ja ala järgi

        if (!valem) {
            throw new Error('Sisesta sugu ja ala');
        }

        const { resultShift, conversionFactor } = valem; // võtab vastavad parameetrid (resultShift, conversionFactor)
        return Math.floor(conversionFactor * ((this.bestResult + resultShift) ** 2) - this.pointShift); // heite punktid
    }
}

module.exports = Calculator;