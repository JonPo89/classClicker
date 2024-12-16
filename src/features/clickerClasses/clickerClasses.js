export class ProducerClass {
    constructor(name, rank) {
        this.name = name;
        this.rank = rank;
        this.colour = `${Math.round(Math.random()*255)},70%,60%`;
        this.level = 0;
        
        this.productionTimeMultiplier = 1;
        this.productionValueMultiplier = 1;
        this.costMultiplier = 1;


    }

    calculateProductionValue(){
        if (this.level === 0) return 0;
        return Math.round((Math.pow(this.rank, 5)) * (Math.pow(1.2, this.level)) * this.productionValueMultiplier);
    }

    calculateProductionTime(){
        return (this.rank*10) / (1+ Math.log((this.level + this.productionTimeMultiplier)));
    }

    levelCost(x) {
        let cost = 0;
        let costMultiplier = this.costMultiplier;
        let level = this.level;
        if (level === 0) {
            cost = Math.round(Math.pow(8, this.rank*.75));
            return cost;
        } else {
            for (let i = 1; i <= x; i++) {
                costMultiplier = this.costMultiplierCalculate(level + i);
                cost = cost + Math.pow(this.rank, 5) * 2 * (level+1) * costMultiplier;
                level ++
                if (level + i === 50) break;
            }
        return cost;
        }
        
        return cost;
    }

    maxCost(funds) {
        let cost = this.levelCost(1);
        let maxCost = 0;

        let level = 1;
        let maxLevel = 0;
        if (funds < cost || this.level === 0) {

            return {maxCost: 0, maxLevel: 0};
        } else {
            while (funds >= cost) {
                cost = this.levelCost(level)
                if (funds < cost) break;
                if (this.level + maxLevel >= 50) break;
                maxCost = cost;
                level++;
                maxLevel ++;
            }
            return {maxCost, maxLevel};
        }
        
        
    }

    costMultiplierCalculate(level){
        let costMultiplierIncrease = this.costMultiplier;
        if (level < 101) {
            switch (level){
                case 10:
                    costMultiplierIncrease += 0.5;
                    break;
                case 25:
                    costMultiplierIncrease += 0.5;
                    break;
                case 50:
                    costMultiplierIncrease += 1;
                    break;
                case 100:
                    costMultiplierIncrease += 1.5;
                    break;
                default:
                    break;
            }
        } else {
            if (level % 100 === 0) {
                costMultiplierIncrease += 1.5;
            } else if (level % 50 === 0) {
                costMultiplierIncrease += 1;
            }
        }
        return costMultiplierIncrease;
    }
    
    levelUp(x) {
        for (let i=0; i<x; i++){
            this.level++;
            this.updateMultipliers(this.level);
            if (this.level >= 50) break;
        }
        return this.level;
    }

    updateMultipliers(level) {
        this.productionTimeMultiplier /= 1.01;
        this.productionValueMultiplier *= 1.001;
        if (level < 101) {
            switch (level){
                case 10:
                    this.costMultiplier += 0.5;
                    this.productionValueMultiplier += 0.5;
                    this.productionTimeMultiplier /= 1.005;
                    break;
                case 25:
                    this.costMultiplier += 0.5;
                    this.productionValueMultiplier += 0.5;
                    this.productionTimeMultiplier /= 1.005;
                    break;
                case 50:
                    this.costMultiplier += 1;
                    this.productionValueMultiplier += 1;
                    this.productionTimeMultiplier /= 1.01;
                    break;
                case 100:
                    this.costMultiplier += 1.5;
                    this.productionValueMultiplier += 1.5;
                    this.productionTimeMultiplier /= 1.01;
                    break;
                default:
                    break;
            }
        } else {
            if (level % 100 === 0) {
                this.productionValueMultiplier += 1.5;
                this.productionTimeMultiplier /= 1.2;
            } else if (level % 50 === 0) {
                this.productionValueMultiplier += 1;
                this.productionTimeMultiplier /= 1.1;
            }
        }

    }

    


}