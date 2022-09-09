// Author : Utkarsh Pratap Singh

const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
canvas.width = innerWidth
canvas.height = innerHeight
const scoreEL = document.querySelector('#scoreEl')
const startGameBtn = document.querySelector('#startGameBtn')
const modelEl = document.querySelector('#modelEl')
const finalScore = document.querySelector('#finalScore')
// Creating the Player Class
class Player{
    constructor(x,y,radius,color){
        this.x = x
        this.y = y
        this.radius =  radius
        this.color = color
    }
    draw(){
        c.beginPath()
        c.arc(this.x, this.y , this.radius,
            0, Math.PI*2, false)
            c.fillStyle = this.color
        c.fill()
    }
}

// Creating the Projectile class 

class Projectile{
    constructor(x,y,radius, color, velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    draw(){
        c.beginPath()
        c.arc(this.x, this.y,this.radius,0,Math.PI*2,false)
        c.fillStyle = this.color
        c.fill()
    }
    update(){
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

//  Creating the Enemy class for  Enemies 
class Enemy{
    constructor(x,y,radius, color, velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    draw(){
        c.beginPath()
        c.arc(this.x, this.y,this.radius,0,Math.PI*2,false)
        c.fillStyle = this.color
        c.fill()
    }
    update(){
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

// Creating the particle class that shrinks after hitting
const friction = 0.99  // Frictiion to reduce the velocity after hitting
class Particle{
    constructor(x,y,radius, color, velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }
    draw(){
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y,this.radius,0,Math.PI*2,false)
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }
    update(){
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}
// <--------------------------------------------------End of Making Building blocks---------------------------------------->

// Creating The Player at the center of the browser 
const x = canvas.width / 2 
const y =  canvas.height / 2
let player = new Player(x,y,15,'white')
// Creating an array to hold the various projectiles, enemies and the bubbles that comes out aftet the hit
let projectiles = []
let enemies = []
let particles =[]
// <-------------------------------------------------------------------------------------------------------->

// ==========================Creating init() function that will reset the start menu
function init(){
     player = new Player(x,y,15,'white')
     projectiles = []
     enemies = []
     particles =[]
     score = 0
     scoreEL.innerHTML = score
     finalScore.innerHTML = score
}
//<--------------------------------------------------------------------------------------------------------------->

// ==============================Creating Enemies attack on the Player===============================================
function spawnEnemies(){
    setInterval(() =>{
        const radius = Math.random() * (40-8) + 8
        let x
        let y
        if(Math.random() < 0.5){
            x = Math.random() < 0.5 ? 0- radius: canvas.width + radius
            y = Math.random() * canvas.height
        }
        else{
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }
        const color = `hsl(${Math.random()*360},50%,50%)`
        const angle = Math.atan2(
            canvas.height / 2 - y ,
            canvas.width / 2 - x)
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        enemies.push(new Enemy(
            x,y,radius,color,velocity
        ))
    }, 1300)
}

// ======================================== End of Enemies Attack Initialization==================================


// <===== Creating the animation for the Game and the shooting, Shrinking and  destroying of the enemies========>


// Creating an animation function
let animationId
let score = 0
function animate(){
    animationId = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0,0,0,0.1)'
    c.fillRect(0,0,canvas.width,canvas.height)
    player.draw()
    particles.forEach((particle,index) =>{
        if(particle.alpha <= 0 ){
            particles.splice(index,1)
        }else{
            particle.update()
        }
    })
    projectiles.forEach((projectile , index) => {
        projectile.update()
        // Destroy the Projectiles after the edge of the screen  
        if( projectile.x - projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height ){
            setTimeout(()=>{
                    projectiles.splice(index,1)
                },0)
        }
     });
     enemies.forEach((enemy,index) =>{
            enemy.update()
            const dist  = Math.hypot(player.x-enemy.x, player.y - enemy.y)
            // Code to End the Game
            if(dist - enemy.radius - player.radius < 1) {
                cancelAnimationFrame(animationId)
                modelEl.style.display = 'flex'
                finalScore.innerHTML = score
            }

            projectiles.forEach((projectile,projectileIndex) =>{
            const dist  = Math.hypot(projectile.x-enemy.x, projectile.y - enemy.y)
            // When Projectiles touches the enemies
            if(dist - enemy.radius - projectile.radius < 1) {
                
                //----------------------------------------------
                // Making shrinking Particles
                // Create Shrinking Explosions
                for(let i =0; i < enemy.radius*2 ;i++){
                        particles.push(new Particle(
                        projectile.x, projectile.y,
                        Math.random()*2,enemy.color,
                        {x:(Math.random()-0.5)*(Math.random()*5),
                        y: (Math.random()-0.5)*(Math.random()*5)}
                    ))
                }
                if(enemy.radius -10  > 5){
                    // Increasing our score when enemy shrinks
                    score += 50
                    scoreEL.innerHTML = score
                    gsap.to(enemy,{
                        radius: enemy.radius-10
                    })
                    setTimeout(()=>{
                    projectiles.splice(projectileIndex,1)
                },0) 
                }
                else{
                     // Increasing our score when fully destroyed 
                    score += 100
                    scoreEL.innerHTML = score
                    setTimeout(()=>{
                        enemies.splice(index,1)
                        projectiles.splice(projectileIndex,1)
                        },0) 
            }
            }
        })
     });
}
// ============================
// End of creation of a player

// Creating Event Listner 
addEventListener('click', (Event)=>{
    console.log(projectiles)
    const angle = Math.atan2(Event.clientY- canvas.height / 2 ,  Event.clientX - canvas.width / 2)
    const velocity = {
        x: Math.cos(angle) * 4 ,
        y: Math.sin(angle) * 4
    }
    projectiles.push(new Projectile(
        canvas.width / 2,
        canvas.height / 2,
        5,
        'white',
        velocity
    ))
})

startGameBtn.addEventListener('click',()=>{
    init()
    animate()
    spawnEnemies()
    modelEl.style.display = 'none'
})
// <=======================================End of the Code=================================>