//NaN containment: num = isNaN(num) ? 0 : num;

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
let dt = 0
let bt = 0


const d_miner_amount = document.getElementById("d_miner_amount")
const d_ore = document.getElementById("d_ore")
const d_material = document.getElementById("d_material")
const d_power = document.getElementById("d_power")
const d_power_satisfaction = document.getElementById("d_power_satisfaction")
const d_assembler_amount = document.getElementById("d_assembler_amount")
const d_solar_panels_amount = document.getElementById("d_solar_panels_amount")
const d_military = document.getElementsByClassName("d_military")
const d_ammunition = document.getElementById("d_ammunition")
const d_coverage = document.getElementById("d_coverage")
const d_defense_amount = document.getElementById("d_defense_amount")
const d_repair = document.getElementById("d_repair")
const d_enemies = document.getElementById("d_enemies")
const d_damage = document.getElementById("d_damage")
const d_lost_buildings = document.getElementById("d_lost_buildings")
const d_drones = document.getElementsByClassName("d_drones")
const d_drones_amount = document.getElementById("d_drones_amount")
const d_drones_idle_percent = document.getElementById("d_drones_idle_percent")


class Building {
    constructor(name, amount, cost, scheduled_for_construction, power_production, health, broken, pollution, speed) {
        this.name = name
        this.amount = amount
        this.cost = cost
        this.scheduled_for_construction = scheduled_for_construction
        this.power_production = power_production
        this.health = health
        this.broken = broken
        this.pollution = pollution
        this.speed = speed
    }
}

class Defense extends Building {
    constructor(name, amount, cost, scheduled_for_construction, power_production, health, broken, pollution, strength, ammunition_usage, building_coverage) {
        super(name, amount, cost, scheduled_for_construction, power_production, health, broken, pollution)
        this.strength = strength
        this.ammunition_usage = ammunition_usage
        this.building_coverage = building_coverage
    }
}

class Drone_network {
    constructor(amount, working, power_consumption, health, work_speed, cost) {
        //amount and working is for all drones
        this.amount = amount
        this.working = working
        //These below are for each individual drone
        this.power_consumption = power_consumption
        this.health = health
        this.work_speed = work_speed
        this.cost = cost
    }
}


const solar_panel =   new Building('Solar panel', 1, 60, 0, 40, 100, 0, 0, 1)
const miner =         new Building('Miner', 1, 20, 0, -2, 100, 0, 2, 2)
const assembler =     new Building('Assembler', 0, 15, 0, -1, 150, 0, 1, 1)
const defense =       new Defense('Defense', 0, 100, 0, 0, 500, 0, 0, 2, 1, 25)
const drone =         new Drone_network(0, 0, 3, 25, 1, 10)
const each_buildings = [solar_panel, miner, assembler, defense] // drone are not buildings

let ore = 0
let material = 15
let ammunition = 0
let powergrid_satisfaction = 0
let pollution = 0
let coverage = 0
let enemies = 0
let damage = 0
let assembler_met_priority = 0
let assembler_ammo_priority = 0
let assembler_drone_priority = 0
let drone_build_material_debt = 0
let drone_build_progress = 0

const repair_cost = 0.2
const drone_repair_speed = 1.5
const drone_build_speed = 1

let unlock_military = false
let unlock_repair = false
let unlock_drones = false


function sum_of_array(array){
    let sum = 0
    array.forEach(element => {
        sum += element
    });
    return sum
}


function random_with_probability(outcomes, weights){
    if(!weights){
        weights=Array(outcomes.length).fill(1);
    }
    let totalWeight=weights.reduce((prev, curr)=>prev+=curr);
    const num=Math.random();
    let sum_health_total=0, lastIndex=weights.length-1;
    for(let i=0; i<=lastIndex; i++){
        sum_health_total+=weights[i]/totalWeight;
        if(num<sum_health_total) return outcomes[i];
    }
    return null;
}


function relu(value){
    return Math.max(0, value)
}


function update_display(){
    d_ore.textContent = "Ore:" + simplify(ore)
    d_material.textContent = "Material:" + simplify(material)
    d_power.textContent = "Power:" + simplify(solar_panel.power_production * solar_panel.amount)
    d_power_satisfaction.textContent = "Satisfaction:" + powergrid_satisfaction.toFixed(2)
    d_miner_amount.textContent = "Amount:" + simplify(miner.amount)
    d_assembler_amount.textContent = "Amount:" + simplify(assembler.amount)
    d_solar_panels_amount.textContent = "Amount:" + simplify(solar_panel.amount)
    d_ammunition.textContent = "Ammunition:" + simplify(ammunition)
    d_coverage.textContent = "Coverage:" + Math.floor(coverage * 100) + "%"
    d_defense_amount.textContent = "Amount." + simplify(defense.amount)
    d_enemies.textContent = "Enemies:" + simplify(enemies)
    d_damage.textContent = "Damage:" + simplify(damage)
    d_lost_buildings.textContent = "Lost buildings:" + simplify(defense.broken + solar_panel.broken + assembler.broken + miner.broken)
    d_drones_amount.textContent = "Amount:" + simplify(drone.amount)
    d_drones_idle_percent.textContent = "Idle:" + Math.floor(100 - drone.working / drone.amount * 100) + "%"
    if(unlock_military){
        for(let i = 0; i < d_military.length; i++) {
            d_military[i].style.display = ""
        }
    }else{
        for(let i = 0; i < d_military.length; i++) {
            d_military[i].style.display = "none"
        }
    }
    if(unlock_repair){
        d_repair.style.display = ""
    }else{
        d_repair.style.display = "none"
    }
    if(unlock_drones){
        for(let i = 0; i < d_drones.length; i++) {
            d_drones[i].style.display = ""
        }
    }else{
        for(let i = 0; i < d_drones.length; i++) {
            d_drones[i].style.display = "none"
        }
    }
}


function simplify(n){
    if(n < 1000){return Math.round(n)}
    let denom = 0
    const symbols = [" ", "K", "M", "B", "T", "Qa", "Qu", "Sx", "Se", "Oc", "No"]
    while(n >= 1000){
        denom++
        n *= 0.001
    }

    let nr = n
    nr = Math.floor(nr)
    nr = nr.toString()
    let len = nr.length
    nr = 3 - len
    if(nr > 0){
        n = n.toFixed(nr)
    }
    else {
        n = Math.floor(n)
    }

    return n + symbols[denom]
}


function build_miner(amount){
    let reduction = Math.floor(amount*(material/(amount * miner.cost)))
    reduction = isNaN(reduction) ? 0 : reduction;
    reduction = clamp(reduction, 0, amount)
    if(miner.cost * reduction <= material){
        material -= miner.cost * reduction
        miner.amount += reduction
        return true
    }
}


function build_assembler(amount){
    let reduction = Math.floor(amount*(material/(amount * assembler.cost)))
    reduction = isNaN(reduction) ? 0 : reduction;
    reduction = clamp(reduction, 0, amount)
    if(assembler.cost * reduction <= material){
        material -= assembler.cost * reduction
        assembler.amount += reduction
        return true
    } 
}


function build_solar_panel(amount){
    let reduction = Math.floor(amount*(material/(amount * solar_panel.cost)))
    reduction = isNaN(reduction) ? 0 : reduction;
    reduction = clamp(reduction, 0, amount)
    if(solar_panel.cost * reduction <= material){
        material -= solar_panel.cost * reduction
        solar_panel.amount += reduction
        return true
    } 
}


function build_defenses(amount){
    let reduction = Math.floor(amount*(material/(amount * defense.cost)))
    reduction = isNaN(reduction) ? 0 : reduction;
    reduction = clamp(reduction, 0, amount)
    if(defense.cost * reduction <= material){
        material -= defense.cost * reduction
        defense.amount += reduction
        return true
    }  
}


function rebuild(){
    if(defense.broken > 0){
        if(build_defenses(1)){defense.broken--
        return defense}
    }else if(solar_panel.broken > 0){
        if(build_solar_panel(1)){solar_panel.broken--
        return solar_panel}
    }else if(assembler.broken > 0){
        if(build_assembler(1)){assembler.broken--
        return assembler}
    }else if(miner.broken > 0){
        if(build_miner(1)){miner.broken--
        return miner}
    }
}


function repair(amount){
    if(amount <= 0){return false}
    if(material >= amount * repair_cost && damage > amount){
        damage -= amount
        material -= amount * repair_cost
        damage = Math.max(damage, 0)
        return true
    }else{
    let reduction = Math.min(damage, material / repair_cost) / amount
    if(reduction > 0){
        damage -= amount * reduction
        material -= amount * repair_cost * reduction
        damage = Math.max(damage, 0)
        return true
    }
    }
    return false
}


function satisfaction(requester, provider){
    // Returns the work_capacity between the provider and requester with a conversion ration of 1:1
    // Also factors in powergrid_satisfaction
    if(requester <= provider){
        return 1 * powergrid_satisfaction
    }
    else if(1 < provider / requester){
        return 1 * powergrid_satisfaction
    }
    else if(provider / requester == 0){
        return 0
    }else{
        return provider / requester
    }
}


function assembler_priority(){
    let assembler_priority_total = Number(document.getElementById("d_assembler_priority_material").value) + Number(document.getElementById("d_assembler_priority_ammunition").value) + Number(document.getElementById("d_assembler_priority_drones").value)
    if(assembler_priority_total == 0){
        assembler_met_priority = 0
        assembler_ammo_priority = 0
        assembler_drone_priority = 0
    }else{
        assembler_met_priority = document.getElementById("d_assembler_priority_material").value / assembler_priority_total
        assembler_ammo_priority = document.getElementById("d_assembler_priority_ammunition").value / assembler_priority_total
        assembler_drone_priority = document.getElementById("d_assembler_priority_drones").value / assembler_priority_total 
    }
}


function powergrid(){
    powergrid_satisfaction = solar_panel.amount * solar_panel.power_production / Math.abs(miner.amount * miner.power_production + assembler.amount * assembler.power_production + drone.working * drone.power_consumption)
    powergrid_satisfaction = isNaN(powergrid_satisfaction) ? 0 : powergrid_satisfaction;
    powergrid_satisfaction = clamp(powergrid_satisfaction, 0, 1)
}


function military(delta_time){
    // Coverage is used in func spawn_enemies to determine if enemies are allowed to damage other buildings
    coverage = (defense.amount * 15) / (miner.amount + assembler.amount + solar_panel.amount)
    coverage = clamp(coverage, 0, 1)
    coverage = isNaN(coverage) ? 0 : coverage
    let defense_satisfaction = 0
    defense_satisfaction = ammunition / defense.amount
    defense_satisfaction = clamp(defense_satisfaction, 0, 1)
    defense_satisfaction *= enemies / defense.amount
    defense_satisfaction = clamp(defense_satisfaction, 0, 1)
    defense_satisfaction = isNaN(defense_satisfaction) ? 0 : defense_satisfaction;
    if(enemies > 0 && defense_satisfaction > 0){
        enemies -= defense.amount * defense.strength * defense_satisfaction * delta_time
        ammunition -= defense.amount * defense_satisfaction * delta_time
    }


}


function spawn_enemies(){
    if(pollution > 60){
        enemies += (pollution - 60) * 2
    }
}


function enemy_damage(delta_time){
    //Enemies will accumulate damage over time and after a certain threshold one ore multiple buildings
    //gets destroyed and the damage is reduced accordingly
    damage += enemies * delta_time
    
    // Uses square root to simulate damage being spread out across multiple buildings
    //The idea is to multiply each buildings health with it's amount, then work out what percentage each building make out of the total
    
    // Setup
    
    let each_buildings_health_total = []
    each_buildings.forEach((element, index) => {
        each_buildings_health_total.push(each_buildings[index].amount * each_buildings[index].health)
    });
    
    let sum_health_total = 0
    each_buildings_health_total.forEach(element => {
        sum_health_total += element
    });
    
    let each_buildings_percent = []
    if(sum_health_total != 0){
        each_buildings_health_total.forEach(element => {
            each_buildings_percent.push(element / sum_health_total)
        });
        each_buildings_percent.splice(3, 1, coverage)
    }
    
    damage = clamp(damage, 0, sum_health_total)

    if(each_buildings_percent == 0){return} // return <---------------------
    
    let buildings_to_destroy = 0
    // Calculate and apply changes to defense
    buildings_to_destroy = (damage / (defense.health * Math.sqrt(defense.amount))) * clamp((each_buildings_percent[3] * (1 - coverage)) + coverage, 0, 1)
    buildings_to_destroy = Math.floor(clamp(buildings_to_destroy, 0, defense.amount))
    buildings_to_destroy = isNaN(buildings_to_destroy) ? 0 : buildings_to_destroy;
    defense.amount -= buildings_to_destroy
    defense.broken += buildings_to_destroy
    damage -= buildings_to_destroy * defense.health
    
    // Calculate and apply changes to assembler
    buildings_to_destroy = (damage / (assembler.health * Math.sqrt(assembler.amount))) * (each_buildings_percent[2] * (1 - coverage))
    buildings_to_destroy = Math.floor(clamp(buildings_to_destroy, 0, assembler.amount))
    buildings_to_destroy = isNaN(buildings_to_destroy) ? 0 : buildings_to_destroy;
    assembler.amount -= buildings_to_destroy
    assembler.broken += buildings_to_destroy
    damage -= buildings_to_destroy * assembler.health
    
    // Calculate and apply changes to miner
    buildings_to_destroy = (damage / (miner.health * Math.sqrt(miner.amount))) * (each_buildings_percent[1] * (1 - coverage))
    buildings_to_destroy = Math.floor(clamp(buildings_to_destroy, 0, miner.amount))
    buildings_to_destroy = isNaN(buildings_to_destroy) ? 0 : buildings_to_destroy;
    miner.amount -= buildings_to_destroy
    miner.broken += buildings_to_destroy
    damage -= buildings_to_destroy * miner.health
    
    // Calculate and apply changes to solar_panel
    buildings_to_destroy = (damage / (solar_panel.health * Math.sqrt(solar_panel.amount))) * (each_buildings_percent[0] * (1 - coverage))
    buildings_to_destroy = Math.floor(clamp(buildings_to_destroy, 0, solar_panel.amount))
    buildings_to_destroy = isNaN(buildings_to_destroy) ? 0 : buildings_to_destroy;
    solar_panel.amount -= buildings_to_destroy
    solar_panel.broken += buildings_to_destroy
    damage -= buildings_to_destroy * solar_panel.health
    // This i a stupid way of doing this but it will do for now

}


function drone_swarm(delta_time){
    
    //All available tasks for drones to do
    const task_repair = damage
    const task_reconstruct = each_buildings.map(building=>building.broken)
    const task_construct = each_buildings.map(building=>building.scheduled_for_construction)


    const tasks_total = task_repair + sum_of_array(task_reconstruct) + sum_of_array(task_construct)

    if(tasks_total === 0){
        return
    }

    const drone_per_task = drone.amount / tasks_total

    const task_repair_factor = task_repair / tasks_total
    const task_reconstruct_factor = task_reconstruct.map(amount=>amount / tasks_total)
    const task_construct_factor = task_construct.map(amount=>amount / tasks_total)


    //All tasks that are possible to do with the current workforce
    let task_repair_scheduled
    let task_reconstruct_scheduled
    let task_construct_scheduled

    if (drone_per_task >= 1 || isNaN(drone_per_task)) {
        task_repair_scheduled = task_repair
        task_reconstruct_scheduled = task_reconstruct
        task_construct_scheduled = task_construct

        drone.working = tasks_total
    }else{
        task_repair_scheduled = task_repair_factor * drone.amount
        task_reconstruct_scheduled = task_reconstruct_factor.map(amount=>amount * drone.amount)
        task_construct_scheduled = task_construct_factor.map(amount=>amount * drone.amount)

        drone.working = drone.amount
    }


    //Actually doing the tasks
    //Repair
    damage -= task_repair_scheduled * drone.work_speed
    //Reconstruct
    each_buildings.forEach((building, i)=>{
        const work_done = relu(building.broken - task_reconstruct_scheduled[i] * drone.work_speed)
        building.broken -= work_done
        building.amount += work_done
    })
    //Construct
    each_buildings.forEach((building, i)=>{
        const work_done = task_construct_scheduled[i] * drone.work_speed
        building.scheduled_for_construction -= work_done
        building.amount += work_done
    })


    //Debug/warnings
    if (isNaN(damage)||task_construct_scheduled.filter(e=>isNaN(e))||task_reconstruct_scheduled.filter(e=>isNaN(e))) {
        console.warn('Detected NaN', 'task_construct', task_construct, 'task_construct_factor', task_construct_factor, 'task_construct_scheduled', task_construct_scheduled, 'task_reconstruct', task_reconstruct, 'task_reconstruct_factor', task_reconstruct_factor, 'task_reconstruct_scheduled', task_reconstruct_scheduled, 'task_repair', task_repair, 'task_repair_factor', task_repair_factor, 'task_repair_scheduled', task_repair_scheduled, 'tasks_total', tasks_total, 'damage', damage, 'drone.amount', drone.amount, 'drone.working', drone.working)
    }


    calculate_drone_build_material_debt()
}


function add_drone_construction_task(building, amount){
    if(building.cost * amount > material - drone_build_material_debt){return}
    building.scheduled_for_construction += amount
    calculate_drone_build_material_debt()
}


function calculate_drone_build_material_debt(){
    //Drone material debt is made to prevent you from ordering your drones to construct more than you can afford
    drone_build_material_debt = 0
    each_buildings.forEach(element => {
        drone_build_material_debt += element.scheduled_for_construction * element.cost
    });
}


bt = Date.now()
setInterval(main);
setInterval(spawn_enemies, 10000) // Separate infinite loop with 10sec interval for spawning enemies

function main(){
    {
    dt = (Date.now() - bt) * 0.001
    bt = Date.now()
    }//Set delta time
    assembler_priority()
    powergrid()
    military(dt)
    enemy_damage(dt)
    if(drone.amount > 0){drone_swarm(dt)}

    pollution = 0
    pollution += miner.amount * miner.pollution
    pollution += assembler.amount * assembler.pollution * satisfaction(assembler.amount, ore)
    
    ore += miner.amount * miner.speed * dt
    ore -= assembler.amount * satisfaction(assembler.amount, ore) * dt
    material += assembler.amount * satisfaction(assembler.amount, ore) * assembler_met_priority * dt
    ammunition += assembler.amount * satisfaction(assembler.amount, ore) * assembler_ammo_priority * dt
    drone.amount += assembler.amount * satisfaction(assembler.amount, ore) * assembler_drone_priority * dt

    enemies = Math.min(enemies, pollution * 2.2)
    
    if(pollution >= 50){unlock_military = true}
    if(damage > 0){unlock_repair = true}
    if(assembler.amount >= 200){unlock_drones = true}
    
    update_display()
}// main
