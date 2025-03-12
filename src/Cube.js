class Cube{
    constructor(){
        this.type="cube";
        //this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        //this.size = 5.0;
        //this.segments = 10;
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();
        this.textureNum = -2;
        this.lighting = 1;
    }

    changeColor(){
        var rgba = this.color;
        gl.uniform4f(u_FragColor, rgba[0]*this.lighting, rgba[1]*this.lighting, rgba[2]*this.lighting, rgba[3]);
    }

    drawCube(){

        this.changeColor();
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        //Front

        drawTriangle3D( [0,0,0,  1,1,0,  1,0,0] );
        
        drawTriangle3D( [0,0,0,  0,1,0,  1,1,0] );


        //Top 

        this.lighting = 0.9;
        this.changeColor();

        drawTriangle3D( [0,1,0,  0,1,1,  1,1,1] );

        drawTriangle3D( [0,1,0,  1,1,1,  1,1,0] );    


        //Left 

        this.lighting = 0.8;
        this.changeColor();

        drawTriangle3D( [0,1,0,  0,0,1,  0,1,1] );
        drawTriangle3D( [0,1,0,  0,0,0,  0,0,1] );

        //Back

        this.lighting = 0.7;
        this.changeColor();         

        drawTriangle3D( [0,0,1,  1,1,1,  1,0,1] );
        
        drawTriangle3D( [0,0,1,  0,1,1,  1,1,1] );        

        //Bottom 

        this.lighting = 0.6;
        this.changeColor();

        drawTriangle3D( [0,0,0,  0,0,1,  1,0,1] );

        drawTriangle3D( [0,0,0,  1,0,1,  1,0,0] );   

        //Right 

        this.lighting = 0.5;
        this.changeColor();

        drawTriangle3D( [1,1,0,  1,0,1,  1,1,1] );
        drawTriangle3D( [1,1,0,  1,0,0,  1,0,1] );
    }

    render(){
        var rgba = this.color; 

        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);

        //Front
        drawTriangle3DUVNormal([0,0,0, 1,1,0, 1,0,0],
            [0,0, 1,1, 1,0],
            [0,0,-1, 0,0,-1, 0,0,-1]);
        drawTriangle3DUVNormal([0,0,0, 0,1,0, 1,1,0],
                [0,0, 0,1, 1,1],
                [0,0,-1, 0,0,-1, 0,0,-1]);


        //gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
        //Top
        drawTriangle3DUVNormal([0,1,0, 0,1,1, 1,1,1],
            [0,1, 0,0, 1,0],
            [0,1,0, 0,1,0, 0,1,0]);
        drawTriangle3DUVNormal([0,1,0, 1,1,1, 1,1,0],
                [0,1, 1,0, 1,1],
                [0,1,0, 0,1,0, 0,1,0]);        


        //gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
        //Right
        drawTriangle3DUVNormal([1,1,0, 1,1,1, 1,0,0],
            [0,0, 1,1, 0,1],
            [1,0,0, 1,0,0, 1,0,0]);
        drawTriangle3DUVNormal([1,0,0, 1,1,1, 1,0,1],
                [0,0, 1,0, 1,1],
                [1,0,0, 1,0,0, 1,0,0]);    


        //gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]);
        //Left
        drawTriangle3DUVNormal([0,1,0, 0,1,1, 0,0,0],
            [1,0, 0,1, 1,1],
            [-1,0,0, -1,0,0, -1,0,0]);
        drawTriangle3DUVNormal([0,0,0, 0,1,1, 0,0,1],
                [1,0, 0,0, 0,1],
                [-1,0,0, -1,0,0, -1,0,0]);    

        //gl.uniform4f(u_FragColor, rgba[0]*.6, rgba[1]*.6, rgba[2]*.6, rgba[3]);
        //Bottom
        drawTriangle3DUVNormal([0,0,0, 0,0,1, 1,0,1],
            [0,0, 0,1, 1,1],
            [0,-1,0, 0,-1,0, 0,-1,0]);
        drawTriangle3DUVNormal([0,0,0, 1,0,1, 1,0,0],
                [0,0, 1,1, 1,0],
                [0,-1,0, 0,-1,0, 0,-1,0]); 

        //gl.uniform4f(u_FragColor, rgba[0]*.5, rgba[1]*.5, rgba[2]*.5, rgba[3]);
        //Back
        drawTriangle3DUVNormal([0,0,1, 1,1,1, 1,0,1],
            [0,0, 1,1, 1,0],
            [0,0,1, 0,0,1, 0,0,1]);
        drawTriangle3DUVNormal([0,0,1, 0,1,1, 1,1,1],
                [0,0, 0,1, 1,1],
                [0,0,1, 0,0,1, 0,0,1]); 
    }
    
}