window.onload = main;
    const game = {
        current_angle: 0,
    };

    function main() {
        const canvas = document.querySelector('#gl_canvas');

        const gl = canvas.getContext("webgl");

        if (!gl) {
            alert("Unable to initialize WebGL");
        }
        const v_src = document.getElementById("vertex-shader").firstChild.nodeValue;
        const f_src = document.getElementById("fragment-shader").firstChild.nodeValue;
        const shader_program = initShaderProgram(gl, v_src, f_src);

        const program_info = {
            program: shader_program,
            attrib_locations: {
                vertex_positions:   gl.getAttribLocation(shader_program, 'aVertexPosition'),
                vertex_colors:      gl.getAttribLocation(shader_program, 'aVertexColors')
            },
            uniform_locations: {
                projection: gl.getUniformLocation(shader_program, 'uProjectionMatrix'),
                model_view: gl.getUniformLocation(shader_program, 'uModelViewMatrix')
            }
        };

        const buffers = initBuffers(gl);
        

        let then = 0;
        function render(now) {
            now *= 0.001; // convert to seconds
            const dt = now - then;
            drawScene(gl, program_info, buffers, game, dt);
            window.requestAnimationFrame(render);
        }

        render();
        //window.requestAnimationFrame(render);

    }

    


//    let current_angle = 0;

    function drawScene(gl, program_info, buffers, game, dt) {

        gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
        gl.clearDepth(1.0);                 // Clear everything
        gl.enable(gl.DEPTH_TEST);           // Enable depth testing
        gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const fov = (45.0 * Math.PI) / 180.0;
        const aspect_ratio = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const z_near = 0.1;
        const z_far = 1000.0;
        const projection_mat = mat4.create();
        
        mat4.perspective(
            projection_mat,
            fov,
            aspect_ratio,
            z_near,
            z_far
        );


        const model_view_mat = mat4.create();
        game.current_angle += 1.1;
        const radians = (game.current_angle * Math.PI) / 180.0;
        
        mat4.translate(model_view_mat, model_view_mat, [0.0, 0.0, -6.0]);
        mat4.rotate(model_view_mat, model_view_mat, radians, [0.0,1.0,0.3])


        {
            const VB = buffers.vertex;
            const pointer = program_info.attrib_locations.vertex_positions;

            gl.bindBuffer(gl.ARRAY_BUFFER, VB);
            gl.vertexAttribPointer(
                pointer,
                2,              // num components
                gl.FLOAT,       // type
                false,          // normalize
                0,              // stride
                0               // offset
            );
            gl.enableVertexAttribArray(pointer);
        }

        {
            const CB = buffers.colors;
            const pointer = program_info.attrib_locations.vertex_colors;

            gl.bindBuffer(gl.ARRAY_BUFFER, CB);
            gl.vertexAttribPointer(
                pointer,
                4,              // num components
                gl.FLOAT,       // type
                false,          // normalize
                0,              // stride
                0               // offset
            );
            gl.enableVertexAttribArray(pointer);
        }



        gl.useProgram(program_info.program);

        // Set matrix view model proj uniforms
        gl.uniformMatrix4fv( program_info.uniform_locations.projection,  false,  projection_mat );
        gl.uniformMatrix4fv( program_info.uniform_locations.model_view,  false,  model_view_mat );
        

        // DRAW
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }


    function initBuffers(gl) {

        const vertices = new Float32Array([
            1.0,  1.0,
            -1.0,  1.0,
            1.0, -1.0,
            -1.0, -1.0,
        ]);

        const colors = new Float32Array([
            1.0, 1.0, 1.0, 1.0,          // WHITE
            1.0, 0.0, 0.0, 1.0,          // RED
            0.0, 1.0, 0.0, 1.0,          // GREEN
            0.0, 0.0, 1.0, 1.0,          // BLUE
        ]);

        // Vertices
        const VB = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, VB);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        // Color
        const CB = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, CB);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        


        return { 
            vertex: VB,
            colors: CB 
        } ;
    }


    function loadShader(gl, type, src) {
        const shader = gl.createShader(type);

        gl.shaderSource(shader, src);
        gl.compileShader(shader);

        const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!success) {
            console.error("An error occured compiling shader: ", type);
            console.error(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);

            return null;
        }

        return shader;
    }


    function initShaderProgram(gl, vertex_src, fragment_src) {
        const vertex_shader     = loadShader(gl, gl.VERTEX_SHADER, vertex_src);
        const fragment_shader   = loadShader(gl, gl.FRAGMENT_SHADER, fragment_src);

        const program = gl.createProgram();
        gl.attachShader(program, vertex_shader);
        gl.attachShader(program, fragment_shader);
        gl.linkProgram(program);

        const status = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!status) {
            console.error("Unable to initialize shader program: ");
            console.error(gl.getProgramInfoLog(program));
            return null;
        }
        
        return program;
    }

    function getRelativeMousePosition(event, target) {
        target = target || event.target;
        var rect = target.getBoundingClientRect();
      
        return {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        }
      }
