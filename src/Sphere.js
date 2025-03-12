class Sphere{
    constructor(r=0.12, s=20){
        this.type = 'sphere';
        this.radius = r;
        this.segments = s;
        this.color = [255/255,160/255,14/255,255/255];
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();
        this.textureNum = -2;
        this.vert32 = new Float32Array([]);
    }   

    polarToCart(rad, angle, phi){
        let one = rad * Math.sin(angle) * Math.cos(phi);
        let two = rad * Math.cos(angle);
        let three = rad * Math.sin(angle) * Math.sin(phi);

        return [one, two, three];
    }

    drawSphere(){
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);

        for(let x = 0; x < this.segments; x++){
            let ang1 = (x / this.segments) * Math.PI;
            let ang2 = ((x+1) / this.segments) * Math.PI;

            for (let y = 0; y < this.segments; y++){
                let p1 = (y / this.segments) * 2 * Math.PI;
                let p2 = ((y + 1) / this.segments) * 2 * Math.PI;

                let uno = this.polarToCart(this.radius, ang1, p1);
                let dos = this.polarToCart(this.radius, ang2, p1);
                let tres = this.polarToCart(this.radius, ang1, p2);
                let qua = this.polarToCart(this.radius, ang2, p2);

                drawTriangle3D([...uno, ...dos, ...tres]);
                drawTriangle3D([...dos, ...qua, ...tres]);
            }
        }
    }

    render(){
        var rgba = this.color; 
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        var d = Math.PI/10;
        var dd = Math.PI/10;

        for(var t = 0; t < Math.PI; t += d){
            for(var r = 0; r < (2*Math.PI); r += d){
                var p1 = [Math.sin(t)*Math.cos(r), Math.sin(t)*Math.sin(r), Math.cos(t)];
                var p2 = [Math.sin(t+dd)*Math.cos(r), Math.sin(t+dd)*Math.sin(r), Math.cos(t+dd)];
                var p3 = [Math.sin(t)*Math.cos(r+dd), Math.sin(t)*Math.sin(r+dd), Math.cos(t)];
                var p4 = [Math.sin(t+dd)*Math.cos(r+dd), Math.sin(t+dd)*Math.sin(r+dd), Math.cos(t+dd)];

                var uv1 = [t/Math.PI, r/(2*Math.PI)];
                var uv2 = [(t+dd)/Math.PI, r/(2*Math.PI)];
                var uv3 = [(t)/Math.PI, (r+dd)/(2*Math.PI)];
                var uv4 = [(t+dd)/Math.PI, (r+dd)/(2*Math.PI)];

                var v = [];
                var uv = [];
                v = v.concat(p1); uv = uv.concat(uv1);
                v = v.concat(p2); uv = uv.concat(uv2);
                v = v.concat(p4); uv = uv.concat(uv4);
                gl.uniform4f(u_FragColor, 1,1,1,1);
                drawTriangle3DUVNormal(v,uv,v);

                v = [];
                uv = [];
                v = v.concat(p1); uv = uv.concat(uv1);
                v = v.concat(p4); uv = uv.concat(uv4);
                v = v.concat(p3); uv = uv.concat(uv3);
                gl.uniform4f(u_FragColor, 1,0,0,1);
                drawTriangle3DUVNormal(v,uv,v);
            }
        }
    }
}