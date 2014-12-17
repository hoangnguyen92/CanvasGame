var canvas,
    stage,
    sniperImage,
    rocketImage,
    explosionImage,
    sniperSpritesheet,
    rocketSpritesheet,
    explosionSpritesheet,
    speed,
    sniperAnimation,
    lineWidth,
    circle,
    isRunning,
    sniperRunning,
    lineMoving,
    line;
    
function init() {
    canvas = document.getElementById('demoCanvas')
    stage = new createjs.Stage(canvas);
    speed = 1;
    lineWidth = 400;
    isRunning = false;
    loadImage();

    stage.addEventListener("stagemousedown", click);   
	
    createjs.Ticker.addEventListener('tick',tick);
   
       
    drawLine(sniperAnimation.x,sniperAnimation.y-300);
}


function loadImage() {
    sniperImage = new Image();
    sniperImage.src = 'assets/sniper.png';
    var sniperData = {
        framerate: 60,
        images: [sniperImage],
        frames: {width:53, height:63, regX:12, regY:0},
        animations: {
            'run': [0, 7],
            'stay': [0,0]
        }
    }

    sniperSpritesheet = new createjs.SpriteSheet(sniperData);
    sniperAnimation = new createjs.Sprite(sniperSpritesheet);
    sniperAnimation.speed=10;
    sniperAnimation.x = canvas.width/2;
    sniperAnimation.y = canvas.height/2;

    stage.addChild(sniperAnimation); 
    
    
    stage.on("stagemousemove",mouseMove);   
    
    
    rocketImage = new Image();
    rocketImage.src = 'assets/rocket.png';
    var rocketData = {
        framerate: 60,
        images: [rocketImage],
        frames: {width:26, height:49, regX:13, regY:0},
        animations: {
            'fly': [0, 3]
        }
    }

    rocketSpritesheet = new createjs.SpriteSheet(rocketData);
    
    explosionImage = new Image();
    explosionImage.src = 'assets/explosion.png';
    var explosionData = {
        framerate: 60,
        images: [explosionImage],
        frames: {width:128, height:128, regX:64, regY:64},
        animations: {
            'explode': [0, 39]
        }
    }
    
    explosionSpritesheet = new createjs.SpriteSheet(explosionData);
}

function drawLine(toX,toY){
    
    line = new createjs.Shape();
    line.graphics.beginLinearGradientFill(["#252729", "rgb(255,0,0)"], [0, 1], 0, 50, 0,   130).drawRect(0, 0, 1, lineWidth);
    line.regX=0;
    line.regY=lineWidth;
    line.x=sniperAnimation.x;
    line.y=sniperAnimation.y;
    stage.addChild(line);
    
    
}

function mouseMove(event) {
    var angle = Math.atan2(stage.mouseY - sniperAnimation.y, stage.mouseX - sniperAnimation.x );
    angle = angle * (180/Math.PI);
    
    if(angle < 0){
        angle = 360 - (-angle);
    }
    
    var toY,toX;
    
    var lineAngle = angle;
    
    sniperAnimation.rotation = 90 + angle;
    
    line.rotation=90+angle;

}
function click(event){
    var distX = Math.abs(stage.mouseX - sniperAnimation.x);
    var distY = Math.abs(stage.mouseY - sniperAnimation.y);
    
    var movementDist = Math.sqrt(Math.pow(distX,2)+Math.pow(distY,2));
    movementDist = parseInt(movementDist);
    var positionToMoveX = stage.mouseX;
    var positionToMoveY = stage.mouseY;
    
    var duration = movementDist/speed;
    if(event.nativeEvent.button === 2){
        duration*=5;
        run(duration,positionToMoveX,positionToMoveY);
        movePointing(positionToMoveX,positionToMoveY);
    }else if(event.nativeEvent.button === 0){
        duration*=2;
        shoot(duration,positionToMoveX,positionToMoveY);
    }
}
function shoot(duration,positionToMoveX,positionToMoveY){
    var rocketAnimation = new createjs.Sprite(rocketSpritesheet);
        stage.addChild(rocketAnimation);
        rocketAnimation.x = sniperAnimation.x;
        rocketAnimation.y = sniperAnimation.y;
        rocketAnimation.rotation = sniperAnimation.rotation;
        
        rocketAnimation.gotoAndPlay('explode');
        createjs.Tween.get(rocketAnimation)
                        .to({x:positionToMoveX , y: positionToMoveY},duration)
                        .call(function(){
                            stage.removeChild(rocketAnimation);
                            endRocketAnimation(rocketAnimation,positionToMoveX,positionToMoveY);
                        }); 
}
function endRocketAnimation(rocketAnimation,positionToMoveX,positionToMoveY) {
    stage.removeChild(rocketAnimation);
    explode(positionToMoveX,positionToMoveY);
}
function explode(positionToMoveX,positionToMoveY){
    var explosionAnimation = new createjs.Sprite(explosionSpritesheet);
    stage.addChild(explosionAnimation);
    explosionAnimation.x = positionToMoveX;
    explosionAnimation.y = positionToMoveY;
    explosionAnimation.gotoAndPlay('explode');
    explosionAnimation.on("animationend", function(event) {
       stage.removeChild(explosionAnimation);
    });
}

function movePointing(positionToMoveX,positionToMoveY){
    circle = new createjs.Shape();
    circle.graphics.setStrokeStyle(1).beginStroke("rgb(255,0,0)").drawCircle(positionToMoveX,positionToMoveY,20);
    stage.addChild(circle);
    
    createjs.Tween.get(circle).to({scaleX:0,scaleY:0,x:positionToMoveX , y: positionToMoveY}, 1000).call(destroyCircleAnimation);
    
}
function destroyCircleAnimation(){
    stage.removeChild(circle);
}
function run(duration,positionToMoveX,positionToMoveY){
    if(isRunning){
        // sniperAnimation.gotoAndStop('stay');
        createjs.Tween.removeTweens(sniperRunning);
        createjs.Tween.removeTweens(lineMoving);
        setTimeout(function() {
            sniperRunning = createjs.Tween.get(sniperAnimation).to({x:positionToMoveX , y: positionToMoveY},duration).call(completeMoving);
            sniperAnimation.gotoAndPlay('run');
        }, 10);
        
    }
    sniperRunning = createjs.Tween.get(sniperAnimation).to({x:positionToMoveX , y: positionToMoveY},duration).call(completeMoving); 
    lineMoving = createjs.Tween.get(line).to({x:positionToMoveX , y: positionToMoveY},duration).call(completeMoving); 
    sniperAnimation.gotoAndPlay('run');
    isRunning=true;
}
function completeMoving() {
    sniperAnimation.gotoAndStop('stay');
    createjs.Tween.removeTweens(sniperRunning);
    createjs.Tween.removeTweens(lineMoving);
    isRunning = false
}

function tick(){
    
    stage.update();
}